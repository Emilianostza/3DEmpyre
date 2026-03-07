/**
 * Netlify Function: Asset Signed URL
 *
 * Generates a time-limited signed download URL for a private asset stored
 * in Supabase Storage. Validates the requester's JWT and verifies they belong
 * to the same org as the asset (super_admin bypasses the org check).
 *
 * Requires:
 * - VITE_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - SUPABASE_STORAGE_BUCKET  (default: 'assets')
 *
 * Usage:
 * POST /.netlify/functions/assets-signed-url
 * Authorization: Bearer <supabase-access-token>
 * { "assetId": "...", "fileKey": "org-id/project-id/filename.glb" }
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
) => Promise<{ statusCode: number; headers?: Record<string, string>; body: string }>;

const SIGNED_URL_TTL = 3600; // 1 hour

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // ── Auth (cookie-first, Bearer fallback) ──────────────────────────────────
  const bearerToken = extractTokenFromRequest(event);
  if (!bearerToken) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Authentication required' }) };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const storageBucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'assets';

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[SignedURL] Supabase config missing');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);
  if (authError || !authData?.user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid or expired token' }) };
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
  let assetId: string | undefined;
  let fileKey: string;
  try {
    const body = JSON.parse(event.body || '{}');
    assetId = body.assetId;
    fileKey = body.fileKey;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!assetId || typeof assetId !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'assetId is required' }) };
  }

  if (!fileKey || typeof fileKey !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'fileKey is required' }) };
  }

  // ── Ownership check ──────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id, role')
    .eq('id', authData.user.id)
    .single();

  if (!profile) {
    return { statusCode: 403, body: JSON.stringify({ error: 'User profile not found' }) };
  }

  // Always verify asset ownership (super_admin bypasses org check)
  const { data: asset } = await supabase
    .from('assets')
    .select('org_id, file_key')
    .eq('id', assetId)
    .single();

  if (!asset) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Asset not found' }) };
  }

  if (profile.role !== 'super_admin' && asset.org_id !== profile.org_id) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Access denied' }) };
  }

  // Use the file_key from the database, not the client-supplied value
  const verifiedFileKey = asset.file_key || fileKey;

  // ── Generate signed URL ──────────────────────────────────────────────────────
  const { data: signedData, error: signedError } = await supabase.storage
    .from(storageBucket)
    .createSignedUrl(verifiedFileKey, SIGNED_URL_TTL);

  if (signedError || !signedData?.signedUrl) {
    console.error('[SignedURL] Failed:', signedError?.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate download URL' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Cache-Control': `private, max-age=${SIGNED_URL_TTL}` },
    body: JSON.stringify({ url: signedData.signedUrl, expiresIn: SIGNED_URL_TTL }),
  };
};

export { handler };
