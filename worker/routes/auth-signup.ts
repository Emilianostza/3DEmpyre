/**
 * Cloudflare Worker Route: Auth Sign-Up
 *
 * Cloudflare Worker route handler.
 * Handles user registration via Supabase Auth REST API.
 * Does NOT set HttpOnly cookies (this is an older-generation function;
 * aligning it with the cookie pattern is a separate task).
 *
 * POST /api/auth/signup
 * Body: { email, password, fullName? }
 */

import { jsonResponse } from '../shared/cookies';
import type { Env } from '../shared/types';

export async function handleSignup(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── Config ──────────────────────────────────────────────────────────────────
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.error('[auth-signup] Missing Supabase config');
    return jsonResponse(500, { error: 'Auth service not configured' });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let email: string;
  let password: string;
  let fullName: string | undefined;
  try {
    const body = await request.json() as { email?: string; password?: string; fullName?: string };
    email = body.email || '';
    password = body.password || '';
    fullName = body.fullName;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!email || !password) {
    return jsonResponse(400, { error: 'Email and password are required' });
  }

  // ── Call Supabase Auth REST API ─────────────────────────────────────────────
  try {
    const authResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: {
          full_name: fullName || email.split('@')[0],
        },
      }),
    });

    const authData = await authResponse.json() as Record<string, unknown>;

    if (!authResponse.ok) {
      const errorMsg = (authData.error_description || authData.error || 'Sign-up failed') as string;
      console.error('[auth-signup] Supabase error:', errorMsg);
      return jsonResponse(authResponse.status, { error: errorMsg });
    }

    return jsonResponse(200, {
      user: authData.user,
      session: authData.session,
    });
  } catch (err) {
    console.error('[auth-signup] Exception:', err);
    return jsonResponse(500, {
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
}
