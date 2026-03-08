/**
 * Photogrammetry Types - 3D Empyre Photo-to-3D Pipeline
 *
 * DTOs and interfaces for photogrammetry job processing, photo validation,
 * capture guidance, and PBR material output.
 *
 * Based on food-specific photogrammetry research (cross-polarization,
 * ring-shot capture, UDIM texture baking, PBR material workflow).
 */

import {
  PhotogrammetryJobStatus,
  PipelineEngine,
  ModelOutputFormat,
  CaptureMode,
  TextureBakeMethod,
} from '@/types/domain';

// ============================================================================
// JOB DTOs
// ============================================================================

export interface PhotogrammetryJobDTO {
  id: string;
  org_id: string;
  project_id: string;
  status: PhotogrammetryJobStatus;
  engine: PipelineEngine;
  input_asset_ids: string[];
  output_asset_id?: string;
  total_photos: number;
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_error?: string;
  quality_score?: number;
  mesh_triangle_count?: number;
  texture_resolution?: string;
  output_formats: ModelOutputFormat[];
  metadata?: Record<string, unknown>;
  estimated_duration_seconds?: number;
  created_at: string;
  updated_at: string;
  // Enhanced fields from food-photogrammetry research
  capture_mode?: CaptureMode;
  texture_bake_method?: TextureBakeMethod;
  texel_density_ppmm?: number;       // pixels per mm
  pbr_channels?: PBRChannelInfo[];
  validation_summary?: ValidationSummary;
}

// ============================================================================
// PROCESSING STEP DTOs
// ============================================================================

export interface ProcessingStepDTO {
  id: string;
  job_id: string;
  step_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  progress_pct: number;
  log_message?: string;
  error_message?: string;
}

// ============================================================================
// ENHANCED PHOTO VALIDATION (8-metric food-specific)
// ============================================================================

export interface PhotoValidationResult {
  file_name: string;
  is_valid: boolean;
  // 8 validation metrics from food-photogrammetry research
  blur_score: number;           // Laplacian variance; pass if >100
  exposure_clipping_pct: number; // % clipped pixels; pass if <20%
  wb_drift_kelvin: number;      // white balance drift in Kelvin; pass if <50K
  specular_pct: number;         // specular highlight percentage; pass if <10%
  feature_count: number;        // SIFT/ORB feature count; pass if >50
  has_exif: boolean;            // EXIF metadata present
  color_profile: string;        // sRGB, AdobeRGB, ProPhoto etc.
  resolution: string;           // e.g. "6000x4000"
  resolution_mp: number;        // megapixels
  warnings: string[];
}

/** Validation thresholds per the food-photogrammetry research document */
export const VALIDATION_THRESHOLDS = {
  blur_laplacian_min: 100,
  exposure_clipping_max_pct: 20,
  wb_drift_max_kelvin: 50,
  specular_max_pct: 10,
  feature_count_min: 50,
  min_resolution_width: 3000,
  min_resolution_height: 2000,
  min_megapixels: 12,
} as const;

export interface ValidationSummary {
  total_photos: number;
  passed: number;
  failed: number;
  warnings_count: number;
  avg_blur_score: number;
  avg_feature_count: number;
  avg_specular_pct: number;
  exif_consistency: boolean;
}

// ============================================================================
// PBR MATERIAL OUTPUT
// ============================================================================

export interface PBRChannelInfo {
  channel: 'base_color' | 'roughness' | 'normal' | 'ao' | 'metallic' | 'height';
  resolution: string;          // e.g. "4096x4096"
  format: 'png' | 'exr' | 'jpg';
  color_space: 'sRGB' | 'linear';
  file_size_bytes?: number;
}

// ============================================================================
// CAPTURE GUIDANCE
// ============================================================================

export interface CaptureGuidance {
  recommended_photos: number;
  current_coverage_pct: number;
  missing_angles: string[];
  quality_issues: string[];
}

/** Ring-shot capture protocol from food-photogrammetry research */
export interface RingShotProtocol {
  elevation_rings: ElevationRing[];
  total_shots: number;
  turntable_speed_rpm: number;
  overlap_pct: number;
}

export interface ElevationRing {
  angle_degrees: number;       // e.g. 15, 35, 55, 75
  shots_per_ring: number;      // e.g. 24
  label: string;               // e.g. "Low angle", "Eye level", "High angle", "Top-down"
}

/** Pre-capture checklist items */
export interface CaptureChecklistItem {
  id: string;
  category: 'hardware' | 'lighting' | 'camera' | 'scene' | 'calibration';
  label: string;
  description: string;
  is_critical: boolean;
}

// ============================================================================
// REQUEST DTOs
// ============================================================================

export interface CreatePhotogrammetryJobRequest {
  project_id: string;
  asset_ids: string[];
  engine: PipelineEngine;
  output_formats: ModelOutputFormat[];
  priority: 'low' | 'normal' | 'high';
  capture_mode?: CaptureMode;
  texture_bake_method?: TextureBakeMethod;
}
