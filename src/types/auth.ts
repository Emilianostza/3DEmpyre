/**
 * PHASE 2: Authentication & Role Enforcement Types
 *
 * Strict type safety with:
 * - Organization-first scoping (all entities have orgId)
 * - State machines as types (user status lifecycle)
 * - Roles as discriminated unions
 * - Audit trail types
 * - GDPR compliance fields
 * - Type boundaries (Domain ↔ DTO ↔ API)
 */
import { Industry } from '@/types';

// ============================================================================
// DOMAIN TYPES (Internal Business Logic)
// ============================================================================

// --- Enums & Constants ---

export const COUNTRIES = ['ee', 'gr', 'fr', 'us', 'gb'] as const;
export type CountryCode = (typeof COUNTRIES)[number];

export const REGIONS = ['eu', 'na', 'apac'] as const;
export type Region = (typeof REGIONS)[number];

export const USER_STATUSES = ['invited', 'active', 'suspended', 'deactivated'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_ROLES = [
  'admin',
  'approver',
  'technician',
  'sales_lead',
  'super_admin',
  'customer_owner',
  'customer_viewer',
  'public_visitor',
] as const;
export type UserRoleType = (typeof USER_ROLES)[number];

// --- State Machine Transitions ---

export const VALID_STATUS_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  invited: ['active', 'deactivated'],
  active: ['suspended', 'deactivated'],
  suspended: ['active', 'deactivated'],
  deactivated: [], // Terminal state
};

export function canTransitionStatus(from: UserStatus, to: UserStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to);
}

// --- Organization ---

export interface Organization {
  id: string;
  name: string;
  slug: string;
  countryCode: CountryCode;
  region: Region;

  // GDPR
  gdprConsent: boolean;
  dataRetentionDays: number;

  // Contact
  contactEmail?: string;
  contactPhone?: string;

  // Metadata
  metadata: Record<string, unknown>;
  industry?: Industry; // Customer's industry vertical

  // Timestamps
  createdAt: string; // ISO 8601
  updatedAt: string;
  deletedAt?: string;
}

// --- Roles Enum (for form selects, API enums) ---

export enum UserRoleEnum {
  ADMIN = 'admin',
  APPROVER = 'approver',
  TECHNICIAN = 'technician',
  SALES_LEAD = 'sales_lead',
  CUSTOMER_OWNER = 'customer_owner',
  CUSTOMER_VIEWER = 'customer_viewer',
  PUBLIC_VISITOR = 'public_visitor',
}

// --- User Role (Discriminated Union) ---

export type UserRole =
  | { type: 'admin'; orgId: string }
  | { type: 'approver'; orgId: string }
  | { type: 'technician'; orgId: string; assignedProjectIds: string[] }
  | { type: 'sales_lead'; orgId: string }
  | { type: 'super_admin'; orgId: string }
  | { type: 'customer_owner'; orgId: string; customerId: string }
  | { type: 'customer_viewer'; orgId: string; customerId: string; assignedProjectIds: string[] }
  | { type: 'public_visitor'; orgId: string };

// Type guards
export function isAdmin(role: UserRole): role is Extract<UserRole, { type: 'admin' }> {
  return role.type === 'admin';
}

export function isCustomerRole(
  role: UserRole
): role is Extract<UserRole, { type: 'customer_owner' | 'customer_viewer' }> {
  return role.type === 'customer_owner' || role.type === 'customer_viewer';
}

export function isEmployeeRole(
  role: UserRole
): role is Extract<
  UserRole,
  { type: 'admin' | 'approver' | 'technician' | 'sales_lead' | 'super_admin' }
> {
  return ['admin', 'approver', 'technician', 'sales_lead', 'super_admin'].includes(role.type);
}

// --- User ---

export interface User {
  id: string;
  orgId: string; // REQUIRED - org-scoped

  // Identity
  email: string;
  name: string;

  // Role & Status
  role: UserRole;
  status: UserStatus;

  // Optional foreign keys
  customerId?: string;

  // Security
  mfaEnabled: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;

