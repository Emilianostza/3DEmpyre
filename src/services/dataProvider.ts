/**
 * Data Provider with Mock/Real API Switching
 *
 * Unified data access layer that switches between mock and real backend.
 * Supports gradual migration from development mock data to production Supabase.
 *
 * Architecture:
 * - VITE_USE_MOCK_DATA=true: Use in-memory mock data
 * - VITE_USE_MOCK_DATA=false: Use Supabase backend via REST API
 *
 * Authorization Model: RLS-first
 * - Client talks directly to Supabase; all permissions enforced via Row Level Security policies.
 * - Each table/storage bucket has RLS policies scoped to org_id and role.
 * - Netlify Functions are used ONLY for privileged server-side operations:
 *     • gemini-proxy  — AI features (employees only, rate-limited)
 *     • assets-signed-url — private asset download URLs
 *     • publish        — future: publish/deploy workflows
 * - No client-side role filtering — Supabase returns only what the authenticated user may see.
 */

import { env } from '@/config/env';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/services/api/real/projects';
import type { CreateAssetRequest, UpdateAssetRequest } from '@/services/api/real/assets';
import type { Project, Asset } from '@/types';

const USE_REAL_API = !env.useMockData;

/**
 * Dynamic imports for mock vs real services.
 * This allows tree-shaking unused code in production.
 */
const getProjectsService = () =>
  USE_REAL_API ? import('@/services/api/real/projects') : import('@/services/api/mock/projects');

const getAssetsService = () =>
  USE_REAL_API ? import('@/services/api/real/assets') : import('@/services/api/mock/assets');

const getMenusService = () =>
  USE_REAL_API ? import('@/services/api/real/menus') : import('@/services/api/mock/menus');

/**
 * Projects Data Provider
 *
 * Usage:
 * const projects = await ProjectsProvider.list();
 * const project = await ProjectsProvider.get(id);
 */
export const ProjectsProvider = {
  async list(filter = {}) {
    const svc = await getProjectsService();
    const { projects } = await svc.fetchProjects(filter);
    return projects;
  },

  async get(id: string) {
    const svc = await getProjectsService();
    return svc.getProject(id);
  },

  async create(data: CreateProjectRequest | Partial<Project>): Promise<Project> {
    const svc = await getProjectsService();
    return (svc.createProject as (data: CreateProjectRequest | Partial<Project>) => Promise<Project>)(data);
  },

  async update(id: string, data: UpdateProjectRequest | Partial<Project>): Promise<Project> {
    const svc = await getProjectsService();
    return (svc.updateProject as (id: string, data: UpdateProjectRequest | Partial<Project>) => Promise<Project>)(id, data);
  },

  async approve(id: string) {
    const svc = await getProjectsService();
    return svc.approveProject(id);
  },

  async start(id: string) {
    const svc = await getProjectsService();
    return svc.startProject(id);
  },

  async deliver(id: string) {
    const svc = await getProjectsService();
    return svc.deliverProject(id);
  },

  async delete(id: string) {
    const svc = await getProjectsService();
    return svc.deleteProject(id);
  },
};

/**
 * Assets Data Provider
 *
 * Usage:
 * const assets = await AssetsProvider.list({ projectId });
 * const asset = await AssetsProvider.get(id);
 */
export const AssetsProvider = {
  async list(filter = {}) {
    const svc = await getAssetsService();
    const { assets } = await svc.fetchAssets(filter);
    return assets;
  },

  async get(id: string) {
    const svc = await getAssetsService();
    return svc.getAsset(id);
  },

  async create(data: CreateAssetRequest | Partial<Asset>): Promise<Asset> {
    const svc = await getAssetsService();
    return (svc.createAsset as (data: CreateAssetRequest | Partial<Asset>) => Promise<Asset>)(data);
  },

  async update(id: string, data: UpdateAssetRequest | Partial<Asset>): Promise<Asset> {
    const svc = await getAssetsService();
    return (svc.updateAsset as (id: string, data: UpdateAssetRequest | Partial<Asset>) => Promise<Asset>)(id, data);
  },

  async publish(id: string) {
    const svc = await getAssetsService();
    return svc.publishAsset(id);
  },

  async delete(id: string) {
    const svc = await getAssetsService();
    return svc.deleteAsset(id);
  },
};

/**
 * Menus Data Provider
 *
 * Usage:
 * const config = await MenusProvider.get(projectId);
 * await MenusProvider.save(projectId, { title, brand_color, ... });
 */
export const MenusProvider = {
  async get(projectId: string) {
    const svc = await getMenusService();
    return svc.getMenuConfig(projectId);
  },

  async save(projectId: string, data: import('@/types/dtos').MenuConfigUpsertDTO) {
    const svc = await getMenusService();
    return svc.upsertMenuConfig(projectId, data);
  },
};

/**
 * Marketplace Data Provider
 *
 * Usage:
 * const models = await MarketplaceProvider.list();
 * const models = await MarketplaceProvider.list({ category: 'Food' });
 */
export const MarketplaceProvider = {
  async list(filter = {}) {
    const svc = await getAssetsService();
    const { assets } = await svc.fetchMarketplaceAssets(filter);
    return assets;
  },
};
