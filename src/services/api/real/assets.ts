/**
 * Real Assets API Service
 *
 * Connects to Supabase backend for asset CRUD operations.
 * Handles file storage, processing status, and derivative URLs.
 *
 * API Endpoints:
 * - GET /assets — List assets (paginated)
 * - GET /assets/:id — Get single asset
 * - POST /assets — Create asset record
 * - PATCH /assets/:id — Update asset
 * - DELETE /assets/:id — Soft delete asset
 * - POST /assets/:id/process — Start processing
 */

import { supabase } from '@/services/supabase/client';
import { AssetDTO } from '@/types/dtos';
import { AssetType, AssetStatus } from '@/types/domain';

export interface FetchAssetsFilter {
  projectId?: string;
  status?: AssetStatus;
  type?: AssetType;
  cursor?: string;
  limit?: number;
}

/**
 * Fetch assets with pagination and filtering
 */
export async function fetchAssets(filter: FetchAssetsFilter = {}): Promise<{
  assets: AssetDTO[];
  nextCursor?: string;
}> {
  try {
    let query = supabase
      .from('assets')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(filter.limit || 20);

    // Apply filters
    if (filter.projectId) {
      query = query.eq('project_id', filter.projectId);
    }
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (filter.type) {
      query = query.eq('type', filter.type);
    }

    // Cursor-based pagination
    if (filter.cursor) {
      const cursorDate = new Date(filter.cursor);
      query = query.lt('created_at', cursorDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch assets: ${error.message}`);
    }

    const nextCursor =
      data && data.length >= (filter.limit || 20) ? data[data.length - 1].created_at : undefined;

    return {
      assets: data || [],
      nextCursor,
    };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Fetch failed:', err);
    throw err;
  }
}

/**
 * Get single asset by ID
 */
export async function getAsset(id: string): Promise<AssetDTO> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      throw new Error(`Failed to get asset: ${error.message}`);
    }

    if (!data) {
      throw new Error('Asset not found');
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Get failed:', err);
    throw err;
  }
}

/**
 * Create asset record after file upload
 */
export interface CreateAssetRequest {
  projectId: string;
  name: string;
  description?: string;
  type: AssetType;
  fileKey: string; // S3 key
  fileSize: number; // bytes
  contentType: string; // MIME type
}

export async function createAsset(data: CreateAssetRequest): Promise<AssetDTO> {
  try {
    const { data: asset, error } = await supabase
      .from('assets')
      .insert([
        {
          project_id: data.projectId,
          name: data.name,
          description: data.description,
          type: data.type,
          file_key: data.fileKey,
          file_size: data.fileSize,
          content_type: data.contentType,
          status: 'uploading',
          asset_version: 1,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create asset: ${error.message}`);
    }

    return asset;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Create failed:', err);
    throw err;
  }
}

/**
 * Update asset (metadata, thumbnails, status)
 */
export interface UpdateAssetRequest {
  name?: string;
  description?: string;
  status?: AssetStatus;
  thumbnailUrl?: string;
  previewUrl?: string;
  processingMetadata?: Record<string, unknown>;
}

export async function updateAsset(id: string, updates: UpdateAssetRequest): Promise<AssetDTO> {
  try {
    // Only include defined fields to avoid overwriting existing data with NULL
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.thumbnailUrl !== undefined) payload.thumbnail_url = updates.thumbnailUrl;
    if (updates.previewUrl !== undefined) payload.preview_url = updates.previewUrl;
    if (updates.processingMetadata !== undefined)
      payload.processing_metadata = updates.processingMetadata;
    if (updates.status === 'processing') payload.processing_started_at = new Date().toISOString();
    if (updates.status === 'published') payload.processing_completed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('assets')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update asset: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Update failed:', err);
    throw err;
  }
}

/**
 * Mark asset as uploaded (ready for processing)
 */
export async function publishAsset(id: string): Promise<AssetDTO> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .update({
        status: 'published',
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to publish asset: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Publish failed:', err);
    throw err;
  }
}

