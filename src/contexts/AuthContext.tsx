/**
 * Authentication Context - PHASE 3
 *
 * PHASE 3: HttpOnly cookie-based auth via server-side proxy.
 * Auth operations go through server-side API routes that manage HttpOnly cookies.
 * localStorage is no longer used for token storage.
 *
 * Features:
 * - HttpOnly cookie-based token management (XSS-resistant)
 * - Server-side session validation on page load
 * - TTL-based automatic token refresh via proxy
 * - Supabase SDK session sync for client-side RLS
 * - Secure logout via proxy
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Industry } from '@/types';
import {
  User,
  Organization,
  LoginResponseDTO,
  UserProfileDTO,
  Permission,
  hasPermission as checkPermission,
  userFromDTO,
} from '@/types/auth';
import * as AuthAPI from '@/services/api/auth';

/**
 * AuthUser is an alias to User from types/auth.ts
 */
export type AuthUser = User;

interface AuthContextType {
  user: AuthUser | null;
  organization: Organization | null;
  loading: boolean;
  login: (email: string, password: string, orgSlug?: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  token: string | null;
  refreshToken: () => Promise<boolean>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000; // Refresh 60 seconds before expiry
const TOKEN_REFRESH_FALLBACK_MS = 5 * 60 * 1000; // Fallback: 5 minutes if TTL unknown
const MAX_REFRESH_ATTEMPTS = 3; // Rate-limit: max consecutive failures before giving up
const REFRESH_BACKOFF_BASE_MS = 2000; // Exponential backoff base (2s, 4s, 8s)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIntervalId, setRefreshIntervalId] = useState<NodeJS.Timeout | null>(null);
  const refreshFailCountRef = React.useRef(0);
  const userRef = React.useRef(user);
  userRef.current = user;

  /**
   * Restore session on mount.
   * Calls the server-side /api/auth/session endpoint which reads the
   * HttpOnly cookie and returns the user profile if valid.
   */
  useEffect(() => {
    const restoreSession = async () => {
      // One-time cleanup: remove stale localStorage keys from pre-cookie auth
      try {
        localStorage.removeItem('managed_capture_auth_token');
        localStorage.removeItem('managed_capture_refresh_token');
      } catch {
        // Ignore — localStorage may be unavailable (SSR, privacy mode)
      }

      try {
        const currentUserDTO = await AuthAPI.getCurrentUser();
        const currentUser = userFromDTO(currentUserDTO);
        setUser(currentUser);
        setError(null);

        // The token is only needed in-memory for TTL-based refresh scheduling.
        // In cookie mode, the real auth token is in the HttpOnly cookie.
        // We use a sentinel value to trigger the refresh useEffect.
        setTokenState('cookie-managed');
      } catch {
        // No valid session — user is not logged in
        if (import.meta.env.DEV) console.warn('[Auth] No active session on mount');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Set up TTL-based token refresh.
   * Fires before the HttpOnly cookie expires to keep the session alive.
   * The proxy handles cookie renewal; we just need to schedule the call.
   */
  useEffect(() => {
    if (user && token) {
      // Use TTL from token if available, otherwise fallback
      const ttlSeconds = token !== 'cookie-managed' ? AuthAPI.getTokenTTL(token) : 0;
      const delayMs =
        ttlSeconds > 0
          ? Math.max(ttlSeconds * 1000 - TOKEN_REFRESH_BUFFER_MS, 5000)
          : TOKEN_REFRESH_FALLBACK_MS;

      if (import.meta.env.DEV) {
        console.warn(`[Auth] Token refresh scheduled in ${Math.round(delayMs / 1000)}s`);
      }

      const id = setTimeout(async () => {
        // Rate-limit: stop trying after MAX_REFRESH_ATTEMPTS consecutive failures
        if (refreshFailCountRef.current >= MAX_REFRESH_ATTEMPTS) {
          if (import.meta.env.DEV) {
            console.warn(
              `[Auth] Token refresh halted after ${MAX_REFRESH_ATTEMPTS} consecutive failures`
            );
          }
          return;
        }

        if (import.meta.env.DEV) console.warn('[Auth] Refreshing token (TTL-based)...');
        try {
          // refresh_token param is ignored by proxy (reads HttpOnly cookie)
          const response = await AuthAPI.refreshToken({ refresh_token: '' });
          setTokenState(response.token || 'cookie-managed');
          refreshFailCountRef.current = 0;
        } catch (err) {
          refreshFailCountRef.current += 1;
          const backoff = REFRESH_BACKOFF_BASE_MS * Math.pow(2, refreshFailCountRef.current - 1);
          if (import.meta.env.DEV) {
            console.error(
              `[Auth] Automatic token refresh failed (attempt ${refreshFailCountRef.current}/${MAX_REFRESH_ATTEMPTS}, next retry in ${backoff}ms)`,
              err
            );
          }
        }
      }, delayMs);

      setRefreshIntervalId(id);
      return () => clearTimeout(id);
    }
  }, [user, token]);

  /**
   * Login with email and password.
   * AuthAPI.login() now calls the /api/auth/login proxy which sets HttpOnly cookies
   * and returns the Supabase session for SDK sync (handled inside AuthAPI).
   */
  const login = async (email: string, password: string, orgSlug?: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response: LoginResponseDTO = await AuthAPI.login({ email, password, orgSlug });

      // Set token in state for TTL-based refresh scheduling
      setTokenState(response.token || 'cookie-managed');

      // Convert DTO to Domain User
      const userDomain = userFromDTO(response.user);
      setUser(userDomain);

      // Build minimal org object from user's orgId
      try {
        setOrganization({
          id: userDomain.orgId,
          name: '',
          slug: '',
          countryCode: 'ee' as const,
          region: 'eu' as const,
          gdprConsent: false,
          dataRetentionDays: 365,
          industry:
            (response.user as UserProfileDTO & { industry?: Industry }).industry || undefined,
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (orgErr) {
        if (import.meta.env.DEV) console.warn('[Auth] Failed to load organization', orgErr);
      }

      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      if (import.meta.env.DEV) console.error('[Auth] Login failed:', errorMessage);
      setError(errorMessage);
      setUser(null);
      setOrganization(null);
      setTokenState(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout and revoke tokens.
   * AuthAPI.logout() calls the /api/auth/logout proxy which clears HttpOnly cookies
   * and signs out the Supabase SDK session.
   */
  const logout = async (): Promise<void> => {
    try {
      await AuthAPI.logout();
    } catch (err) {
      if (import.meta.env.DEV)
        console.warn('[Auth] Backend logout failed, clearing local state', err);
    } finally {
      setUser(null);
      setOrganization(null);
      setTokenState(null);
      setError(null);

      if (refreshIntervalId) {
        clearTimeout(refreshIntervalId);
        setRefreshIntervalId(null);
      }
    }
  };

  /**
   * Manually refresh token.
   * Returns true if successful, false otherwise.
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      // refresh_token param is ignored by proxy (reads HttpOnly cookie)
      const response = await AuthAPI.refreshToken({ refresh_token: '' });
      setTokenState(response.token || 'cookie-managed');
      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('[Auth] Token refresh failed', err);
      await logout();
      return false;
    }
  };

  /**
   * Check if user has permission for a resource
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return checkPermission(user, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        loading,
        login,
        logout,
        error,
        token,
        refreshToken: refreshAccessToken,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
