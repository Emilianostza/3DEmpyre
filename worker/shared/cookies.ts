/**
 * Cookie Helpers for Cloudflare Workers Auth Proxy
 *
 * Ported from netlify/functions/_shared/cookies.ts.
 * Uses standard Web APIs (Request, Response, Headers) instead of Netlify event shape.
 *
 * Cookie layout:
 * - mc_access_token:  HttpOnly, Secure, SameSite=Strict, Path=/, 1hr
 * - mc_refresh_token: HttpOnly, Secure, SameSite=Strict, Path=/api/auth/, 7d
 * - mc_csrf:          NOT HttpOnly (JS must read), Secure, SameSite=Strict, Path=/, 1hr
 */

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
export function parseCookies(cookieHeader: string | null): Record<string, string> {
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
 * Build Set-Cookie header values for login/refresh responses.
 *
 * @param environment - "production" or other; controls the Secure flag
 */
export function buildAuthCookieHeaders(
  accessToken: string,
  refreshToken: string,
  csrfToken: string,
  environment: string,
): string[] {
  const secure = environment === 'production' ? '; Secure' : '';

  return [
    `${COOKIE_NAMES.accessToken}=${accessToken}; HttpOnly; Path=/${secure}; SameSite=Strict; Max-Age=${ACCESS_TOKEN_MAX_AGE}`,
    `${COOKIE_NAMES.refreshToken}=${refreshToken}; HttpOnly; Path=/api/auth/${secure}; SameSite=Strict; Max-Age=${REFRESH_TOKEN_MAX_AGE}`,
    `${COOKIE_NAMES.csrf}=${csrfToken}; Path=/${secure}; SameSite=Strict; Max-Age=${CSRF_MAX_AGE}`,
  ];
}

/**
 * Build Set-Cookie header values that clear all auth cookies.
 */
export function buildClearCookieHeaders(environment: string): string[] {
  const secure = environment === 'production' ? '; Secure' : '';

  return [
    `${COOKIE_NAMES.accessToken}=; HttpOnly; Path=/${secure}; SameSite=Strict; Max-Age=0`,
    `${COOKIE_NAMES.refreshToken}=; HttpOnly; Path=/api/auth/${secure}; SameSite=Strict; Max-Age=0`,
    `${COOKIE_NAMES.csrf}=; Path=/${secure}; SameSite=Strict; Max-Age=0`,
  ];
}

/**
 * Extract the access token from a Request.
 * Checks cookie first, falls back to Bearer header.
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 1. Try cookie
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  if (cookies[COOKIE_NAMES.accessToken]) {
    return cookies[COOKIE_NAMES.accessToken];
  }

  // 2. Fall back to Bearer header
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * Extract the refresh token from a request cookie.
 */
export function extractRefreshTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  return cookies[COOKIE_NAMES.refreshToken] || null;
}

/**
 * Build a JSON Response with optional Set-Cookie headers.
 * Uses standard Headers.append() for multiple Set-Cookie values.
 *
 * @param cacheControl - Override Cache-Control header (default: 'no-store' for auth safety)
 */
export function jsonResponse(
  statusCode: number,
  body: Record<string, unknown>,
  setCookies?: string[],
  cacheControl = 'no-store',
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': cacheControl,
  });

  if (setCookies) {
    for (const cookie of setCookies) {
      headers.append('Set-Cookie', cookie);
    }
  }

  return new Response(JSON.stringify(body), { status: statusCode, headers });
}
