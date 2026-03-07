/**
 * Cloudflare Worker Route: Auth Token Refresh
 *
 * Ported from netlify/functions/auth-refresh.ts.
 * Reads the refresh token from HttpOnly cookie, obtains new tokens
 * from Supabase, and updates cookies.
 *
 * POST /api/auth/refresh
 * Headers: X-CSRF-Token: <csrf-value>
 * Cookies: mc_refresh_token
 */

import { createClient } from '@supabase/supabase-js';
import {
  extractRefreshTokenFromRequest,
  buildAuthCookieHeaders,
  jsonResponse,
} from '../shared/cookies';
import { generateCSRFToken, validateCSRF } from '../shared/csrf';
import type { Env } from '../shared/types';

export async function handleRefresh(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── CSRF validation ─────────────────────────────────────────────────────────
  if (!validateCSRF(request)) {
    return jsonResponse(403, { error: 'Invalid or missing CSRF token' });
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[auth-refresh] Missing Supabase config');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  if (!env.SUPABASE_ANON_KEY) {
    console.error('[auth-refresh] Missing anon key');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  // ── Extract refresh token from cookie ───────────────────────────────────────
  const refreshToken = extractRefreshTokenFromRequest(request);
  if (!refreshToken) {
    return jsonResponse(401, { error: 'No refresh token', code: 'NO_REFRESH_TOKEN' });
  }

  // ── Refresh session ─────────────────────────────────────────────────────────
  // Use anon key for auth operations (service role can't do session refresh)
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

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
    csrfToken,
    env.ENVIRONMENT,
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
    cookies,
  );
}
