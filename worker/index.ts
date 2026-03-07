/**
 * Cloudflare Worker Entry Point — Managed Capture 3D Platform
 *
 * Routes /api/* requests to handler functions.
 * All other requests are served by the [assets] binding (static files from dist/).
 * SPA fallback is handled by `not_found_handling = "single-page-application"` in wrangler.toml.
 */

import type { Env } from './shared/types';
import { handleLogin } from './routes/auth-login';
import { handleSession } from './routes/auth-session';
import { handleRefresh } from './routes/auth-refresh';
import { handleLogout } from './routes/auth-logout';
import { handleSignup } from './routes/auth-signup';
import { handleAssetsSignedUrl } from './routes/assets-signed-url';
import { handleGeminiProxy } from './routes/gemini-proxy';

/** Security headers applied to all /api/* responses. */
function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Only handle /api/* routes — everything else is served by the static-asset binding
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    let response: Response;

    try {
      if (path === '/api/auth/login') {
        response = await handleLogin(request, env);
      } else if (path === '/api/auth/session') {
        response = await handleSession(request, env);
      } else if (path === '/api/auth/refresh') {
        response = await handleRefresh(request, env);
      } else if (path === '/api/auth/logout') {
        response = await handleLogout(request, env);
      } else if (path === '/api/auth/signup') {
        response = await handleSignup(request, env);
      } else if (path === '/api/assets/signed-url') {
        response = await handleAssetsSignedUrl(request, env);
      } else if (path === '/api/gemini') {
        response = await handleGeminiProxy(request, env);
      } else {
        response = new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      console.error('[worker] Unhandled error:', err);
      response = new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return withSecurityHeaders(response);
  },
} as { fetch: (request: Request, env: Env) => Promise<Response> };
