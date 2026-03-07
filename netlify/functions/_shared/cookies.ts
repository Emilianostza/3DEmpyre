/**
 * Cookie Helpers for Auth Proxy Functions
 *
 * Provides HttpOnly cookie management for the auth migration.
 * Handles setting, parsing, and clearing auth cookies.
 *
 * Cookie layout:
 * - mc_access_token:  HttpOnly, Secure, SameSite=Strict, Path=/, 1hr
 * - mc_refresh_token: HttpOnly, Secure, SameSite=Strict, Path=/.netlify/functions/auth-, 7d
 * - mc_csrf:          NOT HttpOnly (JS must read), Secure, SameSite=Strict, Path=/, 1hr
 */

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

const ACCESS_TOKEN_MAX_AGE = 3600; // 1 hour
const REFRESH_TOKEN_MAX_AGE = 604800; // 7 days
const CSRF_MAX_AGE = 3600; // 1 hour

const COOKIE_NAMES = {
  accessToken: 'mc_access_token',
  refreshToken: 'mc_refresh_token',
  csrf: 'mc_csrf',
} as const;

/**
 * Parse cookies from the Cookie header string.
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(';')) {
    const [rawKey, ...rest] = pair.split('=');
    const key = rawKey?.trim();
    const value = rest.join('=').trim();
    if (key) cookies[key] = value;
  }
  return cookies;
}

/**
 * Build Set-Cookie headers for login/refresh responses.
 */
export function buildAuthCookieHeaders(
  accessToken: string,
  refreshToken: string,
  csrfToken: string
): string[] {
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.CONTEXT === 'production';
  const secure = isProduction ? '; Secure' : '';

  return [
    `${COOKIE_NAMES.accessToken}=${accessToken}; HttpOnly; Path=/${secure}; SameSite=Strict; Max-Age=${ACCESS_TOKEN_MAX_AGE}`,
    `${COOKIE_NAMES.refreshToken}=${refreshToken}; HttpOnly; Path=/.netlify/functions/auth-${secure}; SameSite=Strict; Max-Age=${REFRESH_TOKEN_MAX_AGE}`,
    `${COOKIE_NAMES.csrf}=${csrfToken}; Path=/${secure}; SameSite=Strict; Max-Age=${CSRF_MAX_AGE}`,
  ];
}

/**
 * Build Set-Cookie headers that clear all auth cookies.
 */
export function buildClearCookieHeaders(): string[] {
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.CONTEXT === 'production';
  const secure = isProduction ? '; Secure' : '';

  return [
    `${COOKIE_NAMES.accessToken}=; HttpOnly; Path=/${secure}; SameSite=Strict; Max-Age=0`,
    `${COOKIE_NAMES.refreshToken}=; HttpOnly; Path=/.netlify/functions/auth-${secure}; SameSite=Strict; Max-Age=0`,
    `${COOKIE_NAMES.csrf}=; Path=/${secure}; SameSite=Strict; Max-Age=0`,
  ];
}

/**
 * Extract the access token from a request.
 * Checks cookie first, falls back to Bearer header.
 */
export function extractTokenFromRequest(event: NetlifyEvent): string | null {
  // 1. Try cookie
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
  const cookies = parseCookies(cookieHeader);
  if (cookies[COOKIE_NAMES.accessToken]) {
    return cookies[COOKIE_NAMES.accessToken];
  }

  // 2. Fall back to Bearer header
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * Extract the refresh token from a request cookie.
 */
export function extractRefreshTokenFromRequest(event: NetlifyEvent): string | null {
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
  const cookies = parseCookies(cookieHeader);
  return cookies[COOKIE_NAMES.refreshToken] || null;
}

/**
 * Build a JSON response with optional Set-Cookie headers.
 * Netlify Functions use multiValueHeaders for multiple Set-Cookie headers.
 */
export function jsonResponse(
  statusCode: number,
  body: Record<string, unknown>,
  setCookies?: string[]
): {
  statusCode: number;
  headers: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body: string;
} {
  const response: {
    statusCode: number;
    headers: Record<string, string>;
    multiValueHeaders?: Record<string, string[]>;
    body: string;
  } = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };

  if (setCookies && setCookies.length > 0) {
    response.multiValueHeaders = {
      'Set-Cookie': setCookies,
    };
  }

  return response;
}
