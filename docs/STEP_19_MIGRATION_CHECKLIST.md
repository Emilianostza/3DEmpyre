# Step 19: Database Migration & Testing Checklist

Complete guide to migrate your managed-capture-3d-platform to production Supabase.

**Estimated Time:** 2-4 hours
**Status:** Ready to execute
**Prerequisites:** Supabase account (free or paid)

---

## Phase 1: Pre-Migration Preparation (30 minutes)

### 1.1 Verify Environment Setup

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm dependencies installed (`npm install` completed)
- [ ] App builds successfully (`npm run build`)
- [ ] Dev server runs (`npm run dev` works)
- [ ] Browser console accessible (F12 opens DevTools)

### 1.2 Prepare Credentials

- [ ] Have Supabase account ready (https://supabase.com)
- [ ] Know your Supabase project region preference (closest to users)
- [ ] Database password ready (strong, random, saved securely)
- [ ] Backup plan for sensitive configuration

### 1.3 Review Documentation

- [ ] Read SUPABASE_SETUP.md (setup guide)
- [ ] Read SUPABASE_SCHEMA.md (database structure)
- [ ] Review 01-init-supabase.sql (migration script)
- [ ] Understand RLS policies and multi-tenancy

---

## Phase 2: Create Supabase Project (15 minutes)

### 2.1 Sign In to Supabase

- [ ] Go to https://app.supabase.com
- [ ] Sign in with email or OAuth
- [ ] Select/create organization

### 2.2 Create New Project

- [ ] Click "New project"
- [ ] Enter project name: `managed-capture-3d-production`
- [ ] Generate and save database password
- [ ] Select region (e.g., Frankfurt for EU, Virginia for US)
- [ ] Choose plan (Free for MVP, Pro for production)
- [ ] Click "Create new project"
- [ ] ⏳ Wait for provisioning (2-3 minutes)

### 2.3 Retrieve Project Credentials

Once provisioning complete:

- [ ] Go to **Settings → API**
- [ ] Copy **Project URL** (e.g., `https://your-project.supabase.co`)
- [ ] Copy **anon (public) key** (starts with `eyJ...`)
- [ ] Save both in secure location (password manager)

### 2.4 Configure Backups

- [ ] Go to **Settings → Backups**
- [ ] Verify automatic backups enabled
- [ ] Set retention to 30 days
- [ ] Note backup restore process

---

## Phase 3: Deploy Database Schema (30 minutes)

### 3.1 Access SQL Editor

- [ ] In Supabase dashboard, go to **SQL Editor** (left sidebar)
- [ ] Click **"New query"** button
- [ ] Empty editor ready for SQL

### 3.2 Import Migration Script

- [ ] Open `scripts/01-init-supabase.sql` in your editor
- [ ] Select all content (Ctrl+A)
- [ ] Copy to clipboard (Ctrl+C)
- [ ] Paste into Supabase SQL Editor (Ctrl+V)
- [ ] Review SQL before running

### 3.3 Execute Migration

- [ ] Click **"Run"** button (blue button, top right)
- [ ] ⏳ Wait for execution (should complete in <10 seconds)
- [ ] Check output for errors
  - [ ] **Success:** No error messages
  - [ ] **Failed:** Fix errors, retry

### 3.4 Verify Schema Created

- [ ] Go to **Table Editor** (left sidebar)
- [ ] Verify these tables exist:
  - [ ] orgs
  - [ ] user_profiles
  - [ ] user_org_memberships
  - [ ] projects
  - [ ] assets
  - [ ] qa_checks
  - [ ] assignments
  - [ ] payouts
  - [ ] audit_logs
  - [ ] requests
  - [ ] analytics_events

### 3.5 Check Indexes and Policies

- [ ] Click on **projects** table
- [ ] Verify indexes exist (look at "Indexes" tab)
- [ ] Click on **Authentication → Policies** (left sidebar)
- [ ] Verify RLS policies created for tables

---

## Phase 4: Test Database Connection (30 minutes)

### 4.1 Update Environment Variables

In your project root, create or update `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1N...
VITE_USE_MOCK_DATA=false

# Other existing variables
VITE_API_BASE_URL=http://localhost:3001/api
VITE_STORAGE_BUCKET=https://s3.example.com/managed-capture
```

- [ ] Replace `your-project` with your actual project name
- [ ] Replace `eyJhbGciOiJIUzI1N...` with your actual anon key
- [ ] Save file
- [ ] ✅ Do NOT commit this file (already in .gitignore)

### 4.2 Restart Development Server

- [ ] Stop dev server (Ctrl+C in terminal)
- [ ] Start dev server: `npm run dev`
- [ ] Wait for "Local: http://localhost:3000"
- [ ] Open http://localhost:3000 in browser
- [ ] Check browser console (F12) for errors
  - [ ] **Good:** No red errors
  - [ ] **Bad:** Red errors about Supabase config

### 4.3 Run Connection Tests

In browser console (F12 → Console tab), run:

```typescript
import { testSupabaseConnection } from '@/services/supabase/test-connection';
await testSupabaseConnection();
```

Expected output:

```
✅ Client Initialization — success
✅ Get Session — skipped (no session)
✅ Auth State Listener — success
✅ Database Connectivity — success (RLS policies working)
✅ User Profiles Table — skipped (RLS)
✅ Organizations Table — skipped (RLS)
✅ Projects Table — skipped (RLS)
```

All tests should pass or be skipped (not failed).

- [ ] All tests pass
- [ ] No red ❌ failed tests
- [ ] Connection summary shows success

### 4.4 Verify Build Still Works

```bash
npm run build
```

- [ ] Build completes successfully
- [ ] Output shows: `✓ built in X.XXs`
- [ ] No build errors

---

## Phase 5: Create Test User & Seed Data (30 minutes)

### 5.1 Create Test User in Supabase Auth

- [ ] Go to **Authentication → Users**
- [ ] Click **"Add user"** button
- [ ] Email: `test@example.com`
- [ ] Password: `TestPassword123!`
- [ ] Check **"Auto confirm user"**
- [ ] Click **"Create user"**
- [ ] ✅ User should appear in list

### 5.2 Create User Profile

In browser console, run:

```typescript
import { supabase } from '@/services/supabase/client';

// Sign in first
const { data, error: loginError } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'TestPassword123!',
});

if (loginError) throw loginError;

// Create profile
const { data: profile, error: profileError } = await supabase
  .from('user_profiles')
  .insert([
    {
      id: data.user.id,
      email: 'test@example.com',
      name: 'Test User',
    },
  ])
  .select()
  .single();

if (profileError) throw profileError;
console.log('Profile created:', profile);
```

- [ ] No errors in console
- [ ] Profile created successfully
- [ ] User ID matches

### 5.3 Create Test Organization

In browser console:

```typescript
const { data: org, error: orgError } = await supabase
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

if (orgError) throw orgError;
console.log('Organization created:', org);
```

- [ ] Organization created successfully
- [ ] ID returned in console

### 5.4 Add User to Organization

In browser console:

```typescript
const { data: membership, error: memberError } = await supabase
  .from('user_org_memberships')
  .insert([
    {
      org_id: org.id, // Use org ID from previous step
      user_id: data.user.id, // Use user ID from login
      role: 'admin',
      status: 'active',
    },
  ])
  .select()
  .single();

if (memberError) throw memberError;
console.log('Membership created:', membership);
```

- [ ] Membership created successfully
- [ ] User now has admin role in organization

### 5.5 Create Test Project

In browser console:

```typescript
const { data: project, error: projectError } = await supabase
  .from('projects')
  .insert([
    {
      org_id: org.id,
      name: 'Test Project',
      industry: 'restaurant',
      tier: 'standard',
      status: 'pending',
    },
  ])
  .select()
  .single();

if (projectError) throw projectError;
console.log('Project created:', project);
```

- [ ] Project created successfully
- [ ] Can now query projects with RLS

### 5.6 Verify RLS Works

In browser console, query projects:

```typescript
const { data: projects, error } = await supabase.from('projects').select('*');

if (error) console.error('Error:', error);
else console.log('Projects found:', projects);
```

Expected: Projects array with your test project

- [ ] Projects returned (not empty array)
- [ ] Test project appears in results
- [ ] RLS is working correctly

---

## Phase 6: Integration Testing (45 minutes)

### 6.1 Test Real API Services

Create test script `test-api-integration.ts`:

```typescript
import { ProjectsProvider } from '@/services/dataProvider';

// Test 1: Fetch projects
const projects = await ProjectsProvider.list();
console.log('Projects:', projects);

// Test 2: Get single project
if (projects.length > 0) {
  const project = await ProjectsProvider.get(projects[0].id);
  console.log('Single project:', project);
}

// Test 3: Create project
const newProject = await ProjectsProvider.create({
  name: 'API Test Project',
  industry: 'retail',
  tier: 'premium',
});
console.log('Created project:', newProject);
```

Run in browser console:

- [ ] Projects fetched successfully
- [ ] Single project returned
- [ ] New project created
- [ ] No 403 Forbidden errors

### 6.2 Test Assets API

```typescript
import { AssetsProvider } from '@/services/dataProvider';

// Test 1: Fetch assets for project
if (projects.length > 0) {
  const assets = await AssetsProvider.list({ projectId: projects[0].id });
  console.log('Assets:', assets);
}

// Test 2: Create asset
const newAsset = await AssetsProvider.create({
  projectId: newProject.id,
  name: 'Test Photo',
  type: 'photo',
  fileKey: 's3://test/photo.jpg',
  fileSize: 1024000,
  contentType: 'image/jpeg',
});
console.log('Created asset:', newAsset);
```

- [ ] Assets fetched successfully
- [ ] New asset created
- [ ] Asset has valid ID and timestamps

### 6.3 Test Workflow Transitions

```typescript
// Test: Approve project
const approved = await ProjectsProvider.approve(newProject.id);
console.log('Approved project:', approved.status);

// Verify status changed
const updated = await ProjectsProvider.get(newProject.id);
console.log('Updated status:', updated.status);
```

- [ ] Project approved successfully
- [ ] Status changed to 'approved'
- [ ] Timestamp updated

### 6.4 Test Auth Flow

```typescript
// Test: Sign out
const { error: signOutError } = await supabase.auth.signOut();
console.log('Signed out:', signOutError ? 'Failed' : 'Success');

// Test: Sign in again
const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'TestPassword123!',
});
console.log('Signed in:', loginError ? 'Failed' : 'Success');
```

- [ ] Sign out successful
- [ ] Sign in successful
- [ ] Session restored

### 6.5 Test Error Handling

```typescript
// Test: Invalid query should fail gracefully
try {
  const { data, error } = await supabase.from('invalid_table').select('*');

  if (error) console.error('Expected error:', error.message);
} catch (err) {
  console.error('Caught error:', err);
}
```

- [ ] Error handled gracefully
- [ ] No unhandled exceptions
- [ ] Error message clear

---

## Phase 7: Run Full Test Suite (30 minutes)

### 7.1 Run Integration Test

```bash
npm run build
npm run preview
```

In browser:

- [ ] App loads at http://localhost:4173
- [ ] No 404 errors
- [ ] No console errors (red)
- [ ] Dark mode toggle works
- [ ] Navigation works

### 7.2 Navigate to All Routes

Test each public route:

- [ ] / (home page) — Loads
- [ ] /gallery — Loads
- [ ] /pricing — Loads
- [ ] /how-it-works — Loads
- [ ] /app/login — Loads
- [ ] /portal/dashboard — Redirects to login

### 7.3 Test Authentication Routes

- [ ] Sign in with test user works
- [ ] Dashboard loads after login
- [ ] Projects appear (if created)
- [ ] Sign out works
- [ ] Redirects to login after logout

### 7.4 Performance Check

In browser DevTools (F12 → Performance):

- [ ] Page load < 3 seconds
- [ ] No network errors (red)
- [ ] All resources loaded
- [ ] Database queries responsive (< 500ms)

---

## Phase 8: Cleanup & Security (15 minutes)

### 8.1 Secure Credentials

- [ ] `VITE_SUPABASE_ANON_KEY` not in git history
- [ ] `.env.local` in `.gitignore` ✓
- [ ] No credentials in source code
- [ ] No credentials in comments

### 8.2 Configure Backups

- [ ] Backups enabled in Supabase settings
- [ ] Retention set to 30 days
- [ ] Know how to restore from backup

### 8.3 Set Up Monitoring

- [ ] Check **Settings → Database → Extensions**
- [ ] `pgbouncer` enabled for connection pooling
- [ ] Note monitoring dashboard location

### 8.4 Document Setup

- [ ] Save database credentials securely (1Password, etc.)
- [ ] Document Supabase project URL
- [ ] Save recovery codes for account
- [ ] Create runbook for common issues

---

## Phase 9: Verification Checklist (20 minutes)

### ✅ Final Verification

- [ ] Supabase project created
- [ ] 11 tables created and verified
- [ ] RLS policies enabled on all tables
- [ ] Test user created and authenticated
- [ ] Test organization created
- [ ] Test project created
- [ ] Test asset created
- [ ] All CRUD operations work
- [ ] Workflow transitions work
- [ ] Auth flow works (sign in/out)
- [ ] Error handling works
- [ ] App builds successfully
- [ ] App runs in dev mode
- [ ] App runs in preview mode
- [ ] All routes accessible
- [ ] Dark mode works
- [ ] No console errors
- [ ] Database queries responsive
- [ ] Backups configured
- [ ] Monitoring configured
- [ ] Credentials secured

---

## Troubleshooting

### Connection Fails: "Invalid Credentials"

**Solution:**

1. Double-check `VITE_SUPABASE_URL` - must end with `.supabase.co`
2. Verify `VITE_SUPABASE_ANON_KEY` is complete (no truncation)
3. Restart dev server after changing `.env.local`
4. Check in Supabase dashboard that project is running

### 403 Forbidden on All Queries

**Solution:**

1. Ensure user is authenticated (has valid JWT)
2. Create test user in Supabase Auth
3. Create user_profile record
4. Create org and membership
5. Run test again

### Tables Don't Exist

**Solution:**

1. Verify SQL migration ran without errors
2. Go to **Table Editor** to see if tables listed
3. Check if SQL had permission errors
4. Try running migration again

### Build Fails with "supabase-js not found"

**Solution:**

```bash
npm install @supabase/supabase-js jwt-decode
npm run build
```

### Test Suite Shows 403 Errors on Tables

**Solution:**
This is EXPECTED with RLS enabled and no authentication. 403 means:

- Database is reachable ✓
- RLS policies are working ✓
- Sign in to test authenticated access

---

## Success Criteria

When complete, you should have:

✅ Working Supabase project
✅ 11 database tables with RLS
✅ Test user account
✅ Test organization and membership
✅ Test project and asset
✅ All CRUD operations functional
✅ Auth flow working
✅ Build passing
✅ App running locally and in preview
✅ No console errors
✅ Database queries responsive

---

## Next Steps

After completing Step 19:

→ **Step 20:** API Integration Testing
→ **Step 21:** Frontend Integration
→ **Step 22:** Deployment & Operations

---

## Support Resources

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Database Schema](./SUPABASE_SCHEMA.md)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Estimated Completion Time:** 2-4 hours
**Status:** Ready to execute
**Date Completed:** **\*\***\_\_\_**\*\***
