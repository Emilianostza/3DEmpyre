# Supabase Database Schema

Complete schema for the managed-capture-3d-platform production database.

## Tables

### Organizations (orgs)

Multi-tenant organization container for all projects and users.

```sql
CREATE TABLE public.orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  country_code text NOT NULL, -- ISO 3166-1 alpha-2 (ee, gr, fr, etc.)
  status text NOT NULL DEFAULT 'active', -- active, suspended, deleted

  -- Financial
  platform_fee_percent smallint DEFAULT 15, -- 15% default
  currency text DEFAULT 'USD',

  -- GDPR Compliance
  gdpr_consent_given timestamp with time zone,
  data_retention_days smallint DEFAULT 30, -- Days to retain analytics after deletion

  -- Metadata
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,

  CONSTRAINT valid_country_code CHECK (country_code ~ '^[a-z]{2}$'),
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'deleted'))
);

CREATE INDEX idx_orgs_slug ON public.orgs(slug);
CREATE INDEX idx_orgs_country ON public.orgs(country_code);
CREATE INDEX idx_orgs_status ON public.orgs(status);
```

### Users (auth.users)

Managed by Supabase Auth - includes email, password hash, etc.

### User Profiles (user_profiles)

Extended user information beyond Auth.

```sql
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  avatar_url text,
  phone text,

  -- Preferences
  theme text DEFAULT 'light', -- light, dark, system
  language text DEFAULT 'en',
  timezone text,

  -- Privacy
  analytics_opt_out boolean DEFAULT false,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
```

### Organization Memberships (user_org_memberships)

Maps users to organizations with roles.

```sql
CREATE TABLE public.user_org_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL, -- admin, approver, technician, sales_lead, customer_owner, customer_viewer
  status text NOT NULL DEFAULT 'active', -- invited, active, inactive

  -- Audit
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  role_assigned_at timestamp with time zone DEFAULT now(),

  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  UNIQUE(org_id, user_id),
  CONSTRAINT valid_role CHECK (role IN (
    'admin', 'approver', 'technician', 'sales_lead',
    'customer_owner', 'customer_viewer'
  )),
  CONSTRAINT valid_status CHECK (status IN ('invited', 'active', 'inactive'))
);

CREATE INDEX idx_memberships_org ON public.user_org_memberships(org_id);
CREATE INDEX idx_memberships_user ON public.user_org_memberships(user_id);
CREATE INDEX idx_memberships_status ON public.user_org_memberships(status);
```

### Projects (projects)

Client project records containing scope, assets, and deliverables.

```sql
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.requests(id), -- Links to original request

  -- Project Info
  name text NOT NULL,
  description text,
  industry text NOT NULL, -- restaurant, retail, real-estate, etc.
  status text NOT NULL DEFAULT 'pending', -- pending, approved, in_progress, delivered, archived, rejected
  tier text NOT NULL DEFAULT 'standard', -- basic, standard, premium, enterprise

  -- Scope
  requested_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id),
  started_at timestamp with time zone,
  delivered_at timestamp with time zone,

  -- Assignments
  assigned_to uuid[] DEFAULT ARRAY[]::uuid[], -- Array of photographer user IDs

  -- Customization
  custom_fields jsonb, -- Client-specific data
  metadata jsonb,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,

  CONSTRAINT valid_status CHECK (status IN (
    'pending', 'approved', 'in_progress', 'delivered', 'archived', 'rejected'
  )),
  CONSTRAINT valid_tier CHECK (tier IN ('basic', 'standard', 'premium', 'enterprise'))
);

CREATE INDEX idx_projects_org ON public.projects(org_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_tier ON public.projects(tier);
CREATE INDEX idx_projects_created ON public.projects(created_at DESC);
```

### Assets (assets)

Individual deliverables (photos, 3D models, meshes, point clouds, videos).

```sql
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Asset Info
  name text NOT NULL,
  description text,
  type text NOT NULL, -- photo, model3d, mesh, point_cloud, video
  status text NOT NULL DEFAULT 'uploading', -- uploading, processing, published, failed, archived
  asset_version smallint DEFAULT 1,

  -- File Storage
  file_key text NOT NULL, -- S3 key / path
  file_size bigint NOT NULL, -- bytes
  content_type text NOT NULL, -- image/jpeg, model/gltf+json, etc.

  -- Processing
  processing_started_at timestamp with time zone,
  processing_completed_at timestamp with time zone,
  processing_metadata jsonb, -- Results from processing pipeline

  -- Derivatives & Optimization
  thumbnail_url text,
  preview_url text,
  signed_url text, -- Temporary signed URL for download
  signed_url_expires_at timestamp with time zone,

  -- Metadata
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,

  CONSTRAINT valid_type CHECK (type IN (
    'photo', 'model3d', 'mesh', 'point_cloud', 'video'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'uploading', 'processing', 'published', 'failed', 'archived'
  ))
);

CREATE INDEX idx_assets_org ON public.assets(org_id);
CREATE INDEX idx_assets_project ON public.assets(project_id);
CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_assets_type ON public.assets(type);
CREATE INDEX idx_assets_created ON public.assets(created_at DESC);
```

