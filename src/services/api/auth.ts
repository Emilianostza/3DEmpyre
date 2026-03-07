/**
 * Authentication API Service
 *
 * PHASE 2 → 3: HttpOnly cookie-based auth via server-side proxy.
 * Auth operations route through server-side API routes that manage HttpOnly cookies.
 * Data queries still use the Supabase SDK directly (for RLS).
 *
 * Feature flag: VITE_USE_MOCK_DATA
 * - true: Use mock authentication with hardcoded users
 * - false: Use real auth via /api/auth/* proxy endpoints
 *
 * Usage:
 *   import { login, logout, getCurrentUser, refreshToken } from '@/services/api/auth';
 *   const response = await login({ email, password });
 */
import { env } from '@/config/env';
import {
  LoginRequestDTO,
  LoginResponseDTO,
  UserProfileDTO,
  UserRoleType,
  userToDTO,
  User,
} from '@/types/auth';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginRequest = LoginRequestDTO;
export type LoginResponse = LoginResponseDTO;

export interface GetUsersRequest {
  role?: string;
}

export type GetUsersResponse = User[];

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

// ============================================================================
// FEATURE FLAG: USE_MOCK_DATA
// ============================================================================

const USE_MOCK_DATA = env.useMockData;

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// MOCK DATA (only used when USE_MOCK_DATA === true)
// ============================================================================