  // Invitation
  invitedBy?: string;
  invitedAt?: string;
  activatedAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// --- Organization Membership ---

/**
 * OrgMembership links a user to an organization with an explicit role.
 * This is separate from User to allow:
 * - Users in multiple organizations
 * - Different roles in different orgs
 * - Explicit membership tracking for audit/billing
 */
export interface OrgMembership {
  id: string;
  orgId: string;
  userId: string;

  // Membership role (independent of user.role)
  role: UserRoleType;

  // Status
  status: 'invited' | 'active' | 'inactive';

  // When role was granted
  roleAssignedAt: string;
  roleAssignedBy?: string;

  // Metadata for role context (e.g., which projects assigned to technician)
  metadata?: Record<string, unknown>;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// --- Auth Session ---

export interface AuthSession {
  id: string;
  userId: string;
  orgId: string;

  // Token
  refreshTokenHash: string;
  accessTokenJti?: string; // JWT ID for revocation

  // Session metadata
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;

  // Expiry
  expiresAt: string;
  lastUsedAt: string;

  // Revocation
  revokedAt?: string;
  revokedReason?: string;

  // Timestamps
  createdAt: string;
}

// --- Auth Audit Log ---

export const AUTH_ACTIONS = [
  'user_invited',
  'user_activated',
  'user_logged_in',
  'user_logged_out',
  'user_suspended',
  'user_deactivated',
  'password_changed',
  'token_refreshed',
  'login_failed',
  'password_reset_requested',
  'password_reset_completed',
  'mfa_enabled',
  'mfa_disabled',
] as const;
export type AuthAction = (typeof AUTH_ACTIONS)[number];

export interface AuthAuditLog {
  id: string;
  orgId: string;
  userId?: string;

  // Event
  action: AuthAction;
  timestamp: string;

  // Actor context
  actorEmail?: string;
  actorRole?: UserRoleType;

  // Request context
  ipAddress?: string;
  userAgent?: string;

  // Payload
  metadata: Record<string, unknown>;

