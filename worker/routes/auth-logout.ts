/**
 * Cloudflare Worker Route: Auth Logout
 *
 * Ported from netlify/functions/auth-logout.ts.
 * Clears HttpOnly auth cookies and signs out via Supabase admin API.
 *
 * POST /api/auth/logout
 * Headers: X-CSRF-Token: <csrf-value>
 * Cookies: mc_access_token
 */

import { createClient } from '@supabase/supabase-js';
import { extractTokenFromRequest, buildClearCookieHeaders, jsonResponse } from '../shared/cookies';
import { validateCSRF } from '../shared/csrf';
import type { Env } from '../shared/types';

export async function handleLogout(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── CSRF validation ─────────────────────────────────────────────────────────
  if (!validateCSRF(request)) {
    return jsonResponse(403, { error: 'Invalid or missing CSRF token' });
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[auth-logout] Missing Supabase config');
    // Still clear cookies even if we can't reach Supabase
    return jsonResponse(200, { success: true }, buildClearCookieHeaders(env.ENVIRONMENT));
  }

  // ── Revoke server-side ──────────────────────────────────────────────────────
  const accessToken = extractTokenFromRequest(request);
  if (accessToken) {
    try {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
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
  return jsonResponse(200, { success: true }, buildClearCookieHeaders(env.ENVIRONMENT));
}
