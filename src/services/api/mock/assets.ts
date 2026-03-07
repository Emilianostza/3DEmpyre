/**
 * Mock Assets API Service
 *
 * Provides realistic asset data for development and testing.
 * Simulates network latency with artificial delays.
 *
 * This service is used when VITE_USE_MOCK_DATA=true or when the real API is unavailable.
 */

import { Asset } from '@/types';
import { placeholder } from '@/config/site';

// ── Helper: deterministic date offsets ──────────────────────────
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

// Mutable in-memory store for mock assets
const MOCK_ASSETS: Asset[] = [
  // ── PRJ-001: Summer Menu Update (Bistro 55) — Delivered ────────
  {
    id: 'AST-101',
    name: 'Margherita Pizza',
    project_id: 'PRJ-001',
    thumb: placeholder(400, 400, 'Pizza', 15),
    status: 'Published',
    type: '3D Model',
    size: '4.2 MB',
    file_size: 4_400_000,
    file_key: 'prj-001/margherita-pizza.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(5),
    created_at: daysAgo(40),
    viewCount: 3240,
    uniqueViewCount: 2180,
    marketplace_listed: true,
    marketplace_price: 149,
    marketplace_category: 'Food',
    marketplace_seller: 'Bistro 55',
  },
  {
    id: 'AST-102',
    name: 'Caesar Salad',
    project_id: 'PRJ-001',
    thumb: placeholder(400, 400, 'Salad', 120),
    status: 'Published',
    type: '3D Model',
    size: '3.1 MB',
    file_size: 3_250_000,
    file_key: 'prj-001/caesar-salad.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(6),
    created_at: daysAgo(42),
    viewCount: 1890,
    uniqueViewCount: 1420,
  },
  {
    id: 'AST-103',
    name: 'Tiramisu',
    project_id: 'PRJ-001',
    thumb: placeholder(400, 400, 'Tiramisu', 30),
    status: 'Published',
    type: '3D Model',
    size: '2.8 MB',
    file_size: 2_936_000,
    file_key: 'prj-001/tiramisu.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(7),
    created_at: daysAgo(43),
    viewCount: 4510,
    uniqueViewCount: 3200,
    marketplace_listed: true,
    marketplace_price: 129,
    marketplace_category: 'Food',
    marketplace_seller: 'Bistro 55',
  },
  {
    id: 'AST-104',
    name: 'Grilled Salmon',
    project_id: 'PRJ-001',
    thumb: placeholder(400, 400, 'Salmon', 200),
    status: 'Published',
    type: '3D Model',
    size: '5.1 MB',
    file_size: 5_347_000,
    file_key: 'prj-001/grilled-salmon.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(6),
    created_at: daysAgo(41),
    viewCount: 2750,
    uniqueViewCount: 1900,
  },

  // ── PRJ-002: Cocktail Bar Remodel (Bistro 55) — Approved ──────
  {
    id: 'AST-201',
    name: 'Old Fashioned',
    project_id: 'PRJ-002',
    thumb: placeholder(400, 400, 'Cocktail', 35),
    status: 'Published',
    type: '3D Model',
    size: '2.4 MB',
    file_size: 2_516_000,
    file_key: 'prj-002/old-fashioned.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(3),
    created_at: daysAgo(18),
    viewCount: 980,
    uniqueViewCount: 720,
    marketplace_listed: true,
    marketplace_price: 99,
    marketplace_category: 'Beverage',
    marketplace_seller: 'Bistro 55',
  },
  {
    id: 'AST-202',
    name: 'Espresso Martini',
    project_id: 'PRJ-002',
    thumb: placeholder(400, 400, 'Martini', 280),
    status: 'In Review',
    type: '3D Model',
    size: '2.1 MB',
    file_size: 2_201_000,
    file_key: 'prj-002/espresso-martini.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(3),
    created_at: daysAgo(15),
    viewCount: 450,
    uniqueViewCount: 380,
  },
  {
    id: 'AST-203',
    name: 'Bar Counter Setup',
    project_id: 'PRJ-002',
    thumb: placeholder(400, 400, 'Bar Counter', 45),
    status: 'Processing',
    type: '3D Model',
    size: '12.3 MB',
    file_size: 12_900_000,
    file_key: 'prj-002/bar-counter.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(1),
    created_at: daysAgo(5),
    viewCount: 120,
    uniqueViewCount: 95,
  },

  // ── PRJ-004: Full Menu Digitization (Café Luna) — InProgress ──
  {
    id: 'AST-401',
    name: 'Croissant Platter',
    project_id: 'PRJ-004',
    thumb: placeholder(400, 400, 'Croissant', 45),
    status: 'Published',
    type: '3D Model',
    size: '3.5 MB',
    file_size: 3_670_000,
    file_key: 'prj-004/croissant-platter.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(8),
    created_at: daysAgo(28),
    viewCount: 2100,
    uniqueViewCount: 1650,
    marketplace_listed: true,
    marketplace_price: 119,
    marketplace_category: 'Food',
    marketplace_seller: 'Café Luna',
  },
  {
    id: 'AST-402',
    name: 'Steak Tartare',
    project_id: 'PRJ-004',
    thumb: placeholder(400, 400, 'Steak', 0),
    status: 'Published',
    type: '3D Model',
    size: '4.8 MB',
    file_size: 5_033_000,
    file_key: 'prj-004/steak-tartare.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(5),
    created_at: daysAgo(25),
    viewCount: 3800,
    uniqueViewCount: 2900,
    marketplace_listed: true,
    marketplace_price: 179,
    marketplace_category: 'Food',
    marketplace_seller: 'Café Luna',
  },
  {
    id: 'AST-403',
    name: 'Crème Brûlée',
    project_id: 'PRJ-004',
    thumb: placeholder(400, 400, 'Crème Brûlée', 50),
    status: 'In Review',
    type: '3D Model',
    size: '2.9 MB',
    file_size: 3_041_000,
    file_key: 'prj-004/creme-brulee.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(2),
    created_at: daysAgo(12),
    viewCount: 680,
    uniqueViewCount: 540,
  },
  {
    id: 'AST-404',
    name: 'Bouillabaisse',
    project_id: 'PRJ-004',
    thumb: placeholder(400, 400, 'Bouillabaisse', 20),
    status: 'Processing',
    type: '3D Model',
    size: '6.2 MB',
    file_size: 6_502_000,
    file_key: 'prj-004/bouillabaisse.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(1),
    created_at: daysAgo(8),
    viewCount: 220,
    uniqueViewCount: 180,
  },
  {
    id: 'AST-405',
    name: 'Cheese Board',
    project_id: 'PRJ-004',
    thumb: placeholder(400, 400, 'Cheese Board', 55),
    status: 'Published',
    type: '3D Model',
    size: '4.0 MB',
    file_size: 4_194_000,
    file_key: 'prj-004/cheese-board.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(4),
    created_at: daysAgo(20),
    viewCount: 1560,
    uniqueViewCount: 1200,
  },

  // ── PRJ-005: Pastry Collection (Café Luna) — QA ───────────────
  {
    id: 'AST-501',
    name: 'Macaron Tower',
    project_id: 'PRJ-005',
    thumb: placeholder(400, 400, 'Macarons', 320),
    status: 'In Review',
    type: '3D Model',
    size: '3.3 MB',
    file_size: 3_461_000,
    file_key: 'prj-005/macaron-tower.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(2),
    created_at: daysAgo(16),
    viewCount: 920,
    uniqueViewCount: 700,
  },
  {
    id: 'AST-502',
    name: 'Éclair au Chocolat',
    project_id: 'PRJ-005',
    thumb: placeholder(400, 400, 'Éclair', 25),
    status: 'In Review',
    type: '3D Model',
    size: '2.6 MB',
    file_size: 2_726_000,
    file_key: 'prj-005/eclair-chocolat.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(2),
    created_at: daysAgo(14),
    viewCount: 640,
    uniqueViewCount: 510,
  },

  // ── PRJ-007: Lobby & Restaurant 3D Tour (Hotel Athena) — Delivered ─
  {
    id: 'AST-701',
    name: 'Hotel Lobby Panorama',
    project_id: 'PRJ-007',
    thumb: placeholder(400, 400, 'Lobby', 210),
    status: 'Published',
    type: '3D Model',
    size: '18.5 MB',
    file_size: 19_398_000,
    file_key: 'prj-007/lobby-panorama.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(15),
    created_at: daysAgo(55),
    viewCount: 5200,
    uniqueViewCount: 3800,
    marketplace_listed: true,
    marketplace_price: 349,
    marketplace_category: 'Interior',
    marketplace_seller: 'Hotel Athena',
  },
  {
    id: 'AST-702',
    name: 'Restaurant Dining Area',
    project_id: 'PRJ-007',
    thumb: placeholder(400, 400, 'Dining Area', 160),
    status: 'Published',
    type: '3D Model',
    size: '15.2 MB',
    file_size: 15_938_000,
    file_key: 'prj-007/dining-area.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(16),
    created_at: daysAgo(56),
    viewCount: 4100,
    uniqueViewCount: 3100,
  },
  {
    id: 'AST-703',
    name: 'Courtyard Fountain',
    project_id: 'PRJ-007',
    thumb: placeholder(400, 400, 'Fountain', 180),
    status: 'Published',
    type: '3D Model',
    size: '8.7 MB',
    file_size: 9_122_000,
    file_key: 'prj-007/courtyard-fountain.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(17),
    created_at: daysAgo(58),
    viewCount: 2900,
    uniqueViewCount: 2200,
  },

  // ── PRJ-008: Rooftop Bar Menu (Hotel Athena) — Approved ───────
  {
    id: 'AST-801',
    name: 'Mezze Platter',
    project_id: 'PRJ-008',
    thumb: placeholder(400, 400, 'Mezze', 60),
    status: 'Published',
    type: '3D Model',
    size: '3.8 MB',
    file_size: 3_984_000,
    file_key: 'prj-008/mezze-platter.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(4),
    created_at: daysAgo(22),
    viewCount: 1340,
    uniqueViewCount: 1050,
  },
  {
    id: 'AST-802',
    name: 'Grilled Octopus',
    project_id: 'PRJ-008',
    thumb: placeholder(400, 400, 'Octopus', 260),
    status: 'In Review',
    type: '3D Model',
    size: '4.4 MB',
    file_size: 4_613_000,
    file_key: 'prj-008/grilled-octopus.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(3),
    created_at: daysAgo(20),
    viewCount: 560,
    uniqueViewCount: 440,
  },

  // ── PRJ-010: Vendor Stall Menus (Tallinn Market Hall) — Delivered ─
  {
    id: 'AST-1001',
    name: 'Smoked Fish Display',
    project_id: 'PRJ-010',
    thumb: placeholder(400, 400, 'Smoked Fish', 190),
    status: 'Published',
    type: '3D Model',
    size: '5.6 MB',
    file_size: 5_872_000,
    file_key: 'prj-010/smoked-fish.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(40),
    created_at: daysAgo(85),
    viewCount: 1870,
    uniqueViewCount: 1400,
    marketplace_listed: true,
    marketplace_price: 159,
    marketplace_category: 'Food',
    marketplace_seller: 'Tallinn Market Hall',
  },
  {
    id: 'AST-1002',
    name: 'Black Bread Basket',
    project_id: 'PRJ-010',
    thumb: placeholder(400, 400, 'Bread', 40),
    status: 'Published',
    type: '3D Model',
    size: '2.3 MB',
    file_size: 2_411_000,
    file_key: 'prj-010/black-bread.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(42),
    created_at: daysAgo(86),
    viewCount: 1240,
    uniqueViewCount: 980,
  },
  {
    id: 'AST-1003',
    name: 'Marzipan Collection',
    project_id: 'PRJ-010',
    thumb: placeholder(400, 400, 'Marzipan', 330),
    status: 'Published',
    type: '3D Model',
    size: '3.9 MB',
    file_size: 4_089_000,
    file_key: 'prj-010/marzipan.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(41),
    created_at: daysAgo(84),
    viewCount: 2060,
    uniqueViewCount: 1550,
    marketplace_listed: true,
    marketplace_price: 139,
    marketplace_category: 'Product',
    marketplace_seller: 'Tallinn Market Hall',
  },

  // ── PRJ-011: Artisan Products (Tallinn Market Hall) — Archived ─
  {
    id: 'AST-1101',
    name: 'Wool Scarf Set',
    project_id: 'PRJ-011',
    thumb: placeholder(400, 400, 'Wool Scarves', 300),
    status: 'Published',
    type: '3D Model',
    size: '4.5 MB',
    file_size: 4_718_000,
    file_key: 'prj-011/wool-scarf.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(90),
    created_at: daysAgo(115),
    viewCount: 870,
    uniqueViewCount: 650,
  },
  {
    id: 'AST-1102',
    name: 'Ceramic Vases',
    project_id: 'PRJ-011',
    thumb: placeholder(400, 400, 'Ceramics', 240),
    status: 'Published',
    type: '3D Model',
    size: '6.1 MB',
    file_size: 6_395_000,
    file_key: 'prj-011/ceramic-vases.glb',
    content_type: 'model/gltf-binary',
    updated_at: daysAgo(92),
    created_at: daysAgo(118),
    viewCount: 1120,
    uniqueViewCount: 840,
  },
];

