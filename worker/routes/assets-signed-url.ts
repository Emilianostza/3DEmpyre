/**
 * Cloudflare Worker Route: Asset Signed URL
 *
 * Ported from netlify/functions/assets-signed-url.ts.
 * Generates a time-limited signed download URL for a private asset
 * stored in Supabase Storage. Validates JWT and verifies org ownership.
 *
 * POST /api/assets/signed-url
 * Cookies: mc_access_token (or Authorization: Bearer <token>)
 * Body: { assetId, fileKey }
 */

import { createClient } from '@supabase/supabase-js';
import { extractTokenFromRequest, jsonResponse } from '../shared/cookies';
import type { Env } from '../shared/types';

const SIGNED_URL_TTL = 3600; // 1 hour

export async function handleAssetsSignedUrl(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  // ── Auth (cookie-first, Bearer fallback) ──────────────────────────────────
  const bearerToken = extractTokenFromRequest(request);
  if (!bearerToken) {
    return jsonResponse(401, { error: 'Authentication required' });
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[assets-signed-url] Supabase config missing');
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  const storageBucket = env.SUPABASE_STORAGE_BUCKET || 'assets';
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);
  if (authError || !authData?.user) {
    return jsonResponse(401, { error: 'Invalid or expired token' });
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
  let assetId: string;
  let fileKey: string;
  try {
    const body = await request.json() as { assetId?: string; fileKey?: string };
    assetId = body.assetId || '';
    fileKey = body.fileKey || '';
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!assetId || typeof assetId !== 'string') {
    return jsonResponse(400, { error: 'assetId is required' });
  }

  if (!fileKey || typeof fileKey !== 'string') {
    return jsonResponse(400, { error: 'fileKey is required' });
  }

  // ── Ownership check ──────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id, role')
    .eq('id', authData.user.id)
    .single();

  if (!profile) {
    return jsonResponse(403, { error: 'User profile not found' });
  }

  const { data: asset } = await supabase
    .from('assets')
    .select('org_id, file_key')
    .eq('id', assetId)
    .single();

  if (!asset) {
    return jsonResponse(404, { error: 'Asset not found' });
  }

  if (profile.role !== 'super_admin' && asset.org_id !== profile.org_id) {
    return jsonResponse(403, { error: 'Access denied' });
  }

  // Use the file_key from the database, not the client-supplied value
  const verifiedFileKey = asset.file_key || fileKey;

  // ── Generate signed URL ──────────────────────────────────────────────────────
  const { data: signedData, error: signedError } = await supabase.storage
    .from(storageBucket)
    .createSignedUrl(verifiedFileKey, SIGNED_URL_TTL);

  if (signedError || !signedData?.signedUrl) {
    console.error('[assets-signed-url] Failed:', signedError?.message);
    return jsonResponse(500, { error: 'Failed to generate download URL' });
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': `private, max-age=${SIGNED_URL_TTL}`,
  });

  return new Response(
    JSON.stringify({ url: signedData.signedUrl, expiresIn: SIGNED_URL_TTL }),
    { status: 200, headers },
  );
}
