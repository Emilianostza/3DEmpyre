/**
 * Mock Menus API Service
 *
 * Provides in-memory menu config storage for development and testing.
 * Simulates network latency with artificial delays.
 *
 * This service is used when VITE_USE_MOCK_DATA=true.
 */

import type { MenuConfigDTO, MenuConfigUpsertDTO, MenuItemDTO, MenuCategoryDTO } from '@/types/dtos';
import { placeholder } from '@/config/site';

// ── Helper ────────────────────────────────────────────────────────────────────

const delay = (ms = 200) => new Promise<void>((r) => setTimeout(r, ms));

// ── Seed Data ─────────────────────────────────────────────────────────────────

const SEED_CATEGORIES: MenuCategoryDTO[] = [
  { id: 'starters', label: 'Starters', desc: 'Shareable small plates' },
  { id: 'mains', label: 'Main Courses', desc: 'Signature dishes' },
  { id: 'desserts', label: 'Desserts', desc: 'Sweet finales' },
];

const SEED_ITEMS: MenuItemDTO[] = [
  {
    id: '1',
    name: 'Wagyu Tartare',
    category: 'starters',
    desc: 'A5 wagyu, quail egg yolk, capers, shallots, dijon, served with crostini.',
    price: '$28',
    image: placeholder(400, 300, 'Wagyu Tartare', 15),
    calories: '380 kcal',
    tags: ['Raw', "Chef's Pick"],
    allergens: ['Egg', 'Gluten'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['2', '3'],
    review_status: 'approved',
    view_count: 1842,
    ar_launches: 312,
  },
  {
    id: '2',
    name: 'Truffle Fries',
    category: 'starters',
    desc: 'Hand-cut Kennebec potatoes, parmesan dust, fresh herbs, drizzled with black truffle oil.',
    price: '$12',
    image: placeholder(400, 300, 'Truffle Fries', 45),
    calories: '450 kcal',
    tags: ['Vegetarian', 'Shareable'],
    allergens: ['Dairy'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['5'],
    review_status: 'approved',
    view_count: 965,
    ar_launches: 87,
  },
  {
    id: '3',
    name: 'Signature Burger',
    category: 'mains',
    desc: 'Wagyu beef patty, aged white cheddar, house-made truffle aioli, caramelized onions on a toasted brioche bun.',
    price: '$24',
    image: placeholder(400, 300, 'Signature Burger', 25),
    calories: '850 kcal',
    tags: ["Chef's Pick", 'Bestseller'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['2', '4'],
    review_status: 'pending',
    view_count: 2340,
    ar_launches: 518,
  },
  {
    id: '4',
    name: 'Lobster Roll',
    category: 'mains',
    desc: 'Maine lobster, lemon-herb butter, chives, served on a toasted New England split-top roll.',
    price: '$32',
    image: placeholder(400, 300, 'Lobster Roll', 10),
    calories: '520 kcal',
    tags: ['Premium', 'Seasonal'],
    allergens: ['Shellfish', 'Gluten', 'Dairy'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['2'],
    review_status: 'approved',
    view_count: 1120,
    ar_launches: 203,
  },
  {
    id: '5',
    name: 'Artisan Shake',
    category: 'desserts',
    desc: 'Tahitian vanilla bean, house salted caramel swirl, whipped cream, edible gold leaf.',
    price: '$16',
    image: placeholder(400, 300, 'Artisan Shake', 280),
    calories: '600 kcal',
    tags: ['Signature', 'Sweet'],
    allergens: ['Dairy', 'Egg'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['6'],
    review_status: 'rejected',
    view_count: 430,
    ar_launches: 28,
  },
  {
    id: '6',
    name: 'Crème Brûlée',
    category: 'desserts',
    desc: 'Classic Tahitian vanilla custard, torched sugar crust, fresh berries.',
    price: '$14',
    image: placeholder(400, 300, 'Crème Brûlée', 40),
    calories: '420 kcal',
    tags: ['Dessert', 'Classic'],
    allergens: ['Dairy', 'Egg'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['5'],
    review_status: 'approved',
    view_count: 780,
    ar_launches: 145,
  },
];

// ── In-Memory Store ───────────────────────────────────────────────────────────

const store = new Map<string, MenuConfigDTO>();

// Pre-seed PRJ-001 so dev mode works immediately
store.set('PRJ-001', {
  id: 'menu-001',
  org_id: 'org-001',
  project_id: 'PRJ-001',
  title: 'Bistro 55',
  brand_color: '#d97706',
  theme_preset: 'amber',
  custom_brand_color: '',
  font: 'serif',
  show_prices: true,
  currency: '$',
  field_visibility: {
    description: true,
    price: true,
    calories: true,
    image: true,
    tags: true,
    allergens: true,
    pairsWell: true,
  },
  categories: SEED_CATEGORIES,
  items: SEED_ITEMS,
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
});

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get menu config for a project.
 * Returns null if no config exists (project with no menu yet).
 */
export async function getMenuConfig(projectId: string): Promise<MenuConfigDTO | null> {
  await delay();
  return store.get(projectId) ?? null;
}

/**
 * Create or update a menu config for a project.
 * Simulates Supabase UPSERT with onConflict: 'project_id'.
 */
export async function upsertMenuConfig(
  projectId: string,
  data: MenuConfigUpsertDTO
): Promise<MenuConfigDTO> {
  await delay();

  const now = new Date().toISOString();
  const existing = store.get(projectId);

  const config: MenuConfigDTO = {
    id: existing?.id ?? `menu-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
    org_id: existing?.org_id ?? 'org-001',
    project_id: projectId,
    title: data.title,
    brand_color: data.brand_color,
    theme_preset: data.theme_preset,
    custom_brand_color: data.custom_brand_color,
    font: data.font,
    show_prices: data.show_prices,
    currency: data.currency,
    field_visibility: data.field_visibility,
    categories: data.categories,
    items: data.items,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };

  store.set(projectId, config);
  return config;
}
