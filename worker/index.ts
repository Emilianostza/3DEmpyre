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
// Security headers for API responses
// ---------------------------------------------------------------------------
const API_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function withApiHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(API_HEADERS)) {
    headers.set(k, v);
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

    // API routing
    const handler = routes[path];
    if (!handler) {
      return withApiHeaders(
        new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    try {
      return withApiHeaders(await handler(request, env));
    } catch (err) {
      console.error('[worker] Unhandled error:', err);
      return withApiHeaders(
        new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
  },
} as { fetch: (request: Request, env: Env) => Promise<Response> };
