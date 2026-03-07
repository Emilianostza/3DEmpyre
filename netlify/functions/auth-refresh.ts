/**
 * Netlify Function: Auth Token Refresh Proxy
 *
 * Reads the refresh token from HttpOnly cookie, obtains new tokens
 * from Supabase, and updates cookies. Returns new Supabase session
 * for client-side RLS sync.
 *
 * POST /api/auth/refresh
 * Headers: X-CSRF-Token: <csrf-value>
 * Cookies: mc_refresh_token
 *
 * Response: {
 *   expiresIn: number,
 *   supabaseSession: { access_token, refresh_token }
 * }
 */

import { createClient } from '@supabase/supabase-js';
import {
  extractRefreshTokenFromRequest,
  buildAuthCookieHeaders,
  jsonResponse,
} from './_shared/cookies';
import { generateCSRFToken, validateCSRF } from './_shared/csrf';

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

type Handler = (event: NetlifyEvent) => Promise<{
  statusCode: number;
  headers: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body: string;
}>;

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── CSRF validation ─────────────────────────────────────────────────────────
  if (!validateCSRF(event)) {
    return jsonResponse(403, { error: 'Invalid or missing CSRF token' });
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[auth-refresh] Missing Supabase config');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  // ── Extract refresh token from cookie ───────────────────────────────────────
  const refreshToken = extractRefreshTokenFromRequest(event);
  if (!refreshToken) {
    return jsonResponse(401, { error: 'No refresh token', code: 'NO_REFRESH_TOKEN' });
  }

  // ── Refresh session ─────────────────────────────────────────────────────────
  // Use anon key for auth operations (service role can't do session refresh)
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    console.error('[auth-refresh] Missing anon key');
    return jsonResponse(500, { error: 'Server configuration error' });
  }
  const supabase = createClient(supabaseUrl, anonKey);

  const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (refreshError || !sessionData.session) {
    console.error('[auth-refresh] Refresh failed:', refreshError?.message);
    return jsonResponse(401, {
      error: 'Token refresh failed',
      code: 'REFRESH_FAILED',
    });
  }

  // ── Update cookies ──────────────────────────────────────────────────────────
  const csrfToken = generateCSRFToken();
  const cookies = buildAuthCookieHeaders(
    sessionData.session.access_token,
    sessionData.session.refresh_token || '',
    csrfToken
  );

  return jsonResponse(
    200,
    {
      expiresIn: 3600,
      supabaseSession: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      },
    },
    cookies
  );
};

export { handler };