const MOCK_USERS_MAP: Record<string, User & { industry?: string }> = {
  'user-admin': {
    id: 'user-admin',
    email: 'admin@company.com',
    name: 'Admin User',
    role: { type: 'admin', orgId: 'org-1' },
    orgId: 'org-1',
    status: 'active' as const,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'user-approver': {
    id: 'user-approver',
    email: 'approver@company.com',
    name: 'QA Approver',
    role: { type: 'approver', orgId: 'org-1' },
    orgId: 'org-1',
    status: 'active' as const,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'user-tech': {
    id: 'user-tech',
    email: 'tech@company.com',
    name: 'Field Technician',
    role: { type: 'technician', orgId: 'org-1', assignedProjectIds: [] },
    orgId: 'org-1',
    status: 'active' as const,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'user-client-bistro': {
    id: 'user-client-bistro',
    email: 'client@bistro.com',
    name: 'Bistro Owner',
    role: { type: 'customer_owner', orgId: 'cust-bistro', customerId: 'cust-bistro' },
    orgId: 'cust-bistro',
    customerId: 'cust-bistro',
    industry: 'Restaurant',
    status: 'active' as const,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'user-client-hotel': {
    id: 'user-client-hotel',
    email: 'client@grandhotel.com',
    name: 'Grand Hotel Manager',
    role: { type: 'customer_owner', orgId: 'cust-hotel', customerId: 'cust-hotel' },
    orgId: 'cust-hotel',
    customerId: 'cust-hotel',
    industry: 'Hospitality',
    status: 'active' as const,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'user-client-retail': {
    id: 'user-client-retail',
    email: 'client@fashionstore.com',
    name: 'Fashion Store Owner',
    role: { type: 'customer_owner', orgId: 'cust-retail', customerId: 'cust-retail' },
    orgId: 'cust-retail',
    customerId: 'cust-retail',
    industry: 'Retail',
    status: 'active' as const,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'user-client-realestate': {
    id: 'user-client-realestate',
    email: 'client@luxuryproperties.com',
    name: 'Luxury Properties Agent',
    role: { type: 'customer_owner', orgId: 'cust-realestate', customerId: 'cust-realestate' },
    orgId: 'cust-realestate',
    customerId: 'cust-realestate',
    industry: 'RealEstate',
    status: 'active' as const,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'user-superadmin': {
    id: 'user-superadmin',
    email: 'superadmin@example.com',
    name: 'Super Admin',
    role: { type: 'super_admin', orgId: 'org-1' },
    orgId: 'org-1',
    status: 'active' as const,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'user-customer': {
    id: 'user-customer',
    email: 'customer@example.com',
    name: 'Customer (Owner)',
    role: { type: 'customer_owner', orgId: 'cust-1', customerId: 'cust-1' },
    orgId: 'cust-1',
    customerId: 'cust-1',
    status: 'active' as const,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// ============================================================================
// MOCK AUTH IMPLEMENTATION
// ============================================================================

/** Module-level reference to the currently "logged in" mock user ID.
 *  Replaces apiClient.getToken() for tracking the mock session. */
let _mockCurrentUserId: string | null = null;

async function mockLogin(request: LoginRequest): Promise<LoginResponse> {
  await delay(800);

  const user = Object.values(MOCK_USERS_MAP).find(
    (u) => u.email.toLowerCase() === request.email.toLowerCase()
  );

  if (!user) {
    throw {
      status: 401,
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    };
  }

  const token = `mock-token-${user.id}-${Date.now()}`;
  const refreshToken = `mock-refresh-${user.id}-${Date.now()}`;

  // Track the logged-in user for mockGetCurrentUser
  _mockCurrentUserId = user.id;

  return {
    user: { ...userToDTO(user), industry: user.industry } as UserProfileDTO & { industry?: string },
    token,
    refreshToken,
    expiresIn: 3600,
  };
}

async function mockGetCurrentUser(): Promise<LoginResponseDTO['user']> {
  await delay(300);

  if (!_mockCurrentUserId) {
    throw {
      status: 401,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    };
  }

  const user = Object.values(MOCK_USERS_MAP).find((u) => u.id === _mockCurrentUserId);

  if (!user) {
    throw {
      status: 401,
      message: 'User not found for token',
      code: 'INVALID_TOKEN',
    };
  }

  return userToDTO(user);
}

async function mockRefreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  await delay(500);

  if (!request.refresh_token || !request.refresh_token.startsWith('mock-refresh-')) {
    throw {
      status: 401,
      message: 'Refresh token expired',
      code: 'REFRESH_TOKEN_EXPIRED',
    };
  }

  const parts = request.refresh_token.split('-');
  const userIdParts = parts.slice(2, parts.length - 1);
  const userId = userIdParts.join('-');

  const user = Object.values(MOCK_USERS_MAP).find((u) => u.id === userId);

  if (!user) {
    throw {
      status: 401,
      message: 'Invalid refresh token',
      code: 'REFRESH_TOKEN_EXPIRED',
    };
  }

  const newToken = `mock-token-${user.id}-${Date.now()}`;

  return {
    token: newToken,
    expiresIn: 3600,
  };
}

function mockIsTokenExpired(token: string): boolean {
  if (!token.startsWith('mock-token-')) return true;
  const parts = token.split('-');
  const timestampStr = parts[parts.length - 1];
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return true;
  const expirationTime = timestamp + 3600 * 1000;
  const now = Date.now();
  return now >= expirationTime - 30000;
}

function mockGetTokenTTL(token: string): number {
  if (!token.startsWith('mock-token-')) return 0;
  const parts = token.split('-');
  const timestampStr = parts[parts.length - 1];
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return 0;
  const expirationTime = timestamp + 3600 * 1000;
  const now = Date.now();
  const remaining = Math.max(0, (expirationTime - now) / 1000);
  return Math.floor(remaining);
}

async function mockCreateUser(data: {
  name: string;
  email: string;
  roleType: string;
  orgId?: string;
}): Promise<User> {
  await delay(600);

  const id = `user-${Date.now()}`;
  const orgId = data.orgId || (data.roleType.startsWith('customer') ? `cust-${id}` : 'org-1');
  const newUser: User = {
    id,
    email: data.email,
    name: data.name,
    orgId,
    role:
      data.roleType === 'customer_owner'
        ? { type: 'customer_owner', orgId, customerId: orgId }
        : data.roleType === 'customer_viewer'
          ? { type: 'customer_viewer', orgId, customerId: orgId, assignedProjectIds: [] }
          : data.roleType === 'technician'
            ? { type: 'technician', orgId, assignedProjectIds: [] }
            : ({ type: data.roleType as UserRoleType, orgId } as User['role']),
    status: 'active',
    mfaEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_USERS_MAP[id] = newUser;
  return newUser;
}

async function mockDeleteUser(id: string): Promise<void> {
  await delay(400);
  delete MOCK_USERS_MAP[id];
}

async function mockGetUsers(request: GetUsersRequest = {}): Promise<GetUsersResponse> {
  await delay(500);
  // MOCK_USERS_MAP values are likely any, but we know they match User structure
  let users = Object.values(MOCK_USERS_MAP) as User[];

  if (request.role) {
    // rudimentary filtering
    users = users.filter((u) => {
      // u.role is UserRole object, so u.role.type is valid
      if (request.role === 'employee')
        return ['admin', 'technician', 'approver', 'sales_lead', 'super_admin'].includes(
          u.role.type
        );
      if (request.role === 'customer')
        return ['customer_owner', 'customer_viewer'].includes(u.role.type);
      return u.role.type === request.role;
    });
  }
  return users;
}

// ============================================================================
// HELPER: Build role object from profile data
// ============================================================================

/**
 * Constructs the typed role object from Supabase profile row data.
 * Reads the actual role from the database instead of hardcoding.
 */
function buildRoleFromProfile(profileData: {
  role?: string;
  org_id?: string;
  customer_id?: string;
  assigned_project_ids?: string[];
  [key: string]: unknown;
}): User['role'] {
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

// ============================================================================
// REAL SUPABASE AUTH IMPLEMENTATION
// ============================================================================

/**
 * Read the CSRF token from the mc_csrf cookie (non-HttpOnly, readable by JS).
 */
function getCSRFToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)mc_csrf=([^;]+)/);
  return match?.[1] ?? '';
}

/**
 * Sync the Supabase SDK session with tokens returned from the auth proxy.
 * This keeps the SDK session in sync for RLS queries.
 */
async function syncSupabaseSession(supabaseSession: {
  access_token: string;
  refresh_token: string;
}): Promise<void> {
  const { supabase } = await import('@/services/supabase/client');
  await supabase.auth.setSession({
    access_token: supabaseSession.access_token,
    refresh_token: supabaseSession.refresh_token,
  });
}

async function realLogin(request: LoginRequest): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: request.email,
      password: request.password,
      orgSlug: request.orgSlug,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.error || 'Login failed',
      code: data.code || 'INVALID_CREDENTIALS',
    };
  }

  // Sync Supabase SDK for client-side RLS queries
  if (data.supabaseSession) {
    await syncSupabaseSession(data.supabaseSession);
  }

  return {
    user: data.user,
    token: data.supabaseSession?.access_token || '',
    refreshToken: data.supabaseSession?.refresh_token || '',
    expiresIn: data.expiresIn || 3600,
  };
}

async function realGetCurrentUser(): Promise<LoginResponseDTO['user']> {
  const res = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.error || 'No active session',
      code: data.code || 'INVALID_TOKEN',
    };
  }

  return data.user;
}

async function realRefreshToken(_request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  // Refresh token is now in HttpOnly cookie; _request.refresh_token is ignored
  const csrf = getCSRFToken();
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.error || 'Token refresh failed',
      code: data.code || 'REFRESH_TOKEN_EXPIRED',
    };
  }

  // Sync Supabase SDK for client-side RLS queries
  if (data.supabaseSession) {
    await syncSupabaseSession(data.supabaseSession);
  }

  return {
    token: data.supabaseSession?.access_token || '',
    refreshToken: data.supabaseSession?.refresh_token || '',
    expiresIn: data.expiresIn || 3600,
  };
}

async function realLogout(): Promise<void> {
  const csrf = getCSRFToken();
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrf },
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[Auth] Proxy logout error:', err);
  }
  // Also clear Supabase SDK session
  try {
    const { supabase } = await import('@/services/supabase/client');
    await supabase.auth.signOut();
  } catch {
    // Ignore — proxy already cleared server-side
  }
}

