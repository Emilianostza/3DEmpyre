# Changelog — Managed Capture 3D Platform

> All notable project changes, documented chronologically.
> Prefer concise, factual entries focused on what changed and why it mattered.

---

## [Session 26 — HttpOnly Cookie Auth Migration] — 2026-03-07

### Summary

Migrated JWT authentication from localStorage to HttpOnly cookie-based auth via server-side Netlify Function proxies. This was priority #1 in CLAUDE.md and the top known blocker in INDEX.md.

### Architecture

- **Approach**: Hybrid Cookie Proxy — auth operations go through new Netlify Functions that set/read HttpOnly cookies; data queries continue through the Supabase SDK client-side (for RLS)
- **Cookie layout**: `mc_access_token` (HttpOnly, Secure, SameSite=Strict, 1hr), `mc_refresh_token` (HttpOnly, restricted Path, 7d), `mc_csrf` (non-HttpOnly, 1hr)
- **CSRF protection**: non-HttpOnly `mc_csrf` cookie echoed as `X-CSRF-Token` header on mutation endpoints (refresh, logout)
- **Dual-source token extraction**: existing Netlify Functions accept cookie OR Bearer header for backward compatibility
- **Supabase SDK sync**: proxy returns tokens in response body; frontend calls `supabase.auth.setSession()` to keep SDK in sync for RLS

### Files Created

- `netlify/functions/_shared/cookies.ts` — cookie parse/set/clear/extract helpers
- `netlify/functions/_shared/csrf.ts` — CSRF token generation and validation
- `netlify/functions/auth-login.ts` — POST `/api/auth/login`
- `netlify/functions/auth-refresh.ts` — POST `/api/auth/refresh`
- `netlify/functions/auth-logout.ts` — POST `/api/auth/logout`
- `netlify/functions/auth-session.ts` — GET `/api/auth/session`

### Files Modified

- `netlify.toml` — added `/api/auth/*` redirect rule before SPA fallback
- `netlify/functions/assets-signed-url.ts` — dual-source token extraction
- `netlify/functions/gemini-proxy.ts` — dual-source token extraction
- `src/services/api/auth.ts` — real functions call proxy endpoints; mock functions use `_mockCurrentUserId` module-level state; removed `apiClient` import
- `src/contexts/AuthContext.tsx` — full rewrite: removed all 18 localStorage operations, session restore via proxy, TTL-based refresh scheduling
- `src/services/api/real/assets.ts` — removed Bearer header, uses `credentials: 'include'`
- `src/services/api/real/photogrammetry.ts` — removed Bearer header, uses `credentials: 'include'`

### Validation

- TypeScript: zero errors
- ESLint: zero warnings (src files)
- Tests: 240 pass / 16 fail (all pre-existing, see below)
- Preview: login → dashboard → logout → re-login cycle verified in mock mode
- localStorage: no stale `managed_capture_*` keys remain after mount

### Test Suite Status

- 240 tests pass, 16 fail (all pre-existing, unrelated to auth migration)
- `Home.test.tsx` (10 failures): i18n provider not initialized in test setup
- `ProtectedRoute.test.tsx` (1 failure): i18n `t()` not mocked in loading spinner assertion
- `formatters.test.ts` (5 failures): `timeAgo()` tests expect abbreviated format (`1d ago`) but implementation returns long format (`1 day ago`)
- None of these test files were modified during the auth migration

### Known Limitations

- Mock mode: `mockRefreshToken` rejects `{ refresh_token: '' }` — causes console errors every 5 min in dev. Non-blocking, mock-only.
- Mock mode: hard refresh loses session (`_mockCurrentUserId` resets). Expected — mock mode is dev-only.
- Multi-tab logout signaling not implemented (no `BroadcastChannel` or `storage` event).
- `apiClient` class (`client.ts`) still exists and is exported from `index.ts` but is no longer imported by any consumer in `src/`. Can be removed in a future cleanup.

### Pending

- Deployed verification on Netlify preview (cookies, CSRF, session restore, refresh cycle)

---

## [Session 25 — Public Website Full Audit] — 2026-03-06

### Critical Fixes

- **C1**: Replaced hardcoded English error "Please select a plan" with `t('requestForm.errors.selectedPlan')` in RequestForm.tsx
- **C2**: Investigated — false positive. AR viewer link `/view/${id}` correctly matches route `/view/:assetId`

### High-Priority Fixes

- **H1**: Added optional phone number field to RequestForm Step 3 (types.ts + RequestForm.tsx + 4 locale files)
- **H4**: Added post-submission response time reassurance to RequestForm success screen
- **H6**: Hidden Roadmap progress bar connector lines on mobile (`hidden sm:block`)

### Medium-Priority Fixes

