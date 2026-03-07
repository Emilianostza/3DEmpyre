/**
 * CSRF Token Helpers for Cloudflare Workers
 *
 * Ported from netlify/functions/_shared/csrf.ts.
 * Uses Web Crypto API (crypto.randomUUID) instead of Node.js crypto import.
 *
 * The mc_csrf cookie is non-HttpOnly so JavaScript can read it
 * and echo it back as an X-CSRF-Token header (double-submit pattern).
 */

import { parseCookies } from './cookies';

/**
 * Generate a new CSRF token.
 */
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate CSRF token: compare X-CSRF-Token header against mc_csrf cookie.
 * Returns true if valid, false if mismatch or missing.
 */
export function validateCSRF(request: Request): boolean {
  const headerToken = request.headers.get('x-csrf-token') || '';

  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const cookieToken = cookies['mc_csrf'] || '';

  if (!headerToken || !cookieToken) {
    return false;
  }

  return headerToken === cookieToken;
}