function realIsTokenExpired(token: string): boolean {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return true;

    // Compare expiry with current time (with 5-minute buffer)
    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const bufferMs = 5 * 60 * 1000;
    return now > expiryTime - bufferMs;
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[Auth] Token decode error:', error);
    return true;
  }
}

function realGetTokenTTL(token: string): number {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 0;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return 0;

    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const remaining = Math.max(0, (expiryTime - now) / 1000);
    return Math.floor(remaining);
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[Auth] Token decode error:', error);
    return 0;
  }
}

async function realGetUsers(_request: GetUsersRequest = {}): Promise<GetUsersResponse> {
  const { supabase } = await import('@/services/supabase/client');

  const query = supabase.from('user_profiles').select('*');

  // Real implementation would need more complex role filtering since role is JSON or separate column
  // For now, return all
  const { data, error } = await query;

  if (error) {
    if (import.meta.env.DEV) console.error('Failed to fetch users', error);
    return [];
  }

  return data.map((profile) => {
    const user: User = {
      id: profile.id,
      orgId: profile.org_id || '',
      email: profile.email || '', // Email might not be in profile depending on schema, usually in auth.users
      name: profile.name || '',
      role: buildRoleFromProfile(profile),
      status: (profile.status as User['status']) || 'active',
      mfaEnabled: profile.mfa_enabled || false,
      failedLoginAttempts: profile.failed_login_attempts || 0,
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString(),
    };
    return user;
  });
}

