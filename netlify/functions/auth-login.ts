/**
 * Netlify Function: Auth Login Proxy
 *
 * Authenticates user via Supabase, sets HttpOnly cookies with tokens,
 * and returns user profile + Supabase session for client-side RLS sync.
 *
 * POST /api/auth/login
 * Body: { email, password, orgSlug? }
 *
 * Response: {
 *   user: UserProfileDTO,
 *   expiresIn: number,
 *   supabaseSession: { access_token, refresh_token }
 * }
 *
 * Sets cookies: mc_access_token, mc_refresh_token, mc_csrf
 */

import { createClient } from '@supabase/supabase-js';
import { buildAuthCookieHeaders, jsonResponse } from './_shared/cookies';
import { generateCSRFToken } from './_shared/csrf';

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

/**
 * Build typed role object from DB profile data.
 * Mirrors src/services/api/auth.ts buildRoleFromProfile().
 */
function buildRoleFromProfile(profileData: {
  role?: string;
  org_id?: string;
  customer_id?: string;
  assigned_project_ids?: string[];
  [key: string]: unknown;
}): Record<string, unknown> {
  const roleType = profileData.role || 'customer_owner';
  const orgId = profileData.org_id || '';

  switch (roleType) {
    case 'admin':
      return { type: 'admin', orgId };
    case 'approver':
      return { type: 'approver', orgId };
    case 'technician':
      return {
        type: 'technician',
        orgId,
        assignedProjectIds: profileData.assigned_project_ids || [],
      };
    case 'sales_lead':
      return { type: 'sales_lead', orgId };
    case 'customer_owner':
      return {
        type: 'customer_owner',
        orgId,
        customerId: profileData.customer_id || orgId,
      };
    case 'customer_viewer':
      return {
        type: 'customer_viewer',
        orgId,
        customerId: profileData.customer_id || orgId,
        assignedProjectIds: profileData.assigned_project_ids || [],
      };
    case 'super_admin':
      return { type: 'super_admin', orgId };
    case 'public_visitor':
      return { type: 'public_visitor', orgId };
    default:
      return { type: 'customer_owner', orgId, customerId: orgId };
  }
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[auth-login] Missing Supabase config');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let email: string;
  let password: string;
  // orgSlug reserved for future multi-org login
  try {
    const body = JSON.parse(event.body || '{}');
    email = body.email;
    password = body.password;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!email || !password) {
    return jsonResponse(400, { error: 'Email and password are required' });
  }

  // ── Authenticate ────────────────────────────────────────────────────────────
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Use the anon-key client for signInWithPassword (service role can't do password auth)
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    console.error('[auth-login] Missing anon key');
    return jsonResponse(500, { error: 'Server configuration error' });
  }
  const anonClient = createClient(supabaseUrl, anonKey);

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
    csrfToken
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
    cookies
  );
};

export { handler };
