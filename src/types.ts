import { ProjectStatus } from '@/types/domain';
import type { LucideIcon } from 'lucide-react';

export enum Industry {
  Restaurant = 'Restaurant',
  Hospitality = 'Hospitality',
  Retail = 'Retail',
  RealEstate = 'RealEstate',
  General = 'General',
}

export enum PortalRole {
  PublicVisitor = 'public',
  CustomerOwner = 'customer_owner',
  CustomerViewer = 'customer_viewer',
  Technician = 'technician',
  Approver = 'approver',
  SalesLead = 'sales_lead',
  Admin = 'admin',
  SuperAdmin = 'super_admin',
}

export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}

export interface IndustryConfig {
  id: string;
  title: string;
  subtitle: string;
  heroImage: string;
  outcomes: string[];
  permissions: string[];
  demoImage: string;
  samples: { name: string; thumb: string; tag: string }[];
}

export interface IndustryPortalConfig {
  id: string;
  theme: {
    accent: string;
    accentBg: string;
    accentBgDark: string;
    accentText: string;
    accentTextDark: string;
    gradient: string;
    iconComponent: LucideIcon;
  };
  labels: {
    welcome: string;
    assets: string;
    assetSingular: string;
    projects: string;
    newRequest: string;
  };
  kpis: Array<{
    label: string;
    iconComponent: LucideIcon;
    colorBg: string;
    colorText: string;
    valueKey: 'activeProjects' | 'inReview' | 'published';
  }>;
  widgets: Array<
    | 'assetReview'
    | 'analytics'
    | 'projectProgress'
    | 'assetGrid'
    | 'downloadCenter'
    | 'embedGenerator'
    | 'qrCodeManager'
  >;
}

export interface RequestFormState {
  industry: Industry | '';
  selected_plan: 'Standard' | 'Pro' | 'Ultra' | '';
  quantity_range: string;
  object_size_range: string;
  materials: string[];
  location_mode: 'on_site' | 'ship_in' | '';
  country: string;
  preferred_window: string;
  deliverables: string[];
  contact: {
    full_name: string;
    email: string;
    company: string;
    phone: string;
  };
}

/**
 * PHASE 5: Tier System
 *
 * Tiers determine what features are available for a project.
 * Selected at project creation time.
 * Enforced server-side (cannot be upgraded via frontend).
 */
export enum ServiceTier {
  Basic = 'basic', // Entry level (limited models, no custom domain)
  Business = 'business', // Mid-tier (analytics, branding)
  Enterprise = 'enterprise', // High-end (API access, SLA)
}

export type ProjectType = string;

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  items: number;
  type?: ProjectType;
  address?: string;
  phone?: string;

  // PHASE 3: Lifecycle management
  assigned_to?: string; // Technician ID
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
  qa_approved?: boolean; // Approver sign-off
  customer_approved?: boolean; // Customer acceptance
  payout_triggered?: boolean; // Contractor payment flag
  rejection_reason?: string; // Why rejected (if applicable)

  // PHASE 5: Tier system
  tier?: ServiceTier; // Selected service tier (immutable)
  tier_selected_by?: string; // User ID who selected tier
  tier_selected_at?: string; // ISO timestamp when tier chosen
}

/**
 * PHASE 4: Asset with Storage Metadata
 *
 * Assets are 3D models stored in S3-compatible storage.
 * Metadata is stored in database with signed access URLs.
 */
export interface Asset {
  id: string;
  name: string;
  thumb: string;
  status: 'Published' | 'In Review' | 'Processing';
  type?: string;
  size?: string;
  updated?: string;

  // PHASE 4: Storage metadata
  project_id?: string; // Parent project
  file_key?: string; // S3 object key (path)
  file_size?: number; // Bytes
  content_type?: string; // MIME type (model/gltf-binary)
  storage_url?: string; // S3 bucket URL (not signed)
  access_url?: string; // Signed download URL (expires)
  thumbnail_url?: string; // Signed thumbnail URL
  qr_code_url?: string; // QR code image (signed)
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
  download_count?: number; // Analytics
  viewCount?: number; // Total views
  uniqueViewCount?: number; // Unique viewer count

  // Marketplace / Library
  marketplace_listed?: boolean;
  marketplace_price?: number; // EUR
  marketplace_category?: string; // 'Food' | 'Beverage' | 'Interior' | 'Product'
  marketplace_seller?: string; // Display name (client/business)
}
