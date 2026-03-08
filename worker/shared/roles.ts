/**
 * Role builder — shared by auth-login and auth-session route handlers.
 *
 * Extracted from the duplicated copies in the Netlify functions.
 * Mirrors src/services/api/auth.ts buildRoleFromProfile().
 */

export interface ProfileData {
  role?: string;
  org_id?: string;
  customer_id?: string;
  assigned_project_ids?: string[];
  [key: string]: unknown;
}

export function buildRoleFromProfile(profileData: ProfileData): Record<string, unknown> {
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