- **M1**: Replaced 3 hardcoded English placeholders in ROICalculator.tsx with `t()` calls
- **M2**: Blog card category pills now use translated category names via `t(CATEGORY_KEYS[...])`
- **M3**: Added `useEscapeKey` hook to Library modal for keyboard close
- **M4**: Added `aria-pressed` to Library filter buttons for screen reader support
- **M5**: Added `aria-valuenow` and `aria-valuetext` to ROI Calculator range input
- **M6**: Added `scope="col"` to all `<th>` elements in Compare, CompareARCode, CompareMenus
- **M8**: Added SOC 2 trust badge near RequestForm Step 3 contact fields
- **M9**: Changed Industry page gallery anchor from `<a href>` to `<button>` with `scrollIntoView({ behavior: 'smooth' })`
- **M10**: Removed hardcoded English defaults from HowItWorks `t()` calls; added 3 missing keys to de/es/ru locales
- **M11**: Added `onKeyDown` handler + `tabIndex={0}` to Home scroll cue for keyboard accessibility

### Sitemap Fix

- Updated `/gallery` → `/library` in sitemap.xml (route was renamed in earlier session)

### Skipped (by user decision)

- H5: Social links kept as-is
- M7: No security disclosure email for now
- M12: City names are proper nouns, no translation needed

### Files Modified

- `src/types.ts`, `src/pages/RequestForm.tsx`, `src/pages/Library.tsx`
- `src/pages/Compare.tsx`, `src/pages/CompareARCode.tsx`, `src/pages/CompareMenus.tsx`
- `src/pages/Home.tsx`, `src/pages/ROICalculator.tsx`, `src/pages/Industry.tsx`
- `src/pages/Blog.tsx`, `src/pages/HowItWorks.tsx`, `src/pages/Roadmap.tsx`
- `public/locales/{en,de,es,ru}/translation.json` (12 new i18n keys total)
- `public/sitemap.xml`
- Build verified: zero TypeScript errors, zero lint warnings, successful production build

---

## [Session 24 — i18n URL Route Prefixes] — 2026-02-22

### i18n URL Structure

- Created `src/contexts/LocaleContext.tsx` — provides `locale`, `localePath()`, `stripLocalePath()`, `switchLocale()`
- Created `src/components/LocalizedLink.tsx` — drop-in `Link` replacement that auto-prepends locale prefix (`/de/`, `/es/`, `/ru/`)
- Updated route structure so public routes exist at both root and locale-prefixed paths
- English routes remain at root (`/gallery`, `/pricing`, etc.)
- Non-English routes use path prefixes (`/de/gallery`, `/es/pricing`, `/ru/about`)

### Language Detection

- Added custom path-based locale detector in `i18n.ts`
- Updated `LanguageSwitcher` to navigate to locale-prefixed URLs instead of only changing in-memory language state

### SEO Updates

- Switched hreflang URLs from querystring pattern to path-based locale URLs
- Updated `og:locale` to reflect current locale dynamically
- Canonical URL now reflects locale-prefixed path where relevant

### Files Updated

- 21 public page files switched from `Link` → `LocalizedLink as Link`
- `Layout.tsx` updated to use `LocalizedLink` + `barePath` for active state detection
- Build verified: 2010 modules, 5.32s, zero errors, main bundle 39.47 kB

---

## [Session 23 — i18n Performance & Portal Completion] — 2026-02-22

### Build Fix

- Fixed broken i18n wiring in `TechnicianMetrics.tsx` where a variable name was incorrectly replaced by a translation call
- Restored valid build behavior

### i18n Lazy-Loading (Performance)

- Installed and configured `i18next-http-backend` for runtime translation loading from `/locales/{{lng}}/translation.json`
- Created `scripts/convert-locales.cjs` to convert TypeScript locale files into JSON under `public/locales/`
- Removed static locale imports from the main bundle
- Reduced main bundle size from 532.85 kB → 38.06 kB (−93%)
- Added `<html lang>` synchronization on language changes
- Added `supportedLngs: ['en', 'de', 'es', 'ru']`

### SEO — Hreflang Tags

- Added hreflang alternate tags for all 4 languages + `x-default`
- Added Open Graph locale metadata for English, German, Spanish, and Russian
- At this stage, language variants still used a querystring pattern before Session 24 moved them to path prefixes

### Portal i18n Completion

- Wired the remaining portal components to `react-i18next`:
  - `AutomatedReporting.tsx`
  - `MenuSettingsModal.tsx`
  - `BrandedQRCode.tsx`
  - `EmbedGenerator.tsx`
  - `MultiMarketView.tsx`
  - `SuperAdmin.tsx`