/**
 * Mark asset as failed
 */
export async function failAsset(id: string, reason?: string): Promise<AssetDTO> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .update({
        status: 'failed',
        processing_error: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update asset: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Fail failed:', err);
    throw err;
  }
}

/**
 * Soft delete asset
 */
export async function deleteAsset(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('assets')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete asset: ${error.message}`);
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Delete failed:', err);
    throw err;
  }
}

/**
 * Get signed download URL for asset
 */
export async function getAssetDownloadUrl(assetId: string): Promise<string> {
  try {
    const asset = await getAsset(assetId);

    const response = await fetch('/.netlify/functions/assets-signed-url', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assetId, fileKey: asset.file_key }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? `Signed URL request failed (${response.status})`);
    }

    const { url } = await response.json();
    return url;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Get download URL failed:', err);
    throw err;
  }
}

/**
 * Get assets by project
 */
export async function getProjectAssets(projectId: string): Promise<AssetDTO[]> {
  try {
    const { assets } = await fetchAssets({ projectId });
    return assets;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Get project assets failed:', err);
    throw err;
  }
}

/**
 * Get asset statistics for project
 */
export async function getProjectAssetStats(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('type, status, file_size')
      .eq('project_id', projectId)
      .is('deleted_at', null);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalSize: 0,
    };

    data?.forEach((asset: { type: string; status: string; file_size: number | null }) => {
      // Count by type
      stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;

      // Count by status
      stats.byStatus[asset.status] = (stats.byStatus[asset.status] || 0) + 1;

      // Sum file size
      stats.totalSize += asset.file_size || 0;
    });

    return stats;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Get stats failed:', err);
    throw err;
  }
}

/**
 * Batch update assets (for QA approval)
 */
export async function batchUpdateAssets(
  ids: string[],
  updates: UpdateAssetRequest
): Promise<AssetDTO[]> {
  try {
    // Map camelCase field names to snake_case DB columns
    const mapped: Record<string, unknown> = {};
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.description !== undefined) mapped.description = updates.description;
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.thumbnailUrl !== undefined) mapped.thumbnail_url = updates.thumbnailUrl;
    if (updates.previewUrl !== undefined) mapped.preview_url = updates.previewUrl;
    if (updates.processingMetadata !== undefined)
      mapped.processing_metadata = updates.processingMetadata;

    const { data, error } = await supabase.from('assets').update(mapped).in('id', ids).select();

    if (error) {
      throw new Error(`Failed to batch update assets: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Batch update failed:', err);
    throw err;
  }
}

/**
 * Fetch marketplace-listed assets (published + marketplace_listed)
 */
export async function fetchMarketplaceAssets(
  filter: Record<string, string> = {}
): Promise<{ assets: AssetDTO[]; total: number }> {
  try {
    let query = supabase
      .from('assets')
      .select('*')
      .is('deleted_at', null)
      .eq('status', 'published')
      .eq('marketplace_listed', true)
      .order('created_at', { ascending: false });

    if (filter.category) {
      query = query.eq('marketplace_category', filter.category);
    }
    if (filter.search) {
      const escaped = filter.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
      query = query.ilike('name', `%${escaped}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { assets: data || [], total: data?.length || 0 };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Marketplace fetch failed:', err);
    throw err;
  }
}

/**
 * Search assets by name
 */
export async function searchAssets(query: string, projectId?: string): Promise<AssetDTO[]> {
  try {
    const escapedQuery = query.replace(/%/g, '\\%').replace(/_/g, '\\_');
    let q = supabase
      .from('assets')
      .select('*')
      .is('deleted_at', null)
      .ilike('name', `%${escapedQuery}%`);

    if (projectId) {
      q = q.eq('project_id', projectId);
    }

    const { data, error } = await q.limit(50);

    if (error) throw error;

    return data || [];
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AssetsAPI] Search failed:', err);
    throw err;
  }
}