### QA Checks (qa_checks)

Quality assurance workflow for asset approval.

```sql
CREATE TABLE public.qa_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Submission
  asset_ids uuid[] NOT NULL, -- Assets being checked
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  submitted_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'pending', -- pending, approved, changes_requested, rejected

  -- Review
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  approval_notes text,

  -- If Changes Requested
  required_changes jsonb, -- {asset_id: ['issue1', 'issue2'], ...}
  resubmitted_at timestamp with time zone,
  rework_count smallint DEFAULT 0,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT valid_status CHECK (status IN (
    'pending', 'approved', 'changes_requested', 'rejected'
  ))
);

CREATE INDEX idx_qa_project ON public.qa_checks(project_id);
CREATE INDEX idx_qa_status ON public.qa_checks(status);
CREATE INDEX idx_qa_created ON public.qa_checks(created_at DESC);
```

### Assignments (assignments)

Photographer assignment to project.

```sql
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  photographer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Assignment Info
  role text NOT NULL DEFAULT 'lead', -- lead, support
  status text NOT NULL DEFAULT 'assigned', -- assigned, accepted, in_progress, completed, cancelled

  -- Timeline
  assigned_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,

  -- Notes
  notes text,
  metadata jsonb,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  UNIQUE(project_id, photographer_id),
  CONSTRAINT valid_role CHECK (role IN ('lead', 'support')),
  CONSTRAINT valid_status CHECK (status IN (
    'assigned', 'accepted', 'in_progress', 'completed', 'cancelled'
  ))
);

CREATE INDEX idx_assignments_project ON public.assignments(project_id);
CREATE INDEX idx_assignments_photographer ON public.assignments(photographer_id);
CREATE INDEX idx_assignments_status ON public.assignments(status);
```

### Payouts (payouts)

Photographer earnings and payment records.

```sql
CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id),
  asset_ids uuid[] NOT NULL, -- Assets included in payout

  -- Photographer & Amount
  photographer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount bigint NOT NULL, -- cents USD
  currency text DEFAULT 'USD',
  tier text NOT NULL, -- Tier used for calculation

  -- Workflow
  status text NOT NULL DEFAULT 'pending', -- pending, approved, paid, rejected, failed
  requested_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id),
  paid_at timestamp with time zone,

  -- Payment Details
  reference_id text, -- Bank transfer ID, check #, etc.
  invoice_id text,
  invoice_url text,
  payment_method text, -- bank_transfer, check, paypal, stripe

  -- Reconciliation
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,

  CONSTRAINT valid_status CHECK (status IN (
    'pending', 'approved', 'paid', 'rejected', 'failed'
  ))
);

CREATE INDEX idx_payouts_org ON public.payouts(org_id);
CREATE INDEX idx_payouts_photographer ON public.payouts(photographer_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);
CREATE INDEX idx_payouts_created ON public.payouts(created_at DESC);
```

### Audit Logs (audit_logs)

Immutable append-only logs for compliance.

```sql
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,

  -- Event Info
  event_type text NOT NULL, -- project_created, project_approved, asset_uploaded, etc.
  timestamp timestamp with time zone DEFAULT now(),

  -- Actor
  actor_id uuid REFERENCES auth.users(id),
  actor_email text,

  -- Resource
  resource_type text NOT NULL, -- project, asset, payout, assignment, qa_check
  resource_id uuid NOT NULL,

  -- State Change
  from_state jsonb,
  to_state jsonb,

  -- Context
  metadata jsonb,
  ip_address inet,
  user_agent text,

  CONSTRAINT valid_event_type CHECK (event_type IN (
    'project_created', 'project_approved', 'project_delivered', 'project_rejected',
    'asset_uploaded', 'asset_processed', 'asset_published',
    'qa_submitted', 'qa_approved', 'qa_changes_requested', 'qa_rejected',
    'payout_created', 'payout_approved', 'payout_paid', 'payout_rejected',
    'user_invited', 'user_accepted', 'user_removed',
    'org_created', 'org_updated'
  ))
);

CREATE INDEX idx_audit_org ON public.audit_logs(org_id);
CREATE INDEX idx_audit_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_resource ON public.audit_logs(resource_type, resource_id);
```