// Simulate network latency
const NETWORK_DELAY = 500;

/**
 * Fetch assets (with optional filtering)
 */
export async function fetchAssets(filter: Record<string, string> = {}) {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY));

  let results = [...MOCK_ASSETS];

  // Apply filters if provided
  if (filter.project_id) {
    results = results.filter((a) => a.project_id === filter.project_id);
  }
  if (filter.status) {
    results = results.filter((a) => a.status === filter.status);
  }
  if (filter.type) {
    results = results.filter(
      (a) => a.type && a.type.toLowerCase().includes(filter.type.toLowerCase())
    );
  }

  return {
    assets: results,
    total: results.length,
    page: 1,
    pageSize: results.length,
  };
}

/**
 * Get a single asset by ID
 */
export async function getAsset(id: string) {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY));

  const asset = MOCK_ASSETS.find((a) => a.id === id);
  if (!asset) {
    throw new Error(`Asset ${id} not found`);
  }
  return asset;
}

/**
 * Create a new asset
 */
export async function createAsset(data: Partial<Asset>) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newAsset: Asset = {
    id: `AST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    name: data.name || 'Untitled Scene',
    project_id: data.project_id,
    thumb: data.thumb || placeholder(400, 400, 'New Asset', 270),
    status: 'In Review',
    type: data.type || '3D Model',
    size: data.size || 'Unknown',
    file_size: data.file_size || 0,
    file_key: data.file_key,
    content_type: data.content_type || 'model/gltf+json',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    viewCount: 0,
    uniqueViewCount: 0,
  };

  MOCK_ASSETS.unshift(newAsset);
  return newAsset;
}

/**
 * Update an existing asset
 */
export async function updateAsset(id: string, data: Partial<Asset>) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = MOCK_ASSETS.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error(`Asset ${id} not found`);
  }

  const updated = {
    ...MOCK_ASSETS[index],
    ...data,
    id: MOCK_ASSETS[index].id, // Prevent ID changes
    updated_at: new Date().toISOString(),
  };

  MOCK_ASSETS[index] = updated;
  return updated;
}

/**
 * Publish an asset (transitions from in_review to published)
 */
export async function publishAsset(id: string) {
  return updateAsset(id, { status: 'Published' });
}

/**
 * Delete an asset
 */
export async function deleteAsset(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = MOCK_ASSETS.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error(`Asset ${id} not found`);
  }

  MOCK_ASSETS.splice(index, 1);
  return { success: true, id };
}

/**
 * Fetch marketplace-listed assets (published + marketplace_listed)
 */
export async function fetchMarketplaceAssets(filter: Record<string, string> = {}) {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY));

  let results = MOCK_ASSETS.filter(
    (a) => a.status === 'Published' && a.marketplace_listed === true
  );

  if (filter.category) {
    results = results.filter((a) => a.marketplace_category === filter.category);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    results = results.filter((a) => a.name.toLowerCase().includes(q));
  }

  return { assets: results, total: results.length };
}

// Default export for easier importing
export default {
  fetchAssets,
  getAsset,
  createAsset,
  updateAsset,
  publishAsset,
  deleteAsset,
  fetchMarketplaceAssets,
};
