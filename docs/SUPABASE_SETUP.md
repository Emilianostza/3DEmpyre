# Supabase Setup & Initialization Guide

Complete step-by-step guide to set up Supabase for production deployment.

## Prerequisites

- Supabase account (free or paid at https://supabase.com)
- PostgreSQL 15+ (provided by Supabase)
- Git (for version control)
- This codebase with all types/DTOs defined

---

## Phase 1: Create Supabase Project

### 1.1 Sign Up / Log In

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up with email or OAuth
3. Create a new organization (or use existing)

### 1.2 Create New Project

1. Click "New project"
2. Enter project details:
   - **Name**: `managed-capture-3d-production` (or your choice)
   - **Database Password**: Generate strong password (save securely!)
   - **Region**: Choose closest to your users (EU: Frankfurt or Ireland)
   - **Plan**: Free (for MVP), Pro/Team for production

3. Wait for provisioning (2-3 minutes)

### 1.3 Retrieve Credentials

Once project is created:

1. Go to **Settings → API**
2. Copy these values (keep secret!):
   - **Project URL**: `https://your-project.supabase.co`
   - **anon (public) key**: `eyJhbGciOiJIUzI1N...` (long string)
   - **service_role (secret) key**: Keep in secure location only

3. Go to **Settings → Database**
4. Copy **Database Connection String** for backups/migrations

### 1.4 Configure Environment Variables

Add to your `.env` file (development):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1N...
VITE_USE_MOCK_DATA=false
```

For Netlify deployment:

1. Go to **Site Settings → Build & Deploy → Environment**
2. Add the same variables
3. **DO NOT add service_role key to Netlify** (server-side only)

---

## Phase 2: Deploy Database Schema

### 2.1 Access SQL Editor

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**

### 2.2 Create Orgs Table

```sql
CREATE TABLE public.orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  country_code text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  platform_fee_percent smallint DEFAULT 15,
  currency text DEFAULT 'USD',
  gdpr_consent_given timestamp with time zone,
  data_retention_days smallint DEFAULT 30,
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

ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their orgs"
  ON public.orgs FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Admins can update their org"
  ON public.orgs FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### 2.3 Create User Profiles Table

```sql
CREATE TABLE public.user_profiles (
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

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their profile"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their profile"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid());
```

### 2.4 Create User Organization Memberships

```sql
CREATE TABLE public.user_org_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'active',
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

ALTER TABLE public.user_org_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memberships in their org"
  ON public.user_org_memberships FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships umem
      WHERE umem.user_id = auth.uid() AND umem.status = 'active'
    )
  );
```

### 2.5 Create Projects Table

```sql
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  request_id uuid,
  name text NOT NULL,
  description text,
  industry text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  tier text NOT NULL DEFAULT 'standard',
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

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their org"
  ON public.projects FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Admins can insert/update projects"
  ON public.projects FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );
```

### 2.6 Create Assets Table

```sql
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'uploading',
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

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assets in their org"
  ON public.assets FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.user_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
```

### 2.7 Create Other Essential Tables

Continue with QA Checks, Assignments, Payouts, Audit Logs, Requests, Analytics Events tables from `docs/SUPABASE_SCHEMA.md`.

**Recommended approach:**

1. Copy all SQL from SUPABASE_SCHEMA.md
2. Paste into SQL Editor in Supabase
3. Run all migrations at once
4. Check for errors in output

### 2.8 Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see all tables listed
3. Click each table to verify columns and indexes

---

## Phase 3: Configure Authentication

### 3.1 Enable Email/Password Auth

1. Go to **Authentication → Providers**
2. Ensure **Email** provider is enabled (default)
3. Go to **Authentication → Policies**
4. Set email confirmation:
   - **Require email confirmation**: OFF (for MVP, can enable later)

### 3.2 Configure OAuth (Optional)

For social sign-in (Google, GitHub):

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials (Web)
   - Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret
   - In Supabase: Authentication → Providers → Google
   - Paste credentials

2. **GitHub OAuth** (similar process):
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new app
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`

### 3.3 Configure Redirects

1. Authentication → URL Configuration
2. Add Redirect URLs:
   - Development: `http://localhost:3000`, `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com`, `https://your-domain.com/auth/callback`

---

## Phase 4: Test Connection

### 4.1 Create Test User

1. Go to **Authentication → Users**
2. Click **Add user**
3. Email: `test@example.com`
4. Password: Generate secure password
5. Check "Auto confirm user"
6. Click **Create user**

### 4.2 Test Client Connection

In your app:

```typescript
import { supabase } from '@/services/supabase/client';

// Test connection
async function testConnection() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  console.log('Session:', session);
  console.log('Error:', error);
}

testConnection();
```

### 4.3 Test Authentication

```typescript
// Sign in with test user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'your-password',
});

if (error) console.error('Sign in failed:', error);
else console.log('Signed in:', data.user.email);
```

### 4.4 Test Data Access

```typescript
// Query projects (with RLS)
const { data, error } = await supabase.from('projects').select('*');

if (error) console.error('Query failed:', error);
else console.log('Projects:', data);
```

---

## Phase 5: Seed Initial Data (Optional)

### 5.1 Create First Organization

```typescript
const { data: org, error } = await supabase
  .from('orgs')
  .insert([
    {
      slug: 'test-org',
      name: 'Test Organization',
      country_code: 'us',
      currency: 'USD',
    },
  ])
  .select()
  .single();
```

### 5.2 Create User Profile

```typescript
const { data: profile, error } = await supabase
  .from('user_profiles')
  .insert([
    {
      id: auth.user.id,
      email: auth.user.email,
      name: 'Test User',
    },
  ])
  .select()
  .single();
```

### 5.3 Add User to Organization

```typescript
const { data: membership, error } = await supabase
  .from('user_org_memberships')
  .insert([
    {
      org_id: org.id,
      user_id: auth.user.id,
      role: 'admin',
      status: 'active',
    },
  ])
  .select()
  .single();
```

---

## Phase 6: Configure Backups & Monitoring

### 6.1 Enable Automated Backups

1. **Settings → Backups**
2. Free plan: 1 backup per week
3. Pro plan: Daily backups
4. Recommend 30-day retention

### 6.2 Monitor Database

1. **Monitoring → Database**
2. Check CPU, RAM, connections
3. Set alerts for resource usage

### 6.3 View Logs

1. **Logs Explorer**
2. Filter by:
   - Database: SQL queries
   - Auth: Authentication events
   - Realtime: Real-time subscriptions

---

## Troubleshooting

### Connection Error: "Invalid Credentials"

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check for trailing spaces or newlines
- Restart dev server after changing .env

### RLS Policy Error: "Row level security violation"

- Verify user is authenticated (has valid JWT)
- Check user has matching org_id in user_org_memberships
- Verify membership status is 'active'
- Check RLS policy condition logic

### Authentication Error: "User not found"

- Verify user exists in Supabase Auth Users table
- Check user_profiles table has entry with matching ID
- Verify profile creation happens after signup

### Query Returns Empty Array

- Check RLS policies are correct
- Verify user org_id matches data org_id
- Use PostgreSQL debugger if needed (Supabase logs)

### Performance Issues

- Add indexes for frequently filtered columns ✓ (done in schema)
- Use cursor pagination (not offset)
- Avoid SELECT \* queries when possible
- Use Supabase Monitoring tab to identify slow queries

---

## Security Checklist

- ✅ RLS policies enable on all tables
- ✅ Service role key stored securely (Netlify functions only)
- ✅ Anon key published in frontend (expected)
- ✅ Email confirmation OFF for MVP (can enable later)
- ✅ Automated backups enabled
- ✅ GDPR compliance ready (data retention fields)
- ✅ Audit logs table for compliance
- ✅ Soft deletes with deleted_at field

---

## Next Steps

1. Create Supabase project (Phase 1)
2. Deploy database schema (Phase 2)
3. Configure authentication (Phase 3)
4. Test connection (Phase 4)
5. Seed initial data (Phase 5)
6. Update `.env` with credentials
7. Set `VITE_USE_MOCK_DATA=false` to use real backend
8. Proceed to Step 19: API Integration Testing

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Authentication](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for migrations)
