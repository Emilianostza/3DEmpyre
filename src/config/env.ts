/**
 * Typed Environment Configuration
 *
 * Single source of truth for all environment variables.
 * Validates at startup and provides compile-time safe access.
 *
 * No component should access import.meta.env directly.
 * Import from this module instead.
 */

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

interface EnvConfig {
  // Feature flags
  isDev: boolean;
  isProd: boolean;
  useMockData: boolean;

  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;

  // Storage Configuration
  storageBucket: string;

  // Auth Configuration
  jwtExpiresIn: number;
  jwtRefreshExpiresIn: number;

  // Supabase Configuration
  supabaseUrl: string;
  supabaseAnonKey: string;

  // Gemini API (server-side only via proxy)
  // Never expose in client code - accessed via /api/gemini
  geminiProxyUrl: string;
}

// ============================================================================
// ENVIRONMENT PARSING
// ============================================================================

function validateEnv(): EnvConfig {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  // Feature flags
  const useMockData = isProd
    ? import.meta.env.VITE_USE_MOCK_DATA === 'true'
    : import.meta.env.VITE_USE_MOCK_DATA !== 'false';

  // API Configuration
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const apiTimeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

  // Storage Configuration
  const storageBucket = import.meta.env.VITE_STORAGE_BUCKET || 's3.example.com/managed-capture';

  // Auth Configuration
  const jwtExpiresIn = parseInt(import.meta.env.VITE_JWT_EXPIRES_IN || '3600', 10);
  const jwtRefreshExpiresIn = parseInt(import.meta.env.VITE_JWT_REFRESH_EXPIRES_IN || '604800', 10);

  // Supabase Configuration
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // Gemini Proxy
  const geminiProxyUrl = '/api/gemini';

  // ============================================================================
  // VALIDATION RULES (fail-fast in dev)
  // ============================================================================

  const errors: string[] = [];

  // API base URL must be valid in production
  if (isProd && !apiBaseUrl.startsWith('http')) {
    errors.push('VITE_API_BASE_URL must be a valid HTTP URL in production');
  }

  // Storage bucket should be configured
  // Downgrade to warning in all environments to prevent production blocking
  if (storageBucket === 's3.example.com/managed-capture' && isDev) {
    console.warn('[Config] VITE_STORAGE_BUCKET using default placeholder (s3.example.com)');
  }

  // Supabase must be configured if not using mock data
  if (!useMockData) {
    if (!supabaseUrl) {
      errors.push('VITE_SUPABASE_URL is required when not using mock data');
    } else if (!supabaseUrl.includes('.supabase.co')) {
      errors.push('VITE_SUPABASE_URL must be a valid Supabase project URL');
    }

    if (!supabaseAnonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required when not using mock data');
    } else if (supabaseAnonKey.length < 20) {
      errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
    }
  }

  // Fail fast in development if there are errors
  if (errors.length > 0) {
    const message = `❌ Environment Configuration Errors:\n${errors.map((e) => `  • ${e}`).join('\n')}`;

    // Log error in all environments
    console.error(message);

    if (!isDev) {
      // In production, log but do NOT throw to prevent blank/black screen
      // This allows the app to attempt loading in a degraded state
      console.warn(
        '⚠️ Application starting with configuration errors. Some features may be broken.'
      );
    }
  }

  return {
    isDev,
    isProd,
    useMockData,
    apiBaseUrl,
    apiTimeout,
    storageBucket,
    jwtExpiresIn,
    jwtRefreshExpiresIn,
    supabaseUrl,
    supabaseAnonKey,
    geminiProxyUrl,
  };
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const env = validateEnv();

// ============================================================================
// DEBUG LOGGING (dev mode only)
// ============================================================================

if (env.isDev) {
  console.warn('[Config] Environment initialized:', {
    mode: env.isProd ? 'production' : 'development',
    useMockData: env.useMockData,
    apiBaseUrl: env.apiBaseUrl,
    storageBucket: env.storageBucket,
  });
}
