/**
 * Netlify Function: Auth Logout Proxy
 *
 * Clears HttpOnly auth cookies and signs out via Supabase admin API.
 *
 * POST /api/auth/logout
 * Headers: X-CSRF-Token: <csrf-value>
 * Cookies: mc_access_token
 *
 * Response: { success: true }
 */

import { createClient } from '@supabase/supabase-js';
import { extractTokenFromRequest, buildClearCookieHeaders, jsonResponse } from './_shared/cookies';
import { validateCSRF } from './_shared/csrf';

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
    console.error('[auth-logout] Missing Supabase config');
    // Still clear cookies even if we can't reach Supabase
    return jsonResponse(200, { success: true }, buildClearCookieHeaders());
  }

  // ── Revoke server-side ──────────────────────────────────────────────────────
  const accessToken = extractTokenFromRequest(event);
  if (accessToken) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      // Identify user from token, then sign them out
      const { data: userData } = await supabase.auth.getUser(accessToken);
      if (userData?.user) {
        await supabase.auth.admin.signOut(userData.user.id);
      }
    } catch (err) {
      // Log but don't fail — clearing cookies is the primary goal
      console.warn('[auth-logout] Server-side revocation failed:', err);
    }
  }

  // ── Clear cookies ───────────────────────────────────────────────────────────
  return jsonResponse(200, { success: true }, buildClearCookieHeaders());
};

export { handler };
