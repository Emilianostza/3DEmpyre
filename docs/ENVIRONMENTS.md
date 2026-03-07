# Environment Configuration Guide

This document explains how to configure the application for different environments (local development, staging, production) and manage secrets securely.

---

## Quick Reference

| Setting            | Local                       | Staging          | Production          |
| ------------------ | --------------------------- | ---------------- | ------------------- |
| VITE_USE_MOCK_DATA | `true`                      | `false`          | `false`             |
| VITE_API_BASE_URL  | `http://localhost:3001/api` | Staging server   | Production server   |
| Auth Mode          | Mock users                  | Supabase         | Supabase            |
| Database           | None (mock)                 | Supabase staging | Supabase production |
| API Key            | None                        | ✅ Netlify vars  | ✅ Netlify vars     |
| Dark Mode          | localStorage                | localStorage     | localStorage        |

---

## Local Development

### No .env.local Needed (For Most Cases)

```bash
# Default behavior (out of the box)
npm install
npm run dev

# ✅ Works with:
# - VITE_USE_MOCK_DATA=true (default, hardcoded)
# - Mock users (admin@company.com / password123)
# - In-memory mock data
```

### Optional: Connect to Staging Backend

If you want to test against the real Supabase staging environment locally:

```bash
# Create .env.local (DO NOT commit this!)
cat > .env.local << 'EOF'
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://staging-api.example.com
VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# Start dev server
npm run dev

# ⚠️ IMPORTANT: Remove .env.local before committing!
rm .env.local
```

---

## Mock Authentication (Local)

### Default Mock Users

| Email                  | Password    | Role           | Organization |
| ---------------------- | ----------- | -------------- | ------------ |
| admin@company.com      | password123 | Admin          | Company Inc  |
| technician@company.com | password123 | Technician     | Company Inc  |
| customer@company.com   | password123 | Customer Owner | Acme Corp    |

### Files Involved

- `src/services/api/auth.ts` - Mock login logic
- `src/services/api/mock/auth.ts` - Mock user database (future)
- `src/contexts/AuthContext.tsx` - Auth state management

### Switching to Real Auth

```typescript
// In .env.local
VITE_USE_MOCK_DATA = false;

// Then:
// - dataProvider.ts routes to real API
// - AuthContext calls Supabase instead of mock
// - JWT tokens used for subsequent requests
```

---

## Mock Data (Local Development)

### Toggling Mock Data

**Option 1: Environment Variable**

```bash
# Use mock (default)
npm run dev
# VITE_USE_MOCK_DATA=true (hardcoded default)

# Use real API (after staging is ready)
VITE_USE_MOCK_DATA=false npm run dev
```

**Option 2: Edit Code**

```typescript
// src/config/env.ts
export const env = {
  useMockData: true, // Change to false for real API
};
```

### Mock Services

```
src/services/api/mock/
├── auth.ts         # Mock users + login
├── projects.ts     # Mock projects CRUD
└── assets.ts       # Mock assets CRUD
```

### Mock Data Characteristics

- ⏱️ Simulated network delays (500-800ms)
- 🔄 In-memory storage (resets on page refresh)
- 📊 Realistic data structures
- ✅ All CRUD operations supported

---

## Production Environment

### Netlify Configuration

**Step 1: Set Environment Variables**

```
Netlify Dashboard
→ Site Settings
  → Build & Deploy
    → Environment
      → Add environment variables
```

**Variables to Set**

```
VITE_USE_MOCK_DATA = false
VITE_API_BASE_URL = https://api.yourcompany.com
VITE_SUPABASE_URL = https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY = [your-public-key]
GEMINI_API_KEY = [YOUR-SECURE-KEY-HERE]  ← Server-side only!
```

**Step 2: Configure Build**

```
netlify.toml (already configured):
[build]
  command = "npm run build"
  publish = "dist"
```

**Step 3: Deploy**

