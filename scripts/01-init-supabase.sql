/**
 * Supabase Database Initialization Script
 *
 * Complete schema for managed-capture-3d-platform
 * Run this in Supabase SQL Editor to initialize the database
 *
 * Steps:
 * 1. Create Supabase project
 * 2. Go to SQL Editor
 * 3. Create new query
 * 4. Copy entire contents of this file
 * 5. Run the query
 * 6. Check for any errors
 *
 * Expected result: All 13 tables created with RLS policies
 */

-- ============================================================================
-- 1. ORGANIZATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  country_code text NOT NULL CHECK (country_code ~ '^[a-z]{2}$'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  platform_fee_percent smallint DEFAULT 15,
  currency text DEFAULT 'USD',
  gdpr_consent_given timestamp with time zone,
  data_retention_days smallint DEFAULT 30,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_orgs_slug ON public.orgs(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_country ON public.orgs(country_code);
CREATE INDEX IF NOT EXISTS idx_orgs_status ON public.orgs(status);

ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their orgs"
  ON public.orgs FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update their org"
  ON public.orgs FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 2. USER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  avatar_url text,
  phone text,
  theme text DEFAULT 'light',
  language text DEFAULT 'en',
  timezone text,
  analytics_opt_out boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their profile"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update their profile"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================================================
-- 3. USER ORG MEMBERSHIPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_org_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'approver', 'technician', 'sales_lead', 'customer_owner', 'customer_viewer')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'inactive')),
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  role_assigned_at timestamp with time zone DEFAULT now(),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_org ON public.user_org_memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.user_org_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.user_org_memberships(status);

ALTER TABLE public.user_org_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view memberships in their org"
  ON public.user_org_memberships FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships umem
      WHERE umem.user_id = auth.uid() AND umem.status = 'active'
    )
  );

-- ============================================================================
-- 4. PROJECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  request_id uuid,
  name text NOT NULL,
  description text,
  industry text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'delivered', 'archived', 'rejected')),
  tier text NOT NULL DEFAULT 'standard' CHECK (tier IN ('basic', 'standard', 'premium', 'enterprise')),
  requested_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id),
  started_at timestamp with time zone,
  delivered_at timestamp with time zone,
  assigned_to uuid[] DEFAULT ARRAY[]::uuid[],
  custom_fields jsonb,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_tier ON public.projects(tier);
CREATE INDEX IF NOT EXISTS idx_projects_created ON public.projects(created_at DESC);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view projects in their org"
  ON public.projects FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can insert/update projects"
  ON public.projects FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- ============================================================================
-- 5. ASSETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('photo', 'model3d', 'mesh', 'point_cloud', 'video')),
  status text NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'published', 'failed', 'archived')),
  asset_version smallint DEFAULT 1,
  file_key text NOT NULL,
  file_size bigint NOT NULL,
  content_type text NOT NULL,
  processing_started_at timestamp with time zone,
  processing_completed_at timestamp with time zone,
  processing_metadata jsonb,
  thumbnail_url text,
  preview_url text,
  signed_url text,
  signed_url_expires_at timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_assets_org ON public.assets(org_id);
CREATE INDEX IF NOT EXISTS idx_assets_project ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_created ON public.assets(created_at DESC);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view assets in their org"
  ON public.assets FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- 6. QA CHECKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.qa_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  asset_ids uuid[] NOT NULL,
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  submitted_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  approval_notes text,
  required_changes jsonb,
  resubmitted_at timestamp with time zone,
  rework_count smallint DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qa_project ON public.qa_checks(project_id);
CREATE INDEX IF NOT EXISTS idx_qa_status ON public.qa_checks(status);
CREATE INDEX IF NOT EXISTS idx_qa_created ON public.qa_checks(created_at DESC);

ALTER TABLE public.qa_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view QA checks in their org"
  ON public.qa_checks FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- 7. ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  photographer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'lead' CHECK (role IN ('lead', 'support')),
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled')),
  assigned_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, photographer_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_project ON public.assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_assignments_photographer ON public.assignments(photographer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view assignments in their org"
  ON public.assignments FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- 8. PAYOUTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id),
  asset_ids uuid[] NOT NULL,
  photographer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount bigint NOT NULL,
  currency text DEFAULT 'USD',
  tier text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'failed')),
  requested_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id),
  paid_at timestamp with time zone,
  reference_id text,
  invoice_id text,
  invoice_url text,
  payment_method text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_payouts_org ON public.payouts(org_id);
CREATE INDEX IF NOT EXISTS idx_payouts_photographer ON public.payouts(photographer_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON public.payouts(created_at DESC);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view payouts in their org"
  ON public.payouts FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- 9. AUDIT LOGS TABLE (Read-Only, Immutable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'project_created', 'project_approved', 'project_delivered', 'project_rejected',
    'asset_uploaded', 'asset_processed', 'asset_published',
    'qa_submitted', 'qa_approved', 'qa_changes_requested', 'qa_rejected',
    'payout_created', 'payout_approved', 'payout_paid', 'payout_rejected',
    'user_invited', 'user_accepted', 'user_removed',
    'org_created', 'org_updated'
  )),
  timestamp timestamp with time zone DEFAULT now(),
  actor_id uuid REFERENCES auth.users(id),
  actor_email text,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  from_state jsonb,
  to_state jsonb,
  metadata jsonb,
  ip_address inet,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_audit_org ON public.audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs(resource_type, resource_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view audit logs for their org"
  ON public.audit_logs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- 10. REQUESTS TABLE (Lead Capture)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  company_name text,
  industry text NOT NULL,
  description text NOT NULL,
  budget_range text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'contacted', 'converted', 'rejected')),
  contacted_at timestamp with time zone,
  contacted_by uuid REFERENCES auth.users(id),
  converted_to_org_id uuid REFERENCES public.orgs(id),
  converted_at timestamp with time zone,
  conversion_notes text,
  gdpr_consent boolean DEFAULT false,
  email_consent boolean DEFAULT false,
  source text,
  utm_source text,
  utm_campaign text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_email ON public.requests(requester_email);
CREATE INDEX IF NOT EXISTS idx_requests_created ON public.requests(created_at DESC);

-- ============================================================================
-- 11. ANALYTICS EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigserial PRIMARY KEY,
  org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_timestamp timestamp with time zone DEFAULT now(),
  project_id uuid,
  asset_id uuid,
  page_path text,
  page_title text,
  referrer text,
  properties jsonb,
  user_agent text,
  ip_address inet,
  batch_id uuid,
  received_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_org_time ON public.analytics_events(org_id, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.analytics_events(user_id);

-- ============================================================================
-- 12. AUTO-UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_orgs_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_user_org_memberships_updated_at
  BEFORE UPDATE ON public.user_org_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_qa_checks_updated_at
  BEFORE UPDATE ON public.qa_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 13. VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify row count (should show 0 for new database)
SELECT
  'orgs' as table_name, COUNT(*) as row_count FROM public.orgs
UNION ALL
SELECT 'projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'assets', COUNT(*) FROM public.assets
UNION ALL
SELECT 'user_org_memberships', COUNT(*) FROM public.user_org_memberships
UNION ALL
SELECT 'assignments', COUNT(*) FROM public.assignments
UNION ALL
SELECT 'payouts', COUNT(*) FROM public.payouts
UNION ALL
SELECT 'qa_checks', COUNT(*) FROM public.qa_checks
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM public.audit_logs
UNION ALL
SELECT 'requests', COUNT(*) FROM public.requests;