// ============================================================================
// PUBLIC API - ROUTES BASED ON FEATURE FLAG
// ============================================================================

/**
 * Login with email and password
 * Routes to mock or real based on VITE_USE_MOCK_DATA flag
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK_DATA) {
    return mockLogin(request);
  }
  return realLogin(request);
}

/**
 * Get current authenticated user
 * Routes to mock or real based on VITE_USE_MOCK_DATA flag
 */
export async function getCurrentUser(): Promise<LoginResponseDTO['user']> {
  if (USE_MOCK_DATA) {
    return mockGetCurrentUser();
  }
  return realGetCurrentUser();
}

/**
 * Refresh an expired JWT token
 * Routes to mock or real based on VITE_USE_MOCK_DATA flag
 */
export async function refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  if (USE_MOCK_DATA) {
    return mockRefreshToken(request);
  }
  return realRefreshToken(request);
}

/**
 * Get all users (Super Admin only)
 */
export async function getUsers(request: GetUsersRequest = {}): Promise<GetUsersResponse> {
  if (USE_MOCK_DATA) {
    return mockGetUsers(request);
  }
  return realGetUsers(request);
}

/**
 * Logout and revoke tokens
 * Routes to mock or real based on VITE_USE_MOCK_DATA flag
 */
export async function logout(): Promise<void> {
  if (USE_MOCK_DATA) {
    _mockCurrentUserId = null;
    await delay(200);
    return;
  }
  return realLogout();
}

/**
 * Check if JWT is expired
 * Routes to mock or real based on VITE_USE_MOCK_DATA flag
 */
export function isTokenExpired(token: string): boolean {
  if (USE_MOCK_DATA) {
    return mockIsTokenExpired(token);
  }
  return realIsTokenExpired(token);
}

/**
 * Get time remaining on JWT token in seconds
 * Routes to mock or real based on VITE_USE_MOCK_DATA flag
 */
export function getTokenTTL(token: string): number {
  if (USE_MOCK_DATA) {
    return mockGetTokenTTL(token);
  }
  return realGetTokenTTL(token);
}

export interface CreateUserRequest {
  name: string;
  email: string;
  roleType: string;
  orgId?: string;
}

/**
 * Create a new user (Super Admin only)
 */
export async function createUser(request: CreateUserRequest): Promise<User> {
  if (USE_MOCK_DATA) {
    return mockCreateUser(request);
  }
  // Real implementation: create via Supabase admin API
  throw new Error('Real createUser not yet implemented');
}

/**
 * Delete a user by ID (Super Admin only)
 */
export async function deleteUser(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    return mockDeleteUser(id);
  }
  // Real implementation: delete via Supabase admin API
  throw new Error('Real deleteUser not yet implemented');
}

// Unused but exported to maintain interface compatibility
export function decodeJWT(_token: string): Record<string, unknown> {
  return {};
}
