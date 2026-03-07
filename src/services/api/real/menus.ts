/**
 * Real Menus API Service
 *
 * Connects to Supabase backend for menu config CRUD operations.
 * Uses the menu_configs table with JSONB columns for items and categories.
 *
 * This service is used when VITE_USE_MOCK_DATA=false.
 */

import { supabase } from '@/services/supabase/client';
import type { MenuConfigDTO, MenuConfigUpsertDTO } from '@/types/dtos';

/**
 * Get menu config for a project.
 * Returns null if no config exists (project with no menu yet).
 */
export async function getMenuConfig(projectId: string): Promise<MenuConfigDTO | null> {
  try {
    const { data, error } = await supabase
      .from('menu_configs')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch menu config: ${error.message}`);
    }

    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[MenusAPI] Get failed:', err);
    throw err;
  }
}

/**
 * Create or update a menu config for a project.
 * Uses Supabase UPSERT with onConflict on the project_id unique constraint.
 */
export async function upsertMenuConfig(
  projectId: string,
  data: MenuConfigUpsertDTO
): Promise<MenuConfigDTO> {
  try {
    const { data: result, error } = await supabase
      .from('menu_configs')
      .upsert(
        {
          project_id: projectId,
          title: data.title,
          brand_color: data.brand_color,
          font: data.font,
          show_prices: data.show_prices,
          currency: data.currency,
          field_visibility: data.field_visibility,
          categories: data.categories,
          items: data.items,
        },
        { onConflict: 'project_id' }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save menu config: ${error.message}`);
    }

    return result;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[MenusAPI] Upsert failed:', err);
    throw err;
  }
}
