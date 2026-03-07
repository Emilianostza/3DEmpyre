/**
 * Cloudflare Worker Route: Gemini API Proxy
 *
 * Ported from netlify/functions/gemini-proxy.ts.
 * Proxies requests to the Google Gemini API, keeping the API key server-side.
 * Auth-gated: only employee roles can access.
 *
 * Changes from Netlify version:
 * - Buffer.byteLength() → new TextEncoder().encode().length
 * - process.env → env bindings
 * - In-memory rate limiter remains ephemeral (resets on isolate recycle)
 *
 * POST /api/gemini
 * Cookies: mc_access_token (or Authorization: Bearer <token>)
 * Body: { prompt }
 */

import { createClient } from '@supabase/supabase-js';
import { extractTokenFromRequest, jsonResponse } from '../shared/cookies';
import type { Env } from '../shared/types';

const GEMINI_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const MAX_PROMPT_BYTES = 8192; // 8 KB

/** Roles allowed to use the Gemini proxy — employees only */
const EMPLOYEE_ROLES = new Set(['technician', 'approver', 'sales_lead', 'admin', 'super_admin']);

/** In-memory rate limiter — 10 requests per user per minute.
 *  Resets on isolate recycle. For persistent limits use KV or Durable Objects. */
const _rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function consumeRateLimit(userId: string): boolean {
  const now = Date.now();
  const existing = _rateLimits.get(userId);
  if (!existing || now > existing.resetAt) {
    _rateLimits.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX) return false;
  existing.count++;
  return true;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export async function handleGeminiProxy(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── Auth: validate JWT (cookie-first, Bearer fallback) ──────────────────────
  const bearerToken = extractTokenFromRequest(request);
  if (!bearerToken) {
    return jsonResponse(401, { error: 'Authentication required' });
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[gemini-proxy] Supabase config missing');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);

  if (authError || !authData?.user) {
    return jsonResponse(401, { error: 'Invalid or expired token' });
  }

  // ── Role check: employees only ───────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (!profile || !EMPLOYEE_ROLES.has(profile.role)) {
    return jsonResponse(403, { error: 'Access restricted to employees' });
  }

  // ── Parse and validate body ────────────────────────────────────────────────
  let prompt: string;
  try {
    const body = await request.json() as { prompt?: string };
    prompt = body.prompt || '';
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!prompt || typeof prompt !== 'string') {
    return jsonResponse(400, { error: 'Missing or invalid prompt parameter' });
  }

  // Workers replacement for Buffer.byteLength(prompt, 'utf8')
  if (new TextEncoder().encode(prompt).length > MAX_PROMPT_BYTES) {
    return jsonResponse(413, { error: 'Prompt exceeds maximum allowed size (8 KB)' });
  }

  // ── Rate limit: 10 req / user / minute ─────────────────────────────────────
  if (!consumeRateLimit(authData.user.id)) {
    return jsonResponse(429, { error: 'Rate limit exceeded. Try again in a minute.' });
  }

  // ── Gemini API call ──────────────────────────────────────────────────────────
  if (!env.GEMINI_API_KEY) {
    console.error('[gemini-proxy] GEMINI_API_KEY not configured');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      console.error('[gemini-proxy] Gemini API returned', response.status);
      return jsonResponse(502, { error: 'Upstream API error' });
    }

    const data = await response.json() as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return jsonResponse(200, { result: text });
  } catch (err) {
    console.error('[gemini-proxy] Exception:', err instanceof Error ? err.message : err);
    return jsonResponse(500, { error: 'Internal server error' });
  }
}