### Requests (requests)

Lead capture form submissions.

```sql
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Requester Info
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  company_name text,

  -- Request Details
  industry text NOT NULL, -- restaurant, retail, real-estate, etc.
  description text NOT NULL,
  budget_range text, -- <5k, 5-10k, 10-25k, 25k+

  -- Status Workflow
  status text NOT NULL DEFAULT 'submitted', -- submitted, reviewing, contacted, converted, rejected
  contacted_at timestamp with time zone,
  contacted_by uuid REFERENCES auth.users(id),

  -- Conversion
  converted_to_org_id uuid REFERENCES public.orgs(id),
  converted_at timestamp with time zone,
  conversion_notes text,

  -- GDPR
  gdpr_consent boolean DEFAULT false,
  email_consent boolean DEFAULT false,

  -- Metadata
  source text, -- website, referral, sales, etc.
  utm_source text,
  utm_campaign text,
  metadata jsonb,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT valid_status CHECK (status IN (
    'submitted', 'reviewing', 'contacted', 'converted', 'rejected'
  ))
);

CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_email ON public.requests(requester_email);
CREATE INDEX idx_requests_created ON public.requests(created_at DESC);
```

### Analytics Events (analytics_events)

Raw event stream for analytics and dashboards.

```sql
CREATE TABLE public.analytics_events (
  id bigserial PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event
  event_type text NOT NULL, -- user_signed_in, page_viewed, asset_uploaded, etc.
  event_timestamp timestamp with time zone DEFAULT now(),

  -- Context
  project_id uuid,
  asset_id uuid,
  page_path text,
  page_title text,
  referrer text,

  -- Properties
  properties jsonb,

  -- Client Info
  user_agent text,
  ip_address inet,

  -- Analytics-specific (not searchable)
  batch_id uuid, -- For grouping batched events
  received_at timestamp with time zone DEFAULT now()
);

-- Partitioned by date for performance with time-series data
-- CREATE TABLE public.analytics_events_2024_01 PARTITION OF public.analytics_events
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE INDEX idx_analytics_org_time ON public.analytics_events(org_id, event_timestamp DESC);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_user ON public.analytics_events(user_id);
```

## Row Level Security (RLS) Policies

### Organizations

```sql
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orgs they belong to"
  ON public.orgs FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid()
    )
  );
```

### Projects

```sql
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their org"
  ON public.projects FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert/update/delete projects"
  ON public.projects FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Assets

```sql
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assets in their org"
  ON public.assets FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid()
    )
  );
```

### Audit Logs (Read-Only)

```sql
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their org"
  ON public.audit_logs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid()
    )
  );
```

## Triggers

### Auto-update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- (Add for other tables as needed)
```

### Audit log on project status change

```sql
CREATE OR REPLACE FUNCTION audit_project_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (
      org_id, event_type, actor_id,
      resource_type, resource_id,
      from_state, to_state
    ) VALUES (
      NEW.org_id,
      'project_' || LOWER(NEW.status),
      auth.uid(),
      'project',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_project_status_change
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION audit_project_change();
```

## Setup Instructions

### 1. Create Supabase Project

- Go to https://app.supabase.com
- Create new project (Choose PostgreSQL 15+)
- Note your `Project URL` and `Anonymous Key` (anon public key)

### 2. Run Migrations

- Copy all SQL from this file
- Go to Supabase Dashboard → SQL Editor
- Create new query and paste SQL
- Run all migrations

### 3. Enable RLS

- Go to Authentication → Policies
- Verify RLS is enabled on all tables
- Test with `SELECT * FROM orgs;` (should return empty if user not in org)

### 4. Configure Environment

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_MOCK_DATA=false  # Switch to real data
```

### 5. Test Connection

```typescript
import { supabase } from '@/services/supabase/client';

const { data, error } = await supabase.from('orgs').select('*');

console.log(data, error);
```

---

## Performance Notes

- Indexes on `org_id` for all tables (tenant isolation)
- Indexes on `status` fields for workflow filtering
- Indexes on `created_at DESC` for sorting recent records
- Analytics events table should be partitioned by date for large datasets
- Use cursor-based pagination for list endpoints (avoid offset)

## Compliance

- All tables have `created_at`, `updated_at` for audit trail
- Soft deletes with `deleted_at` (except audit_logs which are immutable)
- Audit logs capture all state changes for GDPR compliance
- RLS policies enforce org isolation (multi-tenant security)
- User data deletion cascades properly
