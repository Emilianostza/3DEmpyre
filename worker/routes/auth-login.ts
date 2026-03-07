/**
 * Cloudflare Worker Route: Auth Login
 *
 * Ported from netlify/functions/auth-login.ts.
 * Authenticates user via Supabase, sets HttpOnly cookies with tokens,
 * and returns user profile + Supabase session for client-side RLS sync.
 *
 * POST /api/auth/login
 * Body: { email, password, orgSlug? }
 */

import { createClient } from '@supabase/supabase-js';
import { buildAuthCookieHeaders, jsonResponse } from '../shared/cookies';
import { generateCSRFToken } from '../shared/csrf';
import { buildRoleFromProfile } from '../shared/roles';
import type { Env } from '../shared/types';

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[auth-login] Missing Supabase config');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  if (!env.SUPABASE_ANON_KEY) {
    console.error('[auth-login] Missing anon key');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let email: string;
  let password: string;
  try {
    const body = await request.json() as { email?: string; password?: string };
    email = body.email || '';
    password = body.password || '';
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!email || !password) {
    return jsonResponse(400, { error: 'Email and password are required' });
  }

  // ── Authenticate ────────────────────────────────────────────────────────────
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Use the anon-key client for signInWithPassword (service role can't do password auth)
  const anonClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.session) {
    return jsonResponse(401, {
      error: authError?.message || 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
    });
  }

  // ── Fetch profile ───────────────────────────────────────────────────────────
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('*, user_org_memberships(*)')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profileData) {
    console.error('[auth-login] Profile fetch failed:', profileError?.message);
    return jsonResponse(401, {
      error: 'User profile not found. Please contact an administrator.',
      code: 'INVALID_USER',
    });
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

  // ── Set cookies & respond ───────────────────────────────────────────────────
  const csrfToken = generateCSRFToken();
  const cookies = buildAuthCookieHeaders(
    authData.session.access_token,
    authData.session.refresh_token || '',
    csrfToken,
    env.ENVIRONMENT,
  );

  return jsonResponse(
    200,
    {
      user: userDTO,
      expiresIn: 3600,
      supabaseSession: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      },
    },
    cookies,
  );
}