- Added 271 new translation keys to all 4 locale files
- Total translation keys per language: 1825 → 2093
- All major portal surfaces now have i18n coverage
- Build verified: 5.41s, zero errors, main bundle 38.06 kB

---

## [Session 6 — Phase 2 continued] — 2026-02-21

### Theme Cleanup Extended

- Removed remaining public-site `dark:` prefixes from 10 shared components used by public pages
- Rewrote `NotFound.tsx` and `Login.tsx` to dark-only styling
- Cleaned `Accordion.tsx`, `Button.tsx`, `Card.tsx`, `ErrorBoundary.tsx`, `Toast.tsx`, `PageState.tsx`, `Skeleton.tsx`, `ProtectedRoute.tsx`
- Fixed `Gallery.tsx` background from `bg-zinc-900` → `bg-zinc-950`
- Reduced CSS bundle from 129.82 kB → 128.43 kB
- Result: only 11 `dark:` files remained and all were portal/internal-only

### Interactive Enhancements

- Created `src/hooks/useCountUp.ts`
- Added animated Home hero counters
- Added Home hero scroll-down cue

### SEO Structured Data

- Added `BreadcrumbSchema` to all remaining public pages lacking breadcrumbs
- Added `FAQSchema` to Home, Pricing, and RestaurantPricing
- Added `ServiceSchema` to Pricing and RestaurantPricing

### CSS Cleanup

- Removed remaining light-mode dead code from `index.css`
- Removed redundant `.dark {}` override block
- Reduced CSS bundle again from 128.43 kB → 127.62 kB
- Build verified: zero TS errors, 4.56s production build

---

## [Session 5 — Phase 2] — 2026-02-20

### Website Quality & Theme Consistency

- Removed redundant `dark:` prefixed classes from major public-facing files
- Made layout header, footer, and mobile menu dark-only
- Created `Compare.tsx` — Managed 3D vs DIY Scanning vs No 3D
- Added `/compare` route
- Added Compare link to footer
- Changed pricing CTA links to `/compare`
- Corrected misleading Home stats
- Fixed Home hero fade, FAQ section, testimonials, and roadmap teaser to consistent dark-only styling

### SEO Improvements

- Updated `sitemap.xml` — added missing pages, removed dead pages, corrected domain, updated `lastmod`
- Updated `robots.txt` — corrected domain, added `/editor/` disallow
- Added `BreadcrumbSchema` and `LocalBusinessSchema` to structured data support
- Added `LocalBusinessSchema` to Home
- Added `BreadcrumbSchema` to CaseStudies, Compare, and About
- Build verified: zero TS errors, 4.50s production build

---

## [Session 4 — Phase 1] — 2026-02-20

### Public Pages & Conversion Optimization

- Fixed 14+ CTA inconsistencies across 10+ files → standardized to "Get a Free Quote"
- Added trust bar to `Home.tsx`
- Corrected testimonial wording to singular
- Corrected SOC 2 wording
- Created `CaseStudies.tsx`
- Redesigned Request Form from 5 steps → 3 steps with improved trust signals and UX
- Created `About.tsx`
- Fixed dead `/#contact` links on pricing pages
- Added reassurance messaging near CTAs
- Updated navigation and footer links
- Added `/case-studies` and `/about` routes
- Build verified: zero TS errors, 4.64s production build

---

## [Session 3] — 2026-02-20

### Cleanup & Dead Code Removal

- Deleted ~45 unused files
- Trimmed `domain.ts` and `dtos.ts`
- Removed deprecated auth/role mapping leftovers
- Extracted constants in `Portal.tsx` and `SuperAdmin.tsx`
- Simplified `dataProvider.ts`
- Cleaned empty directories
- Removed stale Vite test config reference
- Result: 67 source files, 17 directories, zero TS errors, 4.42s build

---

## [Session 2] — 2026-02-20 (earlier)

### High / Medium / Low Priority Fixes

- Rewrote `ApiClient` with proper JWT refresh, error typing, and retry logic
- Fixed `AuthContext` integration with real Supabase auth
- Added `PageState` component for loading, error, and empty states
- Added SEO component with meta tags across core pages
- Added structured data support (`Organization`, `WebSite`, FAQ)
- Improved accessibility with aria labels, focus states, and skip-to-content behavior
- Optimized Vite config with manual chunks, tree-shaking, and source maps

---

## [Session 1] — 2026-02-19 (approx)

### Initial Audit and Critical Fixes

- Performed full codebase audit
- Identified critical, high, medium, and low priority issues
- Began resolving core API client and auth problems

---

## Changelog Entry Standard

For future entries, prefer this format:

### [Session N — Short Title] — YYYY-MM-DD

#### Area

- concise factual change
- concise factual change

#### Validation

- build / lint / typecheck / targeted verification