/**
 * Netlify Function: Auth Session Check
 *
 * Validates the access token cookie and returns the user profile.
 * Used for session restore on page load (replaces localStorage token check).
 *
 * GET /api/auth/session
 * Cookies: mc_access_token
 *
 * Response: {
 *   user: UserProfileDTO,
 *   expiresIn: number
 * }
 */

import { createClient } from '@supabase/supabase-js';
import { extractTokenFromRequest, jsonResponse } from './_shared/cookies';

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
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[auth-session] Missing Supabase config');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  // ── Extract token ───────────────────────────────────────────────────────────
  const accessToken = extractTokenFromRequest(event);
  if (!accessToken) {
    return jsonResponse(401, { error: 'No session', code: 'NO_SESSION' });
  }

  // ── Validate token & fetch profile ──────────────────────────────────────────
  const supabase = createClient(supabaseUrl, serviceRoleKey);

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
};

export { handler };
