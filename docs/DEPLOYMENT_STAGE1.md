# Stage 1 Deployment Guide: Netlify + Supabase + Storage

This guide covers production deployment of the Managed Capture 3D Platform using:

- **Frontend & Functions**: Netlify (SPA + Edge Functions)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Storage**: Supabase Storage (3D models, images)

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Netlify Setup](#netlify-setup)
3. [Supabase Setup](#supabase-setup)
4. [Environment Configuration](#environment-configuration)
5. [Deploy to Production](#deploy-to-production)
6. [Testing Checklist](#testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Git** - Version control
- **Node.js 18+** - Runtime
- **npm** - Package manager
- **Netlify CLI** - `npm install -g netlify-cli`

### Required Accounts

- **Netlify** - https://app.netlify.com (free tier works)
- **Supabase** - https://app.supabase.com (free tier recommended for Stage 1)
- **GitHub** - For connecting Netlify to your repository

### Assumptions

- This repo is pushed to GitHub
- You have write access to the main/deploy branch
- You're deploying from the `main` branch

---

## Netlify Setup

### Step 1: Connect Repository to Netlify

1. Go to **[Netlify Dashboard](https://app.netlify.com)**
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** as provider
4. Authorize Netlify (give repo access)
5. Select this repository
6. Select branch: **`main`**
7. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

8. Click **"Deploy site"**

Netlify will now auto-deploy on every push to `main`.

### Step 2: Verify netlify.toml

The file `netlify.toml` should already be configured correctly. Verify:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  environment = { NODE_ENV = "production" }

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

# SPA fallback for client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Status**: ✅ Already configured

### Step 3: Configure Netlify Environment Variables

In the Netlify dashboard:

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Click **"Edit variables"**
3. Add these variables:

| Variable                 | Value                          | Source                   |
| ------------------------ | ------------------------------ | ------------------------ |
| `VITE_SUPABASE_URL`      | Your Supabase project URL      | See Supabase setup below |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key         | See Supabase setup below |
| `GEMINI_API_KEY`         | (Optional) Your Gemini API key | Google AI Studio         |

⚠️ **NEVER commit these to `.env.local`** - Always use Netlify UI

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to **[Supabase Console](https://app.supabase.com)**
2. Click **"New Project"**
3. Fill in:
   - **Name**: "Managed Capture 3D"
   - **Database Password**: Strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `us-east-1` for US)
4. Click **"Create new project"**

⏳ Supabase will provision your database (takes ~2 minutes)

### Step 2: Apply Database Migration

Once project is ready:

1. Go to **SQL Editor** tab
2. Click **"New Query"**
3. Paste contents of [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql)
4. Click **"Run"**

This creates all tables, enums, RLS policies, and triggers.

**Expected output**:

```
Success. No rows returned
```

### Step 3: Create Storage Buckets

1. Go to **Storage** tab
2. Click **"Create a new bucket"**
3. Create bucket: **`assets`**
   - Privacy: **Public** (or Private, depending on your needs)
4. Create bucket: **`thumbnails`**
   - Privacy: **Public**

### Step 4: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon (public) Key**: `eyJhbGc...` (starts with `eyJ`)

⚠️ Keep the **Service Role Key** secret - only use server-side

---

## Environment Configuration

### Local Development

Create a `.env.local` file (git-ignored, already in `.gitignore`):

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_MOCK_DATA=false
```

### Production (Netlify)

Environment variables are already configured in Netlify dashboard (see Step 3 above).

For build time, add to **Netlify Site Settings → Build & Deploy → Environment**:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

These are automatically injected into `import.meta.env.*`

---

## Deploy to Production

### Option A: Auto-Deploy (Recommended)

Every push to `main` branch auto-deploys:

```bash
git add .
git commit -m "feat: Enable Stage 1 production deployment"
git push origin main
```

Netlify will:

1. Build: `npm run build`
2. Run pre-commit hooks (linting, type checking)
3. Deploy to CDN
4. Show deploy preview
5. Go live on main URL

**Status check**: Go to Netlify dashboard → **Deploys** tab

### Option B: Manual Deploy via CLI

```bash
# Login to Netlify
netlify login

# Deploy from local machine
netlify deploy --prod
```

### Option C: Preview Deployment

Test before production:

```bash
netlify deploy  # Creates preview URL (not --prod)
```

---

## Testing Checklist

### ✅ Frontend (SPA Routing)

- [ ] `npm run build` completes without errors
- [ ] Open production URL: `https://your-site.netlify.app`
- [ ] Visit `/login` → page loads (not 404)
- [ ] Visit `/portal/dashboard` → page loads
- [ ] Browser refresh on deep routes → works
- [ ] No JavaScript console errors

### ✅ Authentication

- [ ] Load `/login` page
- [ ] Sign up with new email
- [ ] Check email for confirmation (if email verification enabled)
- [ ] Sign in
- [ ] Token persists after refresh
- [ ] Sign out works
- [ ] Redirects to `/login` when not authenticated

### ✅ Database

Test Supabase connection:

```typescript
// In browser console
import supabase from '@/lib/supabase';
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log(data, error);
```

Expected: Either data or error (both are valid)

### ✅ Storage

Test file upload:

```typescript
// In browser console
import { uploadThumbnail } from '@/services/storage';
import storage from '@/services/storage';

// Create a test file
const file = new File(['test'], 'test.txt', { type: 'text/plain' });
const url = await uploadThumbnail(file, 'test-asset-123');
console.log('Uploaded:', url);
```

Expected: Public URL is returned

### ✅ Netlify Functions

Test Gemini proxy (if using Gemini):

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/gemini-proxy \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'
```

Expected: `{"result": "...response text..."}`

### ✅ Route Guards

- [ ] Unauthenticated user visits `/portal/dashboard` → redirects to `/login`
- [ ] Customer user visits `/app/dashboard` → shows "not authorized"
- [ ] Employee user visits `/portal/dashboard` → works

---

## Troubleshooting

### Build Fails: "Missing environment variables"

**Error**: `VITE_SUPABASE_URL is not defined`

**Solution**:

1. Go to Netlify **Site Settings** → **Build & Deploy** → **Environment**
2. Verify variables are set correctly
3. Trigger a new deploy (push to main or click "Trigger deploy")

### Login Not Working

**Error**: "Failed to connect to auth service"

**Symptoms**:

- Can't sign up
- Console shows CORS errors
- 403 Forbidden from Supabase

**Solution**:

1. Check `VITE_SUPABASE_URL` is exactly: `https://xxx.supabase.co` (no trailing slash)
2. Check `VITE_SUPABASE_ANON_KEY` is correct (from Supabase settings)
3. Verify Supabase project is running (check Supabase dashboard)

### "Cannot find module" for Supabase

**Error**: `Module '@supabase/supabase-js' not found`

**Solution**:

```bash
npm install @supabase/supabase-js
git add package.json package-lock.json
git commit -m "chore: Add supabase-js dependency"
git push origin main
```

### 404 on Routes

**Error**: Visiting `/login` shows 404

**Solution**:

1. Verify `netlify.toml` has SPA fallback:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
2. Redeploy: `git push origin main`

### Storage Upload Fails

**Error**: "Failed to upload file"

**Symptoms**:

- Upload button doesn't work
- Console shows 403 Forbidden

**Solution**:

1. Go to Supabase **Storage** tab
2. Select bucket (`assets`)
3. Click **Policies** tab
4. Verify RLS policies allow uploads from your app
5. Ensure bucket privacy is set correctly (Public for public access)

### Netlify Function Not Found

**Error**: `404 /.netlify/functions/gemini-proxy`

**Solution**:

1. Verify file exists: `netlify/functions/gemini-proxy.ts`
2. Verify file has `export { handler }`
3. Redeploy: `git push origin main`
4. Check Netlify **Functions** tab in dashboard

---

## Architecture Overview

```
┌─────────────────┐
│   React SPA     │ (Vite build → dist/)
│   /login        │
│   /portal/*     │ ← Hash-based routing
│   /app/*        │
└────────┬────────┘
         │ CORS requests
         ↓
┌─────────────────────────────────────┐
│      Netlify Edge Network           │
│  - SPA static assets (CDN)          │
│  - /.netlify/functions/* (Lambda)   │
│    - gemini-proxy                   │
│    - auth-signup                    │
└────────┬────────────────────────────┘
         │ API calls via @supabase/supabase-js
         ↓
┌──────────────────────┐
│    Supabase          │
│  - Auth (email+pw)   │
│  - Postgres DB       │
│  - Storage buckets   │
└──────────────────────┘
```

---

## Next Steps (Phase 2+)

- [ ] Add email verification (Supabase Auth settings)
- [ ] Implement OAuth (Google, GitHub)
- [ ] Add 2FA (TOTP)
- [ ] Enable Row Level Security fine-tuning
- [ ] Set up database backups
- [ ] Configure custom domain
- [ ] Enable SSL/TLS monitoring
- [ ] Add log aggregation (Logflare)

---

## Support & Resources

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **React Router**: https://reactrouter.com
- **Vite**: https://vitejs.dev

---

## Production Checklist

Before going live, verify:

- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] All env vars configured in Netlify
- [ ] Supabase project running and accessible
- [ ] Storage buckets created and accessible
- [ ] Deep route refresh works (SPA routing)
- [ ] Authentication flow complete (sign up → login → dashboard)
- [ ] At least one file upload succeeds
- [ ] RLS policies preventing unauthorized access
- [ ] Custom domain configured (optional)
- [ ] SSL certificate valid (Netlify auto-handles)

✅ **Ready to deploy!**
