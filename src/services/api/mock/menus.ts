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
  { id: 'food', label: 'Food', desc: 'From small plates to signature dishes' },
  { id: 'drinks', label: 'Drinks', desc: 'Handcrafted beverages' },
];

const SEED_ITEMS: MenuItemDTO[] = [
  {
    id: '1',
    name: 'Wagyu Tartare',
    category: 'food',
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
    category: 'food',
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
    category: 'food',
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
    category: 'food',
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
    category: 'food',
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
    category: 'food',
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
  {
    id: '7',
    name: 'Burrata Caprese',
    category: 'food',
    desc: 'Creamy burrata, heirloom tomatoes, aged balsamic reduction, fresh basil, extra virgin olive oil.',
    price: '$18',
    image: placeholder(400, 300, 'Burrata Caprese', 60),
    calories: '320 kcal',
    tags: ['Vegetarian', 'Fresh'],
    allergens: ['Dairy'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['3', '4'],
    review_status: 'approved',
    view_count: 1230,
    ar_launches: 198,
  },
  {
    id: '8',
    name: 'Grilled Salmon',
    category: 'food',
    desc: 'Atlantic salmon, lemon-dill beurre blanc, roasted asparagus, fingerling potatoes.',
    price: '$34',
    image: placeholder(400, 300, 'Grilled Salmon', 20),
    calories: '620 kcal',
    tags: ['Healthy', "Chef's Pick"],
    allergens: ['Fish', 'Dairy'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['7', '12'],
    review_status: 'approved',
    view_count: 1580,
    ar_launches: 267,
  },
  {
    id: '9',
    name: 'Mushroom Risotto',
    category: 'food',
    desc: 'Arborio rice, wild porcini mushrooms, white truffle oil, aged parmesan, fresh chives.',
    price: '$22',
    image: placeholder(400, 300, 'Mushroom Risotto', 35),
    calories: '580 kcal',
    tags: ['Vegetarian', 'Comfort'],
    allergens: ['Dairy'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['7', '2'],
    review_status: 'approved',
    view_count: 920,
    ar_launches: 134,
  },
  {
    id: '10',
    name: 'Tiramisu',
    category: 'food',
    desc: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa dust, dark chocolate shavings.',
    price: '$15',
    image: placeholder(400, 300, 'Tiramisu', 55),
    calories: '480 kcal',
    tags: ['Classic', 'Popular'],
    allergens: ['Dairy', 'Egg', 'Gluten'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['11'],
    review_status: 'approved',
    view_count: 1050,
    ar_launches: 176,
  },
  {
    id: '11',
    name: 'Espresso Martini',
    category: 'drinks',
    desc: 'Fresh espresso, premium vodka, coffee liqueur, vanilla syrup, served ice cold.',
    price: '$16',
    image: placeholder(400, 300, 'Espresso Martini', 70),
    calories: '210 kcal',
    tags: ['Signature', 'Cocktail'],
    allergens: [],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['10', '6'],
    review_status: 'approved',
    view_count: 1420,
    ar_launches: 89,
  },
  {
    id: '12',
    name: 'Sparkling Lemonade',
    category: 'drinks',
    desc: 'House-made lemonade, elderflower syrup, sparkling water, fresh mint, served over ice.',
    price: '$8',
    image: placeholder(400, 300, 'Sparkling Lemonade', 85),
    calories: '120 kcal',
    tags: ['Non-Alcoholic', 'Refreshing'],
    allergens: [],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['8', '4'],
    review_status: 'approved',
    view_count: 680,
    ar_launches: 42,
  },
  {
    id: '13',
    name: 'Tuna Poke Bowl',
    category: 'food',
    desc: 'Sushi-grade ahi tuna, avocado, edamame, sesame-soy dressing, crispy wonton chips.',
    price: '$22',
    image: placeholder(400, 300, 'Tuna Poke Bowl', 50),
    calories: '410 kcal',
    tags: ['Healthy', 'Popular'],
    allergens: ['Fish', 'Soy', 'Gluten'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['12'],
    review_status: 'approved',
    view_count: 1150,
    ar_launches: 210,
  },
  {
    id: '14',
    name: 'Filet Mignon',
    category: 'food',
    desc: '8oz center-cut filet, red wine jus, truffle mashed potatoes, grilled broccolini.',
    price: '$48',
    image: placeholder(400, 300, 'Filet Mignon', 5),
    calories: '780 kcal',
    tags: ['Premium', "Chef's Pick"],
    allergens: ['Dairy'],
    model_url: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairs_well: ['7', '11'],
    review_status: 'approved',
    view_count: 2100,
    ar_launches: 445,
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
