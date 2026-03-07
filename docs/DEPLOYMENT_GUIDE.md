# Deployment Guide - Managed Capture 3D Platform

**Status:** Ready for Production
**Last Updated:** February 11, 2026
**Target Platform:** Netlify
**Estimated Setup Time:** 30-60 minutes

---

## Pre-Deployment Checklist

### Phase 1: Verify Local Setup (15 minutes)

- [ ] **Build succeeds locally**

  ```bash
  npm run build
  # Should show: ✓ built in X.XXs
  ```

- [ ] **Preview works**

  ```bash
  npm run preview
  # Visit http://localhost:4173
  # Test all routes, dark mode, auth flows
  ```

- [ ] **No console errors**
  - Open DevTools (F12)
  - Check Console tab for red errors
  - Should only show informational logs

- [ ] **Environment variables documented**
  - [ ] VITE_SUPABASE_URL format verified
  - [ ] VITE_SUPABASE_ANON_KEY length checked (>20 chars)
  - [ ] VITE_USE_MOCK_DATA set to 'false' for production

### Phase 2: Supabase Backend Ready (From Step 19)

- [ ] **Supabase project created**
  - [ ] Project URL available
  - [ ] Anonymous key copied
  - [ ] Database tables created (13 tables)
  - [ ] RLS policies enabled

- [ ] **Test user account created**
  - [ ] Email: test@example.com
  - [ ] Password: saved securely
  - [ ] User profile created
  - [ ] Organization assigned

- [ ] **Backups configured**
  - [ ] Automatic backups enabled
  - [ ] Retention set to 30+ days
  - [ ] Backup restore process documented

- [ ] **SSL/TLS certificate active**
  - [ ] HTTPS enabled on Supabase URL
  - [ ] Certificate valid and not expired

### Phase 3: Netlify Account & Project Setup (10 minutes)

- [ ] **Netlify account created**
  - [ ] Email verified
  - [ ] Credit card on file (if needed for pro features)

- [ ] **Git repository connected**
  - [ ] GitHub/GitLab account linked to Netlify
  - [ ] Repository has netlify.toml
  - [ ] Main branch selected as deploy branch

- [ ] **Project created on Netlify**
  - [ ] Connected to GitHub repository
  - [ ] Build command verified: `npm run build`
  - [ ] Publish directory verified: `dist`

---

## Step-by-Step Deployment

### Step 1: Connect Repository to Netlify (5 minutes)

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com/
   - Sign in with your account

2. **Add New Site from Git**
   - Click "Add new site"
   - Select "Import an existing project"
   - Choose Git provider (GitHub/GitLab/Bitbucket)

3. **Select Repository**
   - Authorize Netlify to access your Git account
   - Select `managed-capture-3d-platform` repository
   - Click "Connect"

4. **Configure Build Settings**
   - **Base directory:** (leave empty)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - Click "Deploy site"

### Step 2: Configure Environment Variables (10 minutes)

**Location:** Site Settings → Build & Deploy → Environment

1. **Add Supabase Configuration**

   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Enable Real Backend**

   ```
   VITE_USE_MOCK_DATA = false
   ```

3. **Optional: Storage Configuration**

   ```
   VITE_STORAGE_BUCKET = https://s3.example.com/managed-capture
   VITE_API_BASE_URL = https://api.example.com
   ```

4. **Verify Variables**
   - Go to Build → Deploy → Environment
   - Confirm all variables are set
   - Click "Save"

### Step 3: Configure Headers & Redirects (5 minutes)

Netlify uses `netlify.toml` for configuration:

**Already configured:**

- ✅ SPA fallback routing (/\* → /index.html)
- ✅ Security headers (X-Frame-Options, CSP)
- ✅ Cache control for assets
- ✅ CORS headers for Supabase

**No additional changes needed** - all in `netlify.toml`

### Step 4: Deploy & Verify (5 minutes)

1. **Trigger First Deploy**
   - Push to main branch:
     ```bash
     git push origin main
     ```
   - Netlify automatically starts build
   - Watch build log in dashboard

2. **Verify Build Success**
   - Build log should show: `✓ built in X.XXs`
   - Click deployment link when complete
   - Verify site loads at https://your-site.netlify.app

3. **Test Production Deployment**
   - [ ] Visit https://your-site.netlify.app
   - [ ] All routes load (/, /gallery, /pricing, /how-it-works)
   - [ ] Login page loads
   - [ ] Sign in with real Supabase user
   - [ ] Portal loads with real projects
   - [ ] Dark mode toggle works
   - [ ] No console errors (F12 → Console)

---

## Post-Deployment Configuration

### Custom Domain Setup (Optional, 10 minutes)

