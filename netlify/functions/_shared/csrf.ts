/**
 * CSRF Token Helpers
 *
 * Generates and validates CSRF tokens for mutation endpoints.
 * The mc_csrf cookie is non-HttpOnly so JavaScript can read it
 * and echo it back as an X-CSRF-Token header.
 */

import { randomUUID } from 'crypto';
import { parseCookies } from './cookies';

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

/**
 * Generate a new CSRF token.
 */
export function generateCSRFToken(): string {
  return randomUUID();
}

/**
 * Validate CSRF token: compare X-CSRF-Token header against mc_csrf cookie.
 * Returns true if valid, false if mismatch or missing.
 */
export function validateCSRF(event: NetlifyEvent): boolean {
  const headerToken = event.headers?.['x-csrf-token'] || event.headers?.['X-CSRF-Token'] || '';

  const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
  const cookies = parseCookies(cookieHeader);
  const cookieToken = cookies['mc_csrf'] || '';

  if (!headerToken || !cookieToken) {
    return false;
  }

  return headerToken === cookieToken;
}
