/**
 * Supabase Client Configuration
 *
 * Initializes Supabase client with environment variables.
 * Handles session persistence and automatic token refresh.
 *
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
 *
 * Usage:
 * import { supabase } from '@/services/supabase/client';
 * const { data, error } = await supabase.auth.getSession();
 */

import { createClient, SupabaseClient, type AuthSession } from '@supabase/supabase-js';
import { env } from '@/config/env';

if (!env.useMockData && (!env.supabaseUrl || !env.supabaseAnonKey)) {
  throw new Error(
    'Missing Supabase configuration. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

/**
 * Initialize Supabase client
 */
export const supabase: SupabaseClient = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Auto-refresh token before expiry
      autoRefreshToken: true,
      // Persist session in localStorage
      persistSession: true,
      // Detect session from URL query params (OAuth redirect)
      detectSessionInUrl: true,
      // Storage adapter (browser localStorage)
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Storage key prefix
      storageKey: 'supabase.auth',
    },
  }
);

/**
 * Session listener for authentication state changes
 * Call this in your app root to listen for auth changes
 */
export function setupAuthListener(
  onAuthStateChange: (
    event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED',
    session: AuthSession | null
  ) => void
) {
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    onAuthStateChange(
      event as 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED',
      session
    );
  });

  return authListener?.subscription;
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign in with OAuth (Google, GitHub, etc.)
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'discord') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        // Include any custom parameters
      },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Refresh session token
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data.session;
}

/**
 * Reset password (send reset email)
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}

/**
 * Update password with recovery token
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data.user;
}

/**
 * Verify TOTP token (2FA)
 */
export async function verifyTOTP(code: string, email: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    // 'totp' is supported at runtime but missing from Supabase's OTP type definitions
    type: 'totp' as unknown as 'email',
    token: code,
    email,
  });
  if (error) throw error;
  return data;
}
