/**
 * Menu Configs Table — Migration #2
 *
 * Stores per-project restaurant menu configuration:
 * display settings, categories, and menu items (as JSONB).
 *
 * Run AFTER 01-init-supabase.sql in Supabase SQL Editor.
 *
 * Expected result: 1 table created with RLS policies + trigger
 */

-- ============================================================================
-- MENU CONFIGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_configs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id       uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Display settings
  title            text NOT NULL DEFAULT 'Restaurant Menu',
  brand_color      text NOT NULL DEFAULT '#d97706',
  font             text NOT NULL DEFAULT 'serif',
  show_prices      boolean NOT NULL DEFAULT true,
  currency         text NOT NULL DEFAULT '$',
  field_visibility jsonb NOT NULL DEFAULT '{"description":true,"price":true,"calories":true,"image":true,"tags":true,"allergens":true,"pairsWell":true}',

  -- Menu structure (JSONB — loaded/saved as a whole unit)
  categories       jsonb NOT NULL DEFAULT '[]',
  items            jsonb NOT NULL DEFAULT '[]',

  -- Timestamps
  created_at       timestamp with time zone DEFAULT now(),
  updated_at       timestamp with time zone DEFAULT now(),

  -- One menu config per project
  UNIQUE(project_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menu_configs_project ON public.menu_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_menu_configs_org ON public.menu_configs(org_id);

-- Auto-update updated_at (uses function from 01-init-supabase.sql)
CREATE TRIGGER IF NOT EXISTS update_menu_configs_updated_at
  BEFORE UPDATE ON public.menu_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.menu_configs ENABLE ROW LEVEL SECURITY;

-- Members of the org can view menu configs
CREATE POLICY IF NOT EXISTS "Users can view their org menu configs"
  ON public.menu_configs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Admins, approvers, and technicians can insert menu configs
CREATE POLICY IF NOT EXISTS "Staff can create menu configs"
  ON public.menu_configs FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('admin', 'approver', 'technician')
    )
  );

-- Admins, approvers, and technicians can update menu configs
CREATE POLICY IF NOT EXISTS "Staff can update menu configs"
  ON public.menu_configs FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('admin', 'approver', 'technician')
    )
  );

-- Public read access for published menus (customers viewing the menu page)
CREATE POLICY IF NOT EXISTS "Public can view menu configs"
  ON public.menu_configs FOR SELECT
  USING (true);