```bash
# Push to main branch
git push origin main

# Netlify automatically:
# 1. Runs: npm install
# 2. Runs: npm run build (with VITE_USE_MOCK_DATA=false)
# 3. Deploys dist/ to CDN
# 4. Sets HTTP headers from netlify.toml
```

### Security: Never Expose GEMINI_API_KEY to Frontend

❌ **WRONG**:

```typescript
// DON'T do this!
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
fetch('https://api.gemini.com/...', {
  headers: { 'X-API-Key': apiKey },
});
// Key is visible to all browser traffic!
```

✅ **CORRECT**:

```typescript
// DO this instead
// Frontend calls proxy function
const response = await fetch('/.netlify/functions/gemini-proxy', {
  method: 'POST',
  body: JSON.stringify({ prompt: '...' }),
});

// Netlify function (netlify/functions/gemini-proxy.ts):
// - Reads GEMINI_API_KEY from process.env (server-side only!)
// - Makes request to Gemini API
// - Returns response to client
```

---

## Staging Environment (Future)

### Setup

```bash
# Create staging branch
git checkout -b staging

# Netlify: Create separate site for staging
# - Site name: "managed-capture-staging"
# - Branch: staging
# - Environment variables (staging database):
#   VITE_USE_MOCK_DATA=false
#   VITE_API_BASE_URL=https://staging-api.yourcompany.com
```

### Workflow

```
Feature Branch
  ↓
  PR → dev (approve + merge)
    ↓
    dev → staging (auto-deploy to staging site)
      ↓
      QA Testing
        ↓
        staging → main (auto-deploy to production)
```

---

## Feature Flags

### VITE_USE_MOCK_DATA

**Effect**: Routes all API calls to mock or real backend

```typescript
// src/services/dataProvider.ts
const USE_REAL_API = !env.useMockData;

export const ProjectsProvider = {
  async list(filter = {}) {
    if (USE_REAL_API) {
      // Real API (Supabase)
      return await realProjectsAPI.fetchProjects(filter);
    } else {
      // Mock API (in-memory)
      return await mockProjectsAPI.fetchProjects(filter);
    }
  },
};
```

### Future Feature Flags (Planned)

```typescript
// src/config/features.ts
export const FEATURES = {
  analyticsV2: false, // New analytics dashboard
  arPreview: true, // AR model preview
  advancedFiltering: false, // Complex search filters
  darkModeAuto: true, // Auto dark mode (system preference)
  multilingual: false, // I18n support
};
```

---

## Database Connections

### Local (Mock)

- **No connection needed**
- In-memory data store
- Resets on page refresh

### Staging (Supabase)

```
Supabase Project Settings
→ API
  → URL: https://[PROJECT-ID].supabase.co
  → Anon Key: [copy to VITE_SUPABASE_ANON_KEY]
  → Service Role: [keep secret, server-side only]
```

### Production (Supabase)

- Separate project from staging
- Read-only access from frontend (Anon Key)
- Service Role Key in Netlify Functions only
- RLS policies enforce row-level security

---

## Authentication Methods

### Mock (Local)

```
User: admin@company.com
Pass: password123
→ Creates JWT in localStorage
→ Mock users have fixed roles
→ No external services needed
```

### Supabase (Staging/Production)

```
User enters email + password
→ Supabase verifies credentials
→ Returns JWT + user profile
→ JWT stored in localStorage
→ All subsequent requests include JWT
→ RLS policies filter data by organization
```

### Social Auth (Future)

```
Planned: Google OAuth, GitHub, Microsoft
→ Supabase Auth handles social login
→ Maps social account to user record
→ JWT still used for API access
```

---

## Secrets Management

### ❌ Never Commit

```bash
.env.local               # Local environment variables
.env.*.local             # Environment-specific secrets
node_modules/           # Dependencies (use npm install)
dist/                   # Build artifacts
.DS_Store               # macOS files
*.pem                   # Private keys
credentials.json        # Service account keys
```

