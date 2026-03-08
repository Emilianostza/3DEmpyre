import { describe, it, expect, beforeEach } from 'vitest';
import { getMenuConfig, upsertMenuConfig } from '@/services/api/mock/menus';
import type { MenuConfigUpsertDTO } from '@/types/dtos';

// --------------------------------------------------------------------------
// Mock menus service — direct unit tests against the in-memory store
// --------------------------------------------------------------------------

const SAMPLE_UPSERT: MenuConfigUpsertDTO = {
  title: 'Test Menu',
  brand_color: '#ff0000',
  font: 'sans-serif',
  show_prices: true,
  currency: '€',
  field_visibility: {
    description: true,
    price: true,
    calories: false,
    image: true,
    tags: true,
    allergens: true,
    pairsWell: false,
  },
  categories: [
    { id: 'starters', label: 'Starters', desc: 'Small plates' },
    { id: 'mains', label: 'Mains', desc: 'Big plates' },
  ],
  items: [
    {
      id: 'item-1',
      name: 'Test Dish',
      category: 'starters',
      desc: 'Delicious test dish',
      price: '€15',
      image: 'https://example.com/dish.jpg',
      calories: '200 kcal',
      tags: ['New'],
      allergens: ['Gluten'],
      model_url: 'https://example.com/dish.glb',
      pairs_well: [],
    },
  ],
};

describe('Mock Menus Service', () => {
  describe('getMenuConfig', () => {
    it('returns seeded config for PRJ-001', async () => {
      const config = await getMenuConfig('PRJ-001');

      expect(config).not.toBeNull();
      expect(config!.project_id).toBe('PRJ-001');
      expect(config!.title).toBe('Bistro 55');
      expect(config!.items.length).toBeGreaterThan(0);
      expect(config!.categories.length).toBeGreaterThan(0);
    });

    it('returns null for unknown project', async () => {
      const config = await getMenuConfig('DOES-NOT-EXIST');

      expect(config).toBeNull();
    });
  });

  describe('upsertMenuConfig', () => {
    const TEST_PROJECT = 'PRJ-TEST-' + Date.now();

    beforeEach(async () => {
      // Ensure clean state — create a fresh project ID per suite run
    });

    it('creates a new config when none exists', async () => {
      const result = await upsertMenuConfig(TEST_PROJECT, SAMPLE_UPSERT);

      expect(result.project_id).toBe(TEST_PROJECT);
      expect(result.title).toBe('Test Menu');
      expect(result.brand_color).toBe('#ff0000');
      expect(result.font).toBe('sans-serif');
      expect(result.show_prices).toBe(true);
      expect(result.currency).toBe('€');
      expect(result.items).toHaveLength(1);
      expect(result.categories).toHaveLength(2);
      expect(result.id).toBeTruthy();
      expect(result.created_at).toBeTruthy();
      expect(result.updated_at).toBeTruthy();
    });

    it('updates existing config and preserves id/created_at', async () => {
      // First create
      const created = await upsertMenuConfig(TEST_PROJECT, SAMPLE_UPSERT);
      const originalId = created.id;
      const originalCreatedAt = created.created_at;

      // Then update
      const updated = await upsertMenuConfig(TEST_PROJECT, {
        ...SAMPLE_UPSERT,
        title: 'Updated Menu',
        brand_color: '#00ff00',
      });

      expect(updated.id).toBe(originalId);
      expect(updated.created_at).toBe(originalCreatedAt);
      expect(updated.title).toBe('Updated Menu');
      expect(updated.brand_color).toBe('#00ff00');
    });

    it('roundtrips correctly via get after upsert', async () => {
      await upsertMenuConfig(TEST_PROJECT, SAMPLE_UPSERT);
      const fetched = await getMenuConfig(TEST_PROJECT);

      expect(fetched).not.toBeNull();
      expect(fetched!.title).toBe(SAMPLE_UPSERT.title);
      expect(fetched!.items).toEqual(SAMPLE_UPSERT.items);
      expect(fetched!.categories).toEqual(SAMPLE_UPSERT.categories);
      expect(fetched!.field_visibility).toEqual(SAMPLE_UPSERT.field_visibility);
    });
  });
});
