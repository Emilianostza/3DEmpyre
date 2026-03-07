/**
 * Cloudflare Worker Route: Auth Session Check
 *
 * Ported from netlify/functions/auth-session.ts.
 * Validates the access token cookie and returns the user profile.
 * Used for session restore on page load.
 *
 * GET /api/auth/session
 * Cookies: mc_access_token
 */

import { createClient } from '@supabase/supabase-js';
import { extractTokenFromRequest, jsonResponse } from '../shared/cookies';
import { buildRoleFromProfile } from '../shared/roles';
import type { Env } from '../shared/types';

export async function handleSession(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[auth-session] Missing Supabase config');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  // ── Extract token ───────────────────────────────────────────────────────────
  const accessToken = extractTokenFromRequest(request);
  if (!accessToken) {
    return jsonResponse(401, { error: 'No session', code: 'NO_SESSION' });
  }

  // ── Validate token & fetch profile ──────────────────────────────────────────
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData?.user) {
    return jsonResponse(401, { error: 'Invalid or expired session', code: 'INVALID_TOKEN' });
  }

  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('*, user_org_memberships(*)')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profileData) {
    console.error('[auth-session] Profile fetch failed:', profileError?.message);
    return jsonResponse(401, { error: 'User profile not found', code: 'INVALID_USER' });
  }

  // ── Build user DTO ──────────────────────────────────────────────────────────
  const role = buildRoleFromProfile(profileData);
  const userDTO = {
    id: authData.user.id,
    orgId: profileData.org_id || '',
    email: authData.user.email || '',
    name: profileData.name || '',
    role,
    status: profileData.status || 'active',
    mfaEnabled: profileData.mfa_enabled || false,
    failedLoginAttempts: profileData.failed_login_attempts || 0,
    customerId: profileData.customer_id || undefined,
    createdAt: profileData.created_at || new Date().toISOString(),
    updatedAt: profileData.updated_at || new Date().toISOString(),
  };

  return jsonResponse(200, { user: userDTO, expiresIn: 3600 });
}