  // Result
  success: boolean;
  errorMessage?: string;
}

// ============================================================================
// DTO TYPES (API Request/Response)
// ============================================================================

// --- Login ---

export interface LoginRequestDTO {
  email: string;
  password: string;
  orgSlug?: string; // Optional if email is unique globally
}

export interface LoginResponseDTO {
  user: UserProfileDTO;
  token: string;
  refreshToken: string;
  expiresIn: number; // Seconds
}

// --- Token Refresh ---

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface RefreshTokenResponseDTO {
  token: string;
  expiresIn: number;
}

// --- User Profile ---

export interface UserProfileDTO {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: string; // Serialized as string for API
  status: UserStatus;
  customerId?: string;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- User Creation (Invite) ---

export interface CreateUserRequestDTO {
  email: string;
  name: string;
  role: UserRoleType;
  customerId?: string;
  sendInviteEmail?: boolean;
}

export interface CreateUserResponseDTO {
  user: UserProfileDTO;
  inviteToken?: string; // One-time token for password setup
}

// --- User Update ---

export interface UpdateUserRequestDTO {
  name?: string;
  role?: UserRoleType;
  status?: UserStatus;
  customerId?: string;
}

// --- Password Change ---

export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
}

// --- Password Reset ---

export interface RequestPasswordResetDTO {
  email: string;
  orgSlug?: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

// ============================================================================
// TYPE MAPPERS (Domain ↔ DTO)
// ============================================================================

// --- User Mappers ---

export function userToDTO(user: User): UserProfileDTO {
  return {
    id: user.id,
    orgId: user.orgId,
    email: user.email,
    name: user.name,
    role: user.role.type, // Serialize role as string
    status: user.status,
    customerId: user.customerId,
    mfaEnabled: user.mfaEnabled,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function userFromDTO(dto: UserProfileDTO, roleDetails?: Partial<UserRole>): User {
  // Reconstruct role from string + additional context
  const role: UserRole = roleDetails
    ? ({ type: dto.role as UserRoleType, orgId: dto.orgId, ...roleDetails } as UserRole)
    : ({
        type: dto.role as UserRoleType,
        orgId: dto.orgId,
        customerId: dto.customerId,
        assignedProjectIds: [], // Default to empty if not in DTO
      } as UserRole);

  return {
    id: dto.id,
    orgId: dto.orgId,
    email: dto.email,
    name: dto.name,
    role,
    status: dto.status,
    customerId: dto.customerId,
    mfaEnabled: dto.mfaEnabled,
    lastLoginAt: dto.lastLoginAt,
    failedLoginAttempts: 0,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

// --- Organization Mappers ---

export function organizationToDTO(org: Organization): Record<string, unknown> {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    country_code: org.countryCode,
    region: org.region,
    gdpr_consent: org.gdprConsent,
    data_retention_days: org.dataRetentionDays,
    contact_email: org.contactEmail,
    contact_phone: org.contactPhone,
    metadata: org.metadata,
    created_at: org.createdAt,
    updated_at: org.updatedAt,
    deleted_at: org.deletedAt,
  };
}

export function organizationFromDTO(dto: {
  id: string;
  name: string;
  slug: string;
  country_code: CountryCode;
  region: Region;
  gdpr_consent?: boolean;
  data_retention_days?: number;
  contact_email?: string;
  contact_phone?: string;
  metadata?: Record<string, unknown>;
  industry?: Industry;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}): Organization {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    countryCode: dto.country_code,
    region: dto.region,
    gdprConsent: Boolean(dto.gdpr_consent),
    dataRetentionDays: Number(dto.data_retention_days) || 30,
    contactEmail: dto.contact_email,
    contactPhone: dto.contact_phone,
    metadata: dto.metadata || {},
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    deletedAt: dto.deleted_at,
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function isValidSlug(slug: string): boolean {
  // Only lowercase letters, numbers, hyphens
  return /^[a-z0-9-]+$/.test(slug);
}

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

export interface Permission {
  resource: string;
  action: 'read' | 'create' | 'update' | 'delete';
  orgId: string;
  projectId?: string;
}

export function hasPermission(user: User, permission: Permission): boolean {
  // Org boundary check
  if (user.orgId !== permission.orgId) {
    return false;
  }

  const role = user.role;

  // Admin and super_admin have all permissions in their org
  if (isAdmin(role) || role.type === 'super_admin') {
    return true;
  }

  // Resource-specific checks
  switch (permission.resource) {
    case 'project':
      // Approvers and sales leads can read/update projects
      if (role.type === 'approver' || role.type === 'sales_lead') {
        return ['read', 'update'].includes(permission.action);
      }
      if (role.type === 'technician') {
        // Technicians can only access assigned projects
        return (
          permission.action === 'read' &&
          Boolean(permission.projectId) &&
          role.assignedProjectIds.includes(permission.projectId as string)
        );
      }
      if (role.type === 'customer_owner') {
        // Customer owners can read/update their projects
        return ['read', 'update'].includes(permission.action);
      }
      if (role.type === 'customer_viewer') {
        // Customer viewers can only read assigned projects
        return (
          permission.action === 'read' &&
          Boolean(permission.projectId) &&
          role.assignedProjectIds.includes(permission.projectId as string)
        );
      }
      return false;

    case 'user':
      // Only admins can manage users
      return isAdmin(role);

    case 'audit_log':
      // Only admins can read audit logs
      return isAdmin(role) && permission.action === 'read';

    default:
      return false;
  }
}

// ============================================================================
// JWT PAYLOAD TYPE
// ============================================================================

export interface JWTPayload {
  // Standard claims
  sub: string; // User ID
  iss: string; // Issuer
  aud: string; // Audience
  exp: number; // Expiration (Unix timestamp)
  iat: number; // Issued at (Unix timestamp)
  jti: string; // JWT ID (for revocation)

  // Custom claims
  orgId: string;
  email: string;
  role: UserRoleType;
  status: UserStatus;
}

export function createJWTPayload(user: User, expiresIn: number = 3600): JWTPayload {
  const now = Math.floor(Date.now() / 1000);

  return {
    sub: user.id,
    iss: 'managed-capture',
    aud: 'managed-capture-api',
    exp: now + expiresIn,
    iat: now,
    jti: crypto.randomUUID(),
    orgId: user.orgId,
    email: user.email,
    role: user.role.type,
    status: user.status,
  };
}
