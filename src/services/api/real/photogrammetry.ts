/**
 * Real Photogrammetry API Service
 *
 * Connects to Supabase backend for photogrammetry job management.
 * Handles job creation, status tracking, processing steps, and photo validation.
 *
 * API Endpoints:
 * - GET /photogrammetry_jobs — List jobs (paginated, filtered)
 * - GET /photogrammetry_jobs/:id — Get single job
 * - POST /photogrammetry_jobs — Create processing job
 * - PATCH /photogrammetry_jobs/:id — Update job status
 * - DELETE /photogrammetry_jobs/:id — Cancel job
 * - GET /processing_steps — Get job processing steps
 * - POST /validate-photos — Validate photos (client-side)
 */

import { supabase } from '@/services/supabase/client';
import {
  PhotogrammetryJobDTO,
  ProcessingStepDTO,
  PhotoValidationResult,
  CreatePhotogrammetryJobRequest,
} from '@/types/photogrammetry';
import { PhotogrammetryJobStatus, PipelineEngine } from '@/types/domain';

// ============================================================================
// FILTER & REQUEST TYPES
// ============================================================================

export interface FetchJobsFilter {
  projectId?: string;
  status?: PhotogrammetryJobStatus;
  engine?: PipelineEngine;
  cursor?: string;
  limit?: number;
}

