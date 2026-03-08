/**
 * Cloudflare Worker Entry Point — 3D Empyre
 *
 * Routes /api/* requests to handler functions.
 * Static files are served by the [assets] binding (dist/).
 * Cache + security headers for static assets are set via public/_headers.
 */

import type { Env } from './shared/types';
import { handleLogin } from './routes/auth-login';
import { handleSession } from './routes/auth-session';
import { handleRefresh } from './routes/auth-refresh';
import { handleLogout } from './routes/auth-logout';
import { handleSignup } from './routes/auth-signup';
import { handleAssetsSignedUrl } from './routes/assets-signed-url';
import { handleGeminiProxy } from './routes/gemini-proxy';

// ---------------------------------------------------------------------------
// Route map — O(1) lookup instead of if/else chain
// ---------------------------------------------------------------------------
type RouteHandler = (request: Request, env: Env) => Promise<Response>;

const routes: Record<string, RouteHandler> = {
  '/api/auth/login': handleLogin,
  '/api/auth/session': handleSession,
  '/api/auth/refresh': handleRefresh,
  '/api/auth/logout': handleLogout,
  '/api/auth/signup': handleSignup,
  '/api/assets/signed-url': handleAssetsSignedUrl,
  '/api/gemini': handleGeminiProxy,
};

// ---------------------------------------------------------------------------
// CORS configuration
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
]);

function getCorsOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  // Allow configured origins + production domain from env
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  if (env.SITE_ORIGIN && origin === env.SITE_ORIGIN) return origin;
  return null;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

// ---------------------------------------------------------------------------
// Security headers for API responses
// ---------------------------------------------------------------------------
const API_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Vary': 'Accept, Cookie, Origin',
};

function withApiHeaders(response: Response, extraHeaders?: Record<string, string>): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(API_HEADERS)) {
    headers.set(k, v);
  }
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      headers.set(k, v);
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ---------------------------------------------------------------------------
// Fetch handler
// ---------------------------------------------------------------------------
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Static assets — delegate to Cloudflare asset binding
    // Headers set via public/_headers file
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // Resolve CORS origin once for this request
    const allowedOrigin = getCorsOrigin(request, env);
    const cors = allowedOrigin ? corsHeaders(allowedOrigin) : {};

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // API routing
    const handler = routes[path];
    if (!handler) {
      return withApiHeaders(
        new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
        cors,
      );
    }

    try {
      return withApiHeaders(await handler(request, env), cors);
    } catch (err) {
      console.error('[worker] Unhandled error:', err);
      return withApiHeaders(
        new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
        cors,
      );
    }
  },
} as { fetch: (request: Request, env: Env) => Promise<Response> };