1. **Add Custom Domain**
   - Site Settings → Domain management
   - Click "Add domain"
   - Enter your domain (e.g., platform.example.com)

2. **Update DNS Records**
   - Netlify provides DNS instructions
   - Add CNAME or A record to your DNS provider
   - Wait 24-48 hours for propagation

3. **Enable HTTPS**
   - Netlify automatically enables Let's Encrypt
   - HTTPS active within 10 minutes

### Monitoring & Alerts (15 minutes)

1. **Enable Netlify Analytics**
   - Site Settings → Analytics
   - Subscribe to analytics plan (optional)
   - Get insights into traffic and performance

2. **Set Up Build Notifications**
   - Site Settings → Build & deploy → Notifications
   - Add Slack webhook or email alerts
   - Get notified on build failures

3. **Monitor Supabase**
   - Supabase Dashboard → Monitoring
   - Check database connection status
   - Monitor query performance

### Backup & Recovery Setup (10 minutes)

1. **Database Backups**
   - Supabase Dashboard → Settings → Backups
   - Verify automatic backups enabled
   - Test restore procedure monthly

2. **Git Backups**
   - Repository is automatically backed up by GitHub
   - Enable GitHub Actions for CI/CD (optional)

3. **Disaster Recovery Plan**
   - Document how to restore from backup
   - Test recovery process quarterly
   - Keep runbook in team wiki

---

## Environment Variables Reference

### Required for Production

| Variable                 | Example                   | Purpose                         |
| ------------------------ | ------------------------- | ------------------------------- |
| `VITE_SUPABASE_URL`      | `https://xxx.supabase.co` | Supabase project URL            |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...`             | Supabase public key (>20 chars) |
| `VITE_USE_MOCK_DATA`     | `false`                   | Enable real backend (CRITICAL)  |

### Optional

| Variable              | Example                      | Default                          | Purpose               |
| --------------------- | ---------------------------- | -------------------------------- | --------------------- |
| `VITE_API_BASE_URL`   | `https://api.example.com`    | `http://localhost:3001/api`      | Backend API endpoint  |
| `VITE_STORAGE_BUCKET` | `https://s3.example.com/...` | `s3.example.com/managed-capture` | S3 bucket for uploads |

### Netlify-Specific (Auto-Set)

| Variable   | Purpose                        |
| ---------- | ------------------------------ |
| `NODE_ENV` | Set to `production` by Netlify |
| `CI`       | Set to `true` by Netlify       |

### ⚠️ NEVER Add These

```bash
# DON'T set these in Netlify environment:
SUPABASE_SERVICE_ROLE_KEY    # Admin key - server-side only
DATABASE_PASSWORD             # Database password - unnecessary
API_SECRET_KEY               # Backend secrets - wrong place
```

---

## Deployment Verification Checklist

### Build Phase ✅

- [ ] `npm run build` produces dist/ folder
- [ ] dist/index.html exists
- [ ] dist/assets/ contains .js and .css files
- [ ] No TypeScript errors during build
- [ ] Bundle size reasonable (<1MB gzip for main)

### Runtime Phase ✅

- [ ] Site loads at https://your-domain
- [ ] No 404 errors on assets
- [ ] Console shows no red errors
- [ ] Network tab shows all requests successful

### Functionality Phase ✅

**Public Routes:**

- [ ] / (Home) loads
- [ ] /gallery loads
- [ ] /pricing loads
- [ ] /how-it-works loads
- [ ] /industries/restaurant loads

**App Routes:**

- [ ] /app/login loads
- [ ] Login form works
- [ ] Error messages display correctly

**Portal Routes (After Login):**

- [ ] /portal/dashboard loads
- [ ] Projects list displays (real data)
- [ ] Create project form works
- [ ] Project detail view works
- [ ] Logout clears session

### Data Integrity Phase ✅

- [ ] Creating project inserts to Supabase
- [ ] Creating asset inserts to Supabase
- [ ] RLS policies prevent cross-org access
- [ ] Session persists after page reload
- [ ] Token refreshes automatically

### Performance Phase ✅

- [ ] Page load < 3 seconds (Lighthouse)
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5s

---

## Troubleshooting Common Issues

### Issue: Build Fails with "Cannot find module"

**Solution:**

1. Verify package.json has all dependencies
2. Run `npm install` locally and commit package-lock.json
3. Check build log for exact error
4. Retry deploy

### Issue: Environment Variables Not Recognized

**Solution:**

1. Verify variables in Netlify dashboard (Site Settings → Build & Deploy → Environment)
2. Restart build (Deploy settings → Trigger deploy)
3. Wait for build to complete (takes 3-5 minutes)
4. Variables take effect on next deploy

### Issue: Login Fails (401 Unauthorized)