### ✅ Safely Store

**Netlify Environment Variables**

- Go to Site Settings → Build & Deploy → Environment
- Add variables one at a time
- All values are encrypted at rest
- Only exposed to build process & functions

**1Password / LastPass**

- Team secrets store
- Backup of API keys
- Shared securely with team

**CI/CD Secrets**

- GitHub Secrets (for Actions)
- Same variables as Netlify Environment Variables

---

## Environment Variable Reference

### VITE\_ Variables (Exposed to Frontend)

| Variable               | Type    | Default                     | Purpose              |
| ---------------------- | ------- | --------------------------- | -------------------- |
| VITE_USE_MOCK_DATA     | boolean | `true`                      | Use mock or real API |
| VITE_API_BASE_URL      | string  | `http://localhost:3001/api` | Backend API endpoint |
| VITE_SUPABASE_URL      | string  | -                           | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | string  | -                           | Supabase public key  |

### Server-Side Variables (Hidden from Frontend)

| Variable         | Type   | Location            | Purpose                   |
| ---------------- | ------ | ------------------- | ------------------------- |
| GEMINI_API_KEY   | string | Netlify environment | Gemini API (not in .env!) |
| DATABASE_URL     | string | Supabase settings   | Database connection       |
| SERVICE_ROLE_KEY | string | Netlify functions   | Full DB access            |

---

## Debugging

### Enable Debug Logging

```typescript
// src/config/env.ts
export const DEBUG = true;

// In components:
if (DEBUG) console.log('API call:', endpoint, params);
```

**Production**: Console logs auto-stripped by esbuild

### Check Environment

```bash
# What environment am I using?
npm run dev
# → Check browser console for VITE_USE_MOCK_DATA=true

# Or check in code:
console.log(import.meta.env.VITE_USE_MOCK_DATA);
```

### Test API Endpoints

```bash
# From browser console:
fetch('/.netlify/functions/gemini-proxy', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'test' })
})
  .then(r => r.json())
  .then(d => console.log(d));
```

---

## Troubleshooting

### Issue: "VITE_USE_MOCK_DATA is undefined"

**Solution**:

```typescript
// In code, use with fallback:
const useMock = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
```

### Issue: "GEMINI_API_KEY exposed in network requests"

**Solution**: Never use client-side. Always proxy through Netlify Functions.

### Issue: "Can't login to staging"

**Check**:

```
1. VITE_SUPABASE_URL is set in Netlify environment
2. VITE_SUPABASE_ANON_KEY matches Supabase project
3. User exists in Supabase auth_users table
4. VITE_USE_MOCK_DATA=false is set
```

### Issue: "Mock data not working locally"

**Check**:

```
1. .env.local doesn't override VITE_USE_MOCK_DATA=true
2. Remove .env.local and restart dev server
3. npm run dev (not with custom VITE_USE_MOCK_DATA=false)
```

---

## Checklists

### Before Local Development

- [ ] `npm install` completed
- [ ] No `.env.local` file (or it doesn't override mock mode)
- [ ] `npm run dev` starts on localhost:3000
- [ ] Can login with admin@company.com / password123

### Before Deploying to Staging

- [ ] All environment variables set in Netlify
- [ ] Supabase staging project configured
- [ ] RLS policies applied
- [ ] `npm run build` succeeds locally
- [ ] No secrets in .env.local before push

### Before Deploying to Production

- [ ] All staging tests passed
- [ ] Load tests run (expected scale)
- [ ] Secrets rotated (if applicable)
- [ ] Backup of production database created
- [ ] Team notified of deployment

---

## Resources

- [Netlify Environment Variables Docs](https://docs.netlify.com/environment-variables/overview/)
- [Supabase Project Settings](https://app.supabase.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)
- [1Password for Teams](https://1password.com/teams/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Last Updated**: February 12, 2026
**Version**: 1.0
**Audience**: Developers, DevOps, Security Team
