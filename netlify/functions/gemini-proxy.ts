/**
 * Netlify Function: Gemini API Proxy
 *
 * This function proxies requests to the Google Gemini API on the server side,
 * keeping the API key secure and never exposing it to the client.
 *
 * Requires:
 * - GEMINI_API_KEY: Google Gemini API key (Netlify env)
 * - VITE_SUPABASE_URL: Supabase project URL (Netlify env)
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key for server-side auth validation
 *
 * Usage (from authenticated frontend):
 * const response = await fetch('/.netlify/functions/gemini-proxy', {
 *   method: 'POST',
 *   headers: { Authorization: `Bearer ${token}` },
 *   body: JSON.stringify({ prompt: '...' })
 * });
 */

import { createClient } from '@supabase/supabase-js';
import { extractTokenFromRequest } from './_shared/cookies';

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

type Handler = (
  event: NetlifyEvent
) => Promise<{ statusCode: number; body: string; headers?: Record<string, string> }>;

const GEMINI_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const MAX_PROMPT_BYTES = 8192; // 8 KB

/** Roles allowed to use the Gemini proxy — employees only */
const EMPLOYEE_ROLES = new Set(['technician', 'approver', 'sales_lead', 'admin', 'super_admin']);

/** In-memory rate limiter — 10 requests per user per minute.
 *  Note: resets on cold start. For persistent limits add Upstash Redis. */
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

interface GeminiRequest {
  prompt: string;
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

const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // ── Auth: validate JWT (cookie-first, Bearer fallback) ──────────────────────
  const bearerToken = extractTokenFromRequest(event);

  if (!bearerToken) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Authentication required' }),
    };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[Gemini Proxy] Supabase config missing');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);

  if (authError || !authData?.user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid or expired token' }),
    };
  }

  // ── Role check: employees only ───────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (!profile || !EMPLOYEE_ROLES.has(profile.role)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Access restricted to employees' }),
    };
  }

  // ── Parse and validate body (before consuming rate limit) ───────────────────
  let parsed: GeminiRequest;
  try {
    parsed = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { prompt } = parsed;

  if (!prompt || typeof prompt !== 'string') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing or invalid prompt parameter' }),
    };
  }

  if (Buffer.byteLength(prompt, 'utf8') > MAX_PROMPT_BYTES) {
    return {
      statusCode: 413,
      body: JSON.stringify({ error: 'Prompt exceeds maximum allowed size (8 KB)' }),
    };
  }

  // ── Rate limit: 10 req / user / minute (after validation) ─────────────────
  if (!consumeRateLimit(authData.user.id)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }),
    };
  }

  // ── Gemini API call ──────────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Gemini Proxy] GEMINI_API_KEY not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      console.error('[Gemini Proxy] Gemini API returned', response.status);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Upstream API error' }),
      };
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'no-store' },
      body: JSON.stringify({ result: text }),
    };
  } catch (err) {
    console.error('[Gemini Proxy] Exception:', err instanceof Error ? err.message : err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