**Solution:**

1. Verify VITE_SUPABASE_URL is correct
2. Verify VITE_SUPABASE_ANON_KEY is complete (not truncated)
3. Check Supabase project is running (not paused)
4. Verify test user exists in Supabase Auth
5. Check browser console for exact error

### Issue: Projects List Empty (No Data Shows)

**Solution:**

1. Verify VITE_USE_MOCK_DATA=false
2. Create test projects in Supabase database
3. Verify RLS policy allows user org access
4. Check browser Network tab for API errors
5. Verify JWT token is in Authorization header

### Issue: CORS Errors from Supabase

**Solution:**

1. Verify Supabase domain in error message
2. Check CORS headers in netlify.toml
3. Verify origin matches deployed domain
4. Clear browser cache (Ctrl+Shift+Delete)
5. Test in private/incognito window

### Issue: Page Loads but Shows Blank Screen

**Solution:**

1. Open browser DevTools (F12)
2. Check Console for JavaScript errors
3. Check Network tab for failed requests
4. Look for 404 errors on assets
5. Verify dist/ folder uploaded correctly

---

## Monitoring & Maintenance

### Daily

- [ ] Check Netlify deploy status (no red errors)
- [ ] Monitor Supabase uptime (status.supabase.com)

### Weekly

- [ ] Review error logs in browser console
- [ ] Monitor database query performance
- [ ] Check for security alerts from GitHub

### Monthly

- [ ] Test database restore procedure
- [ ] Review Netlify analytics for performance
- [ ] Update dependencies (npm update)
- [ ] Backup database (manual verification)
- [ ] Test authentication flows manually

### Quarterly

- [ ] Full disaster recovery drill
- [ ] Security audit (OWASP top 10)
- [ ] Performance optimization review
- [ ] Load testing with staging site

---

## Rollback Procedure

### If Deployment Has Critical Issues

1. **Immediate Rollback**

   ```bash
   git revert <commit-hash>
   git push origin main
   # Netlify auto-deploys within 2 minutes
   ```

2. **Or Revert in Netlify Dashboard**
   - Go to Deploys tab
   - Find previous successful deploy
   - Click "Publish deploy"
   - Takes effect immediately

3. **Verify Rollback Success**
   - Check site loads correctly
   - Verify database still accessible
   - Confirm no data loss

---

## Performance Optimization

### Code Level

- ✅ Tree-shaking enabled (Vite default)
- ✅ Unused console.log stripped (production build)
- ✅ Code splitting by route (React.lazy)
- ✅ Asset hashing for cache busting

### Netlify Level

- ✅ Gzip compression enabled (automatic)
- ✅ Minification enabled (automatic)
- ✅ CDN distribution (automatic)
- ✅ HTTP/2 push (automatic)

### Supabase Level

- ✅ Connection pooling enabled (pgBouncer)
- ✅ Automatic query optimization
- ✅ Database indexing configured
- ✅ RLS policies efficient

### Monitoring

**Check Performance:**

- Lighthouse audit (F12 → Lighthouse)
- WebPageTest.org (external tool)
- Chrome DevTools Network tab
- Netlify Analytics (if subscribed)

**Target Metrics:**

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- FCP < 1.5s

---

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] Supabase API key is "anonymous" (not service role)
- [ ] Service role key NEVER in client code
- [ ] Environment variables NOT in git history
- [ ] CORS headers properly configured
- [ ] CSP policy in netlify.toml
- [ ] X-Frame-Options prevents clickjacking
- [ ] X-Content-Type-Options prevents MIME sniffing
- [ ] Referrer-Policy prevents info leakage
- [ ] RLS policies enforce data isolation

---

## Support & Escalation

### Netlify Support

- **Issue:** Build/deployment problems
- **Contact:** https://www.netlify.com/contact/
- **Plan:** Check your Netlify plan for support access

### Supabase Support

- **Issue:** Database/auth problems
- **Contact:** https://supabase.com/docs/guides/troubleshooting
- **Plan:** Community forums or enterprise support

### Team Escalation

- **Critical:** Page 24/7 on-call
- **High:** Slack #incidents channel
- **Medium:** JIRA ticket + daily standup
- **Low:** Email thread

---

## Version History

| Date       | Version | Status | Notes                         |
| ---------- | ------- | ------ | ----------------------------- |
| 2026-02-11 | 1.0     | Ready  | Initial production deployment |

---

## Sign-Off

- [ ] **DevOps Lead:** Reviewed and approved
- [ ] **Tech Lead:** Reviewed architecture
- [ ] **QA Lead:** Verified testing
- [ ] **Product Manager:** Approved for release

---

**Next:** After successful deployment, monitor for 24-48 hours and escalate any issues immediately.
