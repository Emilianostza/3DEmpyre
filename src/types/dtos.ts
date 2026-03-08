/**
 * Data Transfer Objects (DTOs) - Phase 2+
 *
 * Serializable types for API request/response bodies.
 * Pattern: snake_case keys for JSON serialization.
 */

import { ProjectStatus, AssetStatus, AssetType, TierType } from '@/types/domain';

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginatedResponseDTO<T> {
  data: T[];
  next_cursor?: string;
  has_more: boolean;
}

// ============================================================================
// PROJECT DTOs
// ============================================================================

export interface ProjectDTO {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  industry: string;
  status: ProjectStatus;
  tier: TierType;
  customer_id: string;
  created_by: string;
  assigned_to?: string[];
  metadata?: Record<string, unknown>;
  requested_at: string;
  approved_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// ============================================================================
// ASSET DTOs
// ============================================================================

export interface AssetDTO {
  id: string;
  org_id: string;
  project_id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  file_key: string;
  file_size: number;
  content_type: string;
  asset_version: number;
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_error?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// ============================================================================
// MENU CONFIG DTOs
// ============================================================================

export interface MenuItemDTO {
  id: string;
  name: string;
  category: string;
  desc: string;
  price: string;
  image: string;
  calories: string;
  tags: string[];
  allergens: string[];
  model_url: string;
  pairs_well: string[];
  hidden?: boolean;
  review_status?: 'pending' | 'approved' | 'rejected';
  view_count?: number;
  ar_launches?: number;
  marketplace_listed?: boolean;
  marketplace_price?: string;
}

export interface MenuCategoryDTO {
  id: string;
  label: string;
  desc: string;
}

export interface MenuConfigDTO {
  id: string;
  org_id: string;
  project_id: string;
  title: string;
  brand_color: string;
  theme_preset?: string;
  custom_brand_color?: string;
  font: string;
  show_prices: boolean;
  currency: string;
  enableTimeBasedMenu?: boolean;
  breakfastEndTime?: string;
  lunchEndTime?: string;
  lunchMenuId?: string;
  dinnerMenuId?: string;
  field_visibility: Record<string, boolean>;
  categories: MenuCategoryDTO[];
  items: MenuItemDTO[];
  created_at: string;
  updated_at: string;
}

/** Payload for creating/updating a menu config (omits server-managed fields). */
export type MenuConfigUpsertDTO = Omit<
  MenuConfigDTO,
  'id' | 'org_id' | 'project_id' | 'created_at' | 'updated_at'
>;

// ============================================================================
// API RESPONSE ENVELOPE
// ============================================================================

export interface ApiResponseDTO<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}