export interface UpdateJobStatusRequest {
  status: PhotogrammetryJobStatus;
  error?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// JOB MANAGEMENT
// ============================================================================

/**
 * Fetch photogrammetry jobs with pagination and filtering
 */
export async function fetchJobs(filter: FetchJobsFilter = {}): Promise<{
  jobs: PhotogrammetryJobDTO[];
  nextCursor?: string;
}> {
  try {
    let query = supabase
      .from('photogrammetry_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filter.limit || 20);

    // Apply filters
    if (filter.projectId) {
      query = query.eq('project_id', filter.projectId);
    }
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (filter.engine) {
      query = query.eq('engine', filter.engine);
    }

    // Cursor-based pagination
    if (filter.cursor) {
      const cursorDate = new Date(filter.cursor);
      query = query.lt('created_at', cursorDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    const nextCursor =
      data && data.length >= (filter.limit || 20) ? data[data.length - 1].created_at : undefined;

    return {
      jobs: data || [],
      nextCursor,
    };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Fetch jobs failed:', err);
    throw err;
  }
}

/**
 * Get single photogrammetry job by ID
 */
export async function getJob(id: string): Promise<PhotogrammetryJobDTO> {
  try {
    const { data, error } = await supabase
      .from('photogrammetry_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get job: ${error.message}`);
    }

    if (!data) {
      throw new Error('Job not found');
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Get job failed:', err);
    throw err;
  }
}

/**
 * Create a new photogrammetry processing job
 */
export async function createJob(
  data: CreatePhotogrammetryJobRequest
): Promise<PhotogrammetryJobDTO> {
  try {
    const { data: job, error } = await supabase
      .from('photogrammetry_jobs')
      .insert([
        {
          project_id: data.project_id,
          input_asset_ids: data.asset_ids,
          engine: data.engine,
          output_formats: data.output_formats,
          priority: data.priority,
          status: PhotogrammetryJobStatus.Queued,
          total_photos: data.asset_ids.length,
          capture_mode: data.capture_mode ?? null,
          texture_bake_method: data.texture_bake_method ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return job;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Create job failed:', err);
    throw err;
  }
}

/**
 * Cancel a running photogrammetry job
 */
export async function cancelJob(id: string): Promise<PhotogrammetryJobDTO> {
  try {
    const { data, error } = await supabase
      .from('photogrammetry_jobs')
      .update({
        status: PhotogrammetryJobStatus.Cancelled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel job: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Cancel job failed:', err);
    throw err;
  }
}

/**
 * Update photogrammetry job status
 */
export async function updateJobStatus(
  id: string,
  status: PhotogrammetryJobStatus,
  error?: string,
  metadata?: Record<string, unknown>
): Promise<PhotogrammetryJobDTO> {
  try {
    const payload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (error) {
      payload.processing_error = error;
    }

    if (metadata) {
      payload.metadata = metadata;
    }

    // Set processing timestamps
    if (status === PhotogrammetryJobStatus.Preprocessing) {
      payload.processing_started_at = new Date().toISOString();
    }
    if (
      status === PhotogrammetryJobStatus.Completed ||
      status === PhotogrammetryJobStatus.Failed ||
      status === PhotogrammetryJobStatus.Cancelled
    ) {
      payload.processing_completed_at = new Date().toISOString();
    }

    const { data, error: updateError } = await supabase
      .from('photogrammetry_jobs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update job status: ${updateError.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Update job status failed:', err);
    throw err;
  }
}

/**
 * Get all photogrammetry jobs for a project
 */
export async function getJobsByProject(projectId: string): Promise<PhotogrammetryJobDTO[]> {
  try {
    const { jobs } = await fetchJobs({ projectId, limit: 1000 });
    return jobs;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Get project jobs failed:', err);
    throw err;
  }
}

// ============================================================================
// PROCESSING STEPS
// ============================================================================

/**
 * Get processing steps for a photogrammetry job
 */
export async function getJobSteps(jobId: string): Promise<ProcessingStepDTO[]> {
  try {
    const { data, error } = await supabase
      .from('processing_steps')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch processing steps: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Get job steps failed:', err);
    throw err;
  }
}

// ============================================================================
// PHOTO VALIDATION
// ============================================================================

/**
 * Compute Laplacian variance for blur detection
 * Higher variance = sharper image, lower variance = blurry
 */
function computeLaplacianVariance(imageData: ImageData): number {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Grayscale conversion
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray.push(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Apply Laplacian kernel
  let sum = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const laplacian =
        -gray[idx - width - 1] -
        gray[idx - width] -
        gray[idx - width + 1] -
        gray[idx - 1] +
        8 * gray[idx] -
        gray[idx + 1] -
        gray[idx + width - 1] -
        gray[idx + width] -
        gray[idx + width + 1];

      sum += laplacian * laplacian;
      count++;
    }
  }

  return count > 0 ? sum / count : 0;
}

/**
 * Check for EXIF data in image file
 * Returns true if EXIF data is present
 */
function hasEXIFData(arrayBuffer: ArrayBuffer): boolean {
  const view = new Uint8Array(arrayBuffer);

  // Check for JPEG SOI marker (FFD8)
  if (view[0] !== 0xff || view[1] !== 0xd8) {
    return false;
  }

  // Look for APP1 marker (FFE1) which contains EXIF data
  let pos = 2;
  while (pos < view.length) {
    if (view[pos] !== 0xff) {
      break;
    }
    const marker = view[pos + 1];

    // APP1 marker found
    if (marker === 0xe1) {
      return true;
    }

    // Skip this segment
    const length = (view[pos + 2] << 8) | view[pos + 3];
    pos += 2 + length;
  }

  return false;
}

/**
 * Client-side photo validation with blur detection, resolution check, and EXIF verification
 */
export async function validatePhotos(files: File[]): Promise<PhotoValidationResult[]> {
  const results: PhotoValidationResult[] = [];

  for (const file of files) {
    const result: PhotoValidationResult = {
      file_name: file.name,
      is_valid: true,
      blur_score: 0,
      exposure_clipping_pct: 0,
      wb_drift_kelvin: 0,
      specular_pct: 0,
      feature_count: 0,
      has_exif: false,
      color_profile: 'sRGB',
      resolution: '0x0',
      resolution_mp: 0,
      warnings: [],
    };

    try {
      // Read file as ArrayBuffer for EXIF check
      const arrayBuffer = await file.arrayBuffer();
      result.has_exif = hasEXIFData(arrayBuffer);

      // Create image element for dimension and blur detection
      const blob = new Blob([arrayBuffer], { type: file.type });
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        const img = document.createElement('img');

        img.onload = () => {
          try {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const megapixels = (width * height) / 1000000;

            result.resolution = `${width}x${height}`;
            result.resolution_mp = megapixels;

            // Check minimum resolution (2MP)
            if (megapixels < 2) {
              result.is_valid = false;
              result.warnings.push(
                `Resolution ${width}x${height} (${megapixels.toFixed(2)}MP) below minimum 2MP`
              );
            }

            // Blur detection using canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              result.warnings.push('Unable to analyze blur');
              resolve();
              return;
            }

            // Resize for performance (max 640px)
            const maxDim = 640;
            let drawWidth = width;
            let drawHeight = height;

            if (width > maxDim || height > maxDim) {
              const ratio = width / height;
              if (ratio > 1) {
                drawWidth = maxDim;
                drawHeight = Math.round(maxDim / ratio);
              } else {
                drawHeight = maxDim;
                drawWidth = Math.round(maxDim * ratio);
              }
            }

            canvas.width = drawWidth;
            canvas.height = drawHeight;
            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

            const imageData = ctx.getImageData(0, 0, drawWidth, drawHeight);
            const variance = computeLaplacianVariance(imageData);

            // Normalize blur score (0-100, where higher = sharper)
            // Empirically, sharp images have variance > 100
            const blurScore = Math.min(100, (variance / 100) * 100);
            result.blur_score = blurScore;

            // Flag as potentially blurry if score < 30
            if (blurScore < 30) {
              result.warnings.push(
                `Photo appears blurry (sharpness score: ${blurScore.toFixed(1)}/100)`
              );
            }

            // Check for EXIF
            if (!result.has_exif) {
              result.warnings.push('No EXIF metadata detected');
            }

            resolve();
          } catch {
            result.warnings.push('Error analyzing image');
            resolve();
          }
        };

        img.onerror = () => {
          result.is_valid = false;
          result.warnings.push('Unable to load image');
          reject(new Error('Image load failed'));
        };

        img.src = url;
      });

      URL.revokeObjectURL(url);
    } catch (err) {
      result.is_valid = false;
      result.warnings.push(
        `Validation error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
      if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Validate photo failed:', err);
    }

    results.push(result);
  }

  return results;
}

// ============================================================================
// AI PREVIEW
// ============================================================================

/**
 * Request SAM 3D quick preview for a photo asset
 */
export async function requestAIPreview(photoAssetId: string): Promise<{ previewUrl: string }> {
  try {
    const response = await fetch('/.netlify/functions/sam3d-preview', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoAssetId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? `Preview request failed (${response.status})`);
    }

    const data = await response.json();
    return { previewUrl: data.previewUrl };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Request AI preview failed:', err);
    throw err;
  }
}

// ============================================================================
// PROJECT STATISTICS
// ============================================================================

/**
 * Get photogrammetry pipeline statistics for a project
 */
export async function getProjectPipelineStats(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('photogrammetry_jobs')
      .select('status, processing_started_at, processing_completed_at')
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Failed to fetch pipeline stats: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      byStatus: {} as Record<string, number>,
      avgProcessingTimeSeconds: 0,
    };

    // Count by status
    const processingTimes: number[] = [];
    data?.forEach(
      (job: {
        status: string;
        processing_started_at: string | null;
        processing_completed_at: string | null;
      }) => {
        stats.byStatus[job.status] = (stats.byStatus[job.status] || 0) + 1;

        // Calculate processing time if both timestamps exist
        if (job.processing_started_at && job.processing_completed_at) {
          const start = new Date(job.processing_started_at).getTime();
          const end = new Date(job.processing_completed_at).getTime();
          const durationSeconds = (end - start) / 1000;
          processingTimes.push(durationSeconds);
        }
      }
    );

    // Calculate average processing time
    if (processingTimes.length > 0) {
      stats.avgProcessingTimeSeconds =
        processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
    }

    return stats;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[PhotogrammetryAPI] Get pipeline stats failed:', err);
    throw err;
  }
}
