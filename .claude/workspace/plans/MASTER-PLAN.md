# MASTER PLAN — Managed Capture 3D Platform

> Last updated: 2026-03-06
> This is the SINGLE SOURCE OF TRUTH for planned improvements.
> Status: [ACTIVE WORKING PLAN — use as planning context, but prefer latest user instructions and current workspace notes when they conflict]

---

## Vision

Become the world's leading managed 3D capture service by delivering unmatched quality through a highly automated pipeline, serving restaurants, retail, and enterprise across Europe and Russia.

## Core Principles

1. **Quality is #1** — every pixel, every polygon, every interaction must feel premium
2. **Automation where it matters** — reduce manual work without reducing quality
3. **Research before action** — question decisions and prefer evidence
4. **Continuous improvement** — keep refining product, website, and operations
5. **Current priorities first** — immediate website quality and conversion work take priority over long-range roadmap ideas unless explicitly requested

---

## Practical Focus for Current Sessions

The current practical focus for Claude Code is:

1. Public website quality
2. Conversion and CTA clarity
3. UX/UI consistency
4. Mobile responsiveness
5. Accessibility
6. SEO basics
7. Technical stability and maintainability
8. Completing core backend/product integration only where directly relevant

Unless the user explicitly asks otherwise, do not let later strategic phases distract from immediate website quality, conversion, responsiveness, accessibility, and technical stability work.

---

## PHASE 1: Public Pages & Conversion (NOW — Next 2–4 weeks)

> Priority: get more leads from the existing website

### 1.1 Fix CTA Inconsistencies [QUICK WIN] ✅ DONE

- [x] Fixed 14+ CTAs across 10+ files → all "Get a Free Quote"
- [x] Fixed testimonial header (singular)
- [x] Fixed SOC 2 footer text

### 1.2 Add Trust Signals [HIGH IMPACT] ✅ DONE (partial)

- [x] Added security badges (SOC 2, GDPR, Enterprise Security) as trust bar on Home
- [x] Added "No credit card required" reassurance near CTAs site-wide
- [ ] Client logos strip below hero (needs real client logos)
- [ ] Add 2–4 more testimonials (needs real testimonials)
- [ ] Add "Trusted by X restaurants in Y countries" counter

### 1.3 Create Case Studies Page [HIGH IMPACT] ✅ DONE

- [x] 3 case studies: Paris restaurant, Athens hotel, Tallinn market
- [x] Challenge → Solution → Results format with metrics
- [x] Summary stats section
- [x] CTA with "Get a Free Quote"
- [x] Route (`/case-studies`) + main nav link + footer link

### 1.4 Optimize Request Form [CONVERSION] ✅ DONE

- [x] Consolidated from 5 steps to 3 steps
- [x] Redesigned with dark theme (`zinc-950`) matching site
- [x] Added trust signals sidebar (no credit card, 24h response, SOC 2)
- [x] Progress indicator with clickable completed steps
- [x] Live cost estimate sidebar retained
- [x] Inline validation + improved error display

### 1.5 Pricing Page Improvements [CONVERSION] ✅ DONE

- [x] Fixed dead `/#contact` links → `/request`
- [x] Added "No credit card required" trust signals
- [x] Added Case Studies link in bottom CTA
- [x] FAQ already existed on both pricing pages
- [x] ROI Calculator page at `/roi` — interactive calculator with live results, animated KPIs, SEO, breadcrumbs
- [x] Route + footer link + sitemap entry added
- [x] Comparison table already built at `/compare` (Managed 3D vs DIY vs No 3D)

### 1.6 Add Missing High-Impact Pages ✅ DONE

- [x] **About Us page** — values, stats, timeline, coverage map, CTA
- [x] Route (`/about`) + footer link
- [x] **Blog index page** — dark-themed, category filter, card grid, SEO
- [x] **Blog post page** — slug routing, breadcrumb, related posts, bottom CTA
- [x] **3 blog posts**: 3D photography trends, AR menus, 3D scanning guide
- [x] Routes (`/blog`, `/blog/:slug`) + main nav link + sitemap entries

---

## PHASE 2: Website Quality & Performance (Weeks 3–6)

> This phase is the main technical execution focus for current sessions.

### 2.0 Theme Consistency [QUALITY] ✅ DONE

- [x] Removed all redundant `dark:` prefixed classes from 12+ public-facing files
- [x] Layout header/footer/mobile menu cleaned (16 instances)
- [x] All public pages now dark-only (Home, Pricing, Gallery, HowItWorks, Industry, CaseStudies, Compare, About, Terms, Privacy, Security)
- [x] Fixed Home stats (removed inflated numbers), hero fade, FAQ section, testimonials
- [x] Extended cleanup to shared components: Accordion, Button, Card, ErrorBoundary, Toast, PageState, Skeleton, ProtectedRoute
- [x] Cleaned `NotFound.tsx`, `Login.tsx` — full dark-only rewrites
- [x] Fixed `Gallery.tsx` `bg-zinc-900` → `bg-zinc-950` for consistency
- [x] CSS bundle reduced by 1.39 kB from removing dead `dark:` classes
- [x] Only 11 `dark:` files remain — all are portal/internal-only (low priority)

### 2.1 Performance Optimization [QUALITY]

- [x] Added width/height to `Gallery.tsx` thumbnails for CLS prevention
- [x] Verified all public pages for CLS — only Gallery needed fixes
- [x] Removed 5 unused packages: `@react-three/fiber`, `@react-three/drei`, `@types/three`, `jwt-decode`, `three` (as direct dep) — 48 packages pruned from `node_modules`
- [x] Fixed `index.html`: absolute `og:image` URLs, added `og:url` + `og:site_name` static fallbacks for social crawlers
- [x] Replaced useless `dns-prefetch` (`modelviewer.dev`, `picsum.photos`) with correct `www.gstatic.com` (Draco WASM decoder)
- [x] Consolidated duplicate keyframe animations (CSS → Tailwind config) — CSS reduced by ~1 kB
- [x] Removed redundant zinc color scale from `tailwind.config.js`
- [x] Fixed font-mono config: removed unloaded JetBrains Mono/Fira Code → system monospace
- [x] Created SVG favicon + Web App Manifest
- [x] Build verified: CSS 127.91 kB (down from 128.86 kB), 1939 modules, 4.59s, zero errors
- [x] Added `vite-plugin-compression`: gzip + brotli pre-compression for all assets
- [x] Brotli compression results: CSS 127 → 14.86 kB (-88%), vendor-three 726 → 159 kB (-78%), vendor-react 180 → 47 kB (-74%)
- [x] Removed stale `@react-three` chunk reference from `vite.config.ts` manualChunks
- [x] Created `src/config/site.ts` — centralized `SITE_ORIGIN`, `SITE_NAME`, `SITE_LOGO`, `CTA_TEXT` constants
- [x] Refactored `SEO.tsx` + `StructuredData.tsx` to import from `site.ts`
- [x] Added img width/height to `QRCodeModal` for CLS prevention
- [x] Verified: all public-facing pages have zero `dark:` classes (only portal/internal remain, as intended)
- [x] Replaced all `picsum.photos` URLs on public pages with inline SVG data URI placeholders
- [x] Centralized demo model URLs into `DEMO_MODELS` config object
- [x] Replaced `constants.tsx` `picsum` URLs (Industry page) with inline SVG placeholder generator
- [x] Added `<noscript>` fallback to `index.html`
- [x] Created `og-image.svg` social sharing template in `public/`
- [x] Enabled `cssCodeSplit: true` in Vite config
- [x] Fixed `ModelEditor.tsx` `hexToRgba` — replaced `any` type with proper typed approach
- [x] Added eslint-disable annotations to intentional `any` types
- [x] Added `loading="lazy"` + width/height to portal images
- [x] Updated `sitemap.xml` `lastmod` dates to 2026-02-21
- [x] Eliminated all remaining `picsum.photos` URLs from the entire codebase
- [x] Added reusable `placeholder()` SVG generator to `site.ts`
- [x] Zero external image dependencies remaining across the entire codebase (only `modelviewer.dev` 3D assets remain, centralized in config)
- [x] Final verified build: 1940 modules, 4.78s, zero TS errors, gzip + brotli compressed
- [ ] Measure Core Web Vitals (LCP, INP/FID, CLS) with Lighthouse — requires deployed server or realistic runtime testing
- [ ] Optimize 3D model loading: poster → low-poly → full-quality — requires real 3D assets
- [ ] Implement Draco mesh compression + KTX2 textures — requires real 3D assets
- [ ] Image optimization: WebP/AVIF with `srcset` — requires real images
- [ ] Convert `og-image.svg` → `og-image.jpg` (1200x630) for broader social crawler compatibility
- [ ] Target: LCP < 2.5s, INP/FID < 100ms, CLS < 0.1
- **Why**: page speed strongly affects conversion

### 2.2 Advanced SEO [GROWTH] ✅ DONE (partial)

- [x] Added `LocalBusinessSchema` (ProfessionalService type) to Home
- [x] Added `BreadcrumbSchema` to CaseStudies, Compare, About pages
- [x] Updated `sitemap.xml` — added 5 new pages, removed 2 dead pages, fixed domain
- [x] Updated `robots.txt` — fixed domain, added `/editor/` disallow
- [x] Canonical URLs already implemented via SEO component
- [ ] Create country-specific landing pages (`/fr/`, `/gr/`, `/ee/`) — deferred to Phase 6
- [ ] Add hreflang tags for multi-language support — deferred to Phase 6
- [ ] Submit sitemap to Google Search Console — manual step
- **Why**: stronger multi-country SEO can support organic lead generation

### 2.3 Interactive Enhancements [ENGAGEMENT] ✅ DONE

- [x] Created `useCountUp` hook — `requestAnimationFrame` animated counter with ease-out cubic
- [x] Home hero: animated stat counters with staggered delays
- [x] Home hero: scroll-down cue (bouncing chevron + label, auto-hides on scroll)
- [x] Hero `model-viewer`: added `loading="eager" reveal="auto"` for explicit progressive loading
- [x] Gallery `model-viewer`: added `loading="eager" reveal="auto"` + fixed progress bar color
- [x] Created `BeforeAfterSlider` component (mouse/touch/keyboard, ARIA slider role, a11y)
- [x] Added "The Upgrade" section to Home page with before/after slider
- [x] Added "Live Demo" section to Home — interactive 3D viewer with feature highlights sidebar, CTA
- [x] Added `reveal-scale` CSS variant — scale+translate entrance for 3D viewer sections
- [x] Applied scroll-triggered animations across major Home sections
- **Why**: interactive demos can improve engagement and perceived product quality

### 2.4 Comparison Pages [SEO + CONVERSION] ✅ DONE

- [x] Created `Compare.tsx` — Managed 3D vs DIY Scanning vs No 3D
- [x] Added route `/compare`, linked from footer + both pricing pages
- [x] Created `CompareARCode.tsx`
- [x] Created `CompareMenus.tsx`
- [x] Added routes `/compare/ar-code` and `/compare/menus` + footer links + sitemap entries
- [x] Added cross-links section to main Compare page
- **Why**: comparison pages target high-intent search traffic

### 2.5 Code Quality & Bug Fixes [STABILITY]

- [x] Removed hardcoded personal email from `Login.tsx` mock users
- [x] Fixed `AuthContext` `user?.orgId` stale closure race condition using `useRef`
- [x] Fixed SEO `og:image` to use absolute URL
- [x] Added keyboard accessibility to desktop dropdown nav
- [x] Removed duplicate comment block in `AuthContext.tsx`
- [x] Deleted leftover `skills/` and `dist/` directories
- [x] Verified: `ScrollToTop` already respects `prefers-reduced-motion`
- [x] Verified: `EmbeddedModelEditor` already lazy-loaded
- [x] Verified: no `alert()` calls remain
- [x] Verified: no `/#contact` links remain
- [x] Verified: CSP headers reasonable
- [x] Verified: `target="_blank"` has `rel="noopener noreferrer"`
- [x] Build verified: 1940 modules, 4.59s, zero TS errors

### 2.6 Accessibility (a11y) [QUALITY] ✅ DONE

- [x] Created `useFocusTrap` hook — traps keyboard focus in modals, restores focus on close
- [x] Gallery modal: added `role="dialog"`, `aria-modal`, `aria-label`, focus trap
- [x] Gallery cards: converted from `<div onClick>` to semantic `<button>`
- [x] Gallery search: added `aria-label="Search gallery models"`
- [x] NewProjectModal close button: added `aria-label="Close dialog"` + `aria-hidden` on icon
- [x] ModelEditor toolbar: added `aria-label` + `aria-pressed`
- [x] ModelEditor header: added `aria-label` to icon-only buttons
- [x] SceneDashboard search button: added `aria-label="Search assets"`
- [x] AssetUploader error dismiss button: added `aria-label="Dismiss error"`
- [x] EmbeddedModelEditor copy link button: added aria-label with dynamic copied state
- [x] AssetGrid table: added aria-label to icon-only buttons
- [x] EmbeddedModelEditor: added aria-label to all 9 transform inputs
- [x] Verified: `html lang="en"`, skip-to-content link, all images have alt, all inputs labeled
- [x] Final build: 1941 modules, 4.74s, zero TS errors

### 2.7 Production Hardening [QUALITY] ✅ DONE

- [x] Wrapped all AuthContext console statements in `import.meta.env.DEV` guard
- [x] Wrapped `auth.ts` `console.warn` in dev-only guard
- [x] Home.tsx: replaced hardcoded CTA/reassurance strings with `CTA_TEXT` and `REASSURANCE_TEXT`
- [x] Removed ~180 lines of dead CSS from `index.css`
- [x] CSS reduced from 127.91 kB → 125.09 kB
- [x] Added `React.memo()` to Card, Button, and Skeleton
- [x] Final build: 1941 modules, 4.67s, CSS 125.09 kB, zero TS errors

### 2.8 Final Sweep — Console Guards & String Centralization [QUALITY] ✅ DONE

- [x] Wrapped console errors in `real/assets.ts`, `real/projects.ts`, Gallery, SceneDashboard, NewCaptureWizard, QRCodeModal, RequestForm, Portal, NewProjectModal, SuperAdmin, RestaurantMenu, `auth.ts`
- [x] Guarded `env.ts` storage bucket warning with `isDev` check
- [x] Fixed `catch (err: any)` → `catch (err: unknown)` where relevant
- [x] Centralized `CTA_TEXT` across 12 files
- [x] Centralized `REASSURANCE_TEXT` across 7 files
- [x] Remaining hardcoded CTA strings are intentional
- [x] Verified: zero unguarded console statements in production code except intentional global handlers
- [x] Final build: 1941 modules, 4.52s, CSS 125.09 kB, zero TS errors

---

## Strategic Roadmap Phases

Important: phases below are strategic roadmap items, not default execution targets for current sessions unless the user explicitly asks to work on them.

---

## PHASE 3: Automated Processing Pipeline (Weeks 5–10)

### 3.1 Automated Photogrammetry Pipeline [CORE]

- [ ] Research and select API provider (Reali3, Autodesk, or self-hosted)
- [ ] Build upload endpoint: technician uploads photos via web app
- [ ] API integration: photos → cloud processing → 3D model (`GLB`/`GLTF`/`USDZ`)
- [ ] Auto-optimization: Draco compression, texture optimization, LOD generation
- [ ] Auto-upload to correct customer project
- [ ] Auto-notification to customer (email + dashboard alert)
- **Why**: full automation is a core long-term differentiator

### 3.2 Quality Assurance Automation [QUALITY]

- [ ] AI-based quality checks:
  - geometry completeness
  - texture quality
  - file size within targets
  - correct orientation and scale
- [ ] Auto-approve if quality score > threshold
- [ ] Flag for human review if below threshold
- [ ] Per-technician quality tracking
- **Why**: quality at scale requires automation

### 3.3 3D Gaussian Splatting Integration [INNOVATION]

- [ ] Deploy Apple SHARP for instant 3DGS preview generation
- [ ] Add 3DGS viewer option alongside mesh viewer
- [ ] Offer "Instant Preview" + "Full Quality"
- **Why**: potential differentiation if execution and quality are strong

---

## PHASE 4: Portal Improvements (Weeks 8–14)

### 4.0 Mock Data & Data-Driven Components ✅ DONE

- [x] Expanded mock projects: 1 → 12 projects across 4 clients
- [x] Projects span all statuses
- [x] Expanded mock assets: 1 → 25 assets with realistic view counts, sizes, and statuses
- [x] All thumbnails use inline SVG `placeholder()` generator
- [x] `AssetAnalyticsBoard`: deterministic seeded data and real KPI calculations
- [x] `ActivityFeed`: converted from hardcoded items to prop-driven real-data generation

### 4.0.1–4.0.20 Portal Feature Expansion ✅ DONE

Completed:
- [x] Super Admin system health
- [x] Portal settings UX
- [x] Workflow pipeline
- [x] Notification center
- [x] Audit log
- [x] Technician assignment modal
- [x] Enhanced ProjectTable
- [x] QA review panel
- [x] Customer asset review
- [x] Revenue dashboard
- [x] Data-driven billing
- [x] Technician performance metrics
- [x] Scheduling calendar
- [x] Customer analytics dashboard
- [x] Download center
- [x] Client health metrics
- [x] Technician upload interface
- [x] Real-time project progress
- [x] Multi-market management
- [x] Automated reporting

### 4.1 Employee Portal [OPERATIONS] ✅ COMPLETE

- [x] Project status dashboard
- [x] Technician assignment interface
- [x] Quality control review queue
- [x] Technician performance metrics
- [x] Scheduling/dispatch calendar
- [x] Technician upload interface
- **Why**: internal efficiency improves turnaround time

### 4.2 Customer Portal [CLIENT EXPERIENCE] ✅ COMPLETE

- [x] Notification center
- [x] Asset review workflow
- [x] Billing/invoice history
- [x] Analytics dashboard
- [x] Download center
- [x] Real-time project progress
- **Why**: self-serve client workflows reduce support load

### 4.3 Admin/Super Admin [MANAGEMENT] ✅ COMPLETE

- [x] Audit log viewer
- [x] Revenue dashboard
- [x] Client health metrics
- [x] Multi-market management
- [x] Automated reporting
- **Why**: supports scaling and decision-making

---

## PHASE 5: 3D Editor & Templates (Weeks 12–18)

### 5.0.1 Daily Specials Template ✅ DONE

- [x] `src/pages/templates/DailySpecials.tsx`
- [x] Route: `/project/:id/specials`
- [x] Day selector, featured item, countdown, specials grid, 3D viewer modal, archive section, CTA

### 5.0.2 Product Showcase Template ✅ DONE

- [x] `src/pages/templates/ProductShowcase.tsx`
- [x] Route: `/project/:id/showcase`
- [x] Product gallery, 3D viewer, color variants, specs, share/embed, navigation

### 5.0.3 Embed Generator ✅ DONE

- [x] `src/components/portal/EmbedGenerator.tsx`
- [x] Asset selector, embed options, live preview, 3 code output modes, copy feedback, platform instructions, analytics mock

### 5.0.4 Branded QR Code Manager ✅ DONE

- [x] `src/components/portal/BrandedQRCode.tsx`
- [x] Asset selector, QR customization, destination management, analytics, batch generation, print templates

### 5.0.5 Product Catalog Grid Template ✅ DONE

- [x] `src/pages/templates/CatalogGrid.tsx`
- [x] Route: `/project/:id/catalog`
- [x] Filterable grid, ratings, pricing, stock, quick-view modal, comparison drawer, cart summary, responsive layout

### 5.0.6 Museum Artifact Viewer Template ✅ DONE

- [x] `src/pages/templates/ArtifactViewer.tsx`
- [x] Route: `/project/:id/artifacts`
- [x] Timeline navigation, collection tabs, 3D viewer, curator notes, metadata, responsive detail panel

### 5.0.7 Portfolio Gallery Template ✅ DONE

- [x] `src/pages/templates/PortfolioGallery.tsx`
- [x] Route: `/project/:id/portfolio`
- [x] Masonry gallery, category filtering, project stats, lightbox viewer, testimonial section, featured item, CTA

### 5.1 Menu Template Expansion [PRODUCT]

- [x] Multi-category menu template
- [x] Daily specials / featured items template
- [ ] Multi-language menu — deferred to Phase 6
- [x] Dietary filter template
- **Why**: more templates improve value for restaurant clients

### 5.2 New Vertical Templates [EXPANSION] ✅ COMPLETE

- [x] Retail product showcase
- [x] Product catalog grid
- [x] Museum artifact viewer
- [x] Portfolio/gallery template
- **Why**: supports expansion into new verticals

### 5.3 WebGPU Viewer Upgrade [PERFORMANCE]

- [ ] Research Three.js WebGPU renderer vs custom solution
- [ ] Build progressive enhancement: WebGPU primary → WebGL fallback
- [ ] Implement 3DGS rendering in browser
- [ ] Target: major performance improvement over current WebGL
- **Why**: promising future path, but not current website priority

### 5.4 Embeddable Widget System [DISTRIBUTION]

- [x] iframe embed code generator
- [x] Web component / `model-viewer` snippet generator
- [ ] White-label option — needs backend for custom domains
- [x] Embed analytics mock
- [ ] WordPress plugin + Shopify integration — needs separate package builds
- **Why**: embeds support distribution and retention

### 5.5 QR Code Improvements [FEATURES]

- [x] Branded QR codes
- [x] Dynamic QR codes
- [x] QR scan analytics dashboard
- [ ] NFC tag support — needs hardware integration
- **Why**: better QR experiences can improve engagement

---

## PHASE 6: Market Expansion (Months 4–12)

### 6.0.1 i18n Infrastructure ✅ DONE

- [x] Added `src/i18n.ts`
- [x] Added locale files: `en`, `de`, `es`, `ru`
- [x] Added `LanguageSwitcher`
- [x] Language detection order: querystring → localStorage → browser
- [x] Fallback: English

### 6.1 Internationalization (i18n) [FOUNDATION] ✅ FULLY COMPLETE

- [x] Integrated `react-i18next`
- [x] Extracted strings to locale files
- [x] Added language switcher in navigation
- [x] Wired translated content across public pages, legal pages, templates, and major product surfaces
- [x] Synced locale files
- [x] Added hreflang SEO support
- [x] Synced `<html lang>`
- [x] Added locale conversion script
- [x] Added locale path prefixes: `/de/`, `/es/`, `/ru/`
- [ ] RTL support deferred
- **Why**: required for multi-market expansion

### 6.2 Germany Launch [FIRST NEW MARKET]

- [x] German translations complete
- [ ] Local SEO
- [ ] German case studies / testimonials
- [ ] SEPA payment support
- [ ] First German technician/partner
- **Why**: strong willingness to pay and strong fit for premium positioning

### 6.3 Spain Launch [SECOND NEW MARKET]

- [ ] Spanish rollout completion and market-specific pages
- [ ] Tourism-oriented messaging
- [ ] Local SEO: Barcelona, Madrid
- [ ] Bizum payment integration
- **Why**: strong restaurant culture and tourism fit

### 6.4 Russia Preparation [1–2 YEAR HORIZON]

- [ ] Legal review
- [ ] Data localization / hosting strategy
- [ ] Local payment integration
- [ ] Full Russian localization
- [ ] Market research
- **Why**: potentially valuable, but high-complexity and not immediate

### 6.5 Retail / E-commerce Vertical [NEW REVENUE]

- [ ] Retail-specific landing page and pricing
- [ ] Product showcase templates
- [ ] Shopify / WooCommerce integration
- [ ] E-commerce case studies
- **Why**: adjacent revenue opportunity using the same core capabilities

---

## PHASE 7: Advanced Features (Months 8–18+)

### 7.1 AI Enhancements

- [ ] AI texture upscaling
- [ ] AI relighting
- [ ] AI auto-descriptions
- [ ] AI quality scoring
- **Why**: possible efficiency and quality gains later

### 7.2 POS Integration

- [ ] Square, Lightspeed, iiko integrations
- [ ] Auto-sync menu prices
- [ ] Order analytics: 3D view → order conversion tracking
- **Why**: strong long-term retention and upsell opportunity

### 7.3 Spatial Computing

- [ ] Apple Vision Pro spatial menu experience
- [ ] visionOS app
- [ ] WebXR support
- **Why**: future-looking brand and product opportunity

### 7.4 Social Media 3D Assets

- [ ] Instagram AR effect generator
- [ ] TikTok 3D product effects
- [ ] Social-media-ready deliverable option
- **Why**: distribution and client value expansion

---

## Success Metrics

Many metrics below are directional only and should not be treated as verified analytics until measured from real production data.

### Website (Phase 1–2)

| Metric | Current | Target |
|---|---:|---:|
| Monthly quote requests | ? | 2x in 3 months |
| Page conversion rate | ? | >5% |
| LCP | ? | <2.5s |
| Blog organic traffic | 0 | 500+ monthly in 6 months |

### Pipeline (Phase 3)

| Metric | Current | Target |
|---|---:|---:|
| Photo-to-model time | Manual | <10 minutes automated |
| Quality pass rate | ? | >95% auto-approved |
| Models per week capacity | ? | 10x current |

### Growth (Phase 4–7)

| Metric | Current | Target |
|---|---:|---:|
| Markets served | 3 (EE, GR, FR) | 6+ in 12 months |
| Revenue verticals | 1 (restaurants) | 3+ in 12 months |
| Monthly active client portals | ? | 50+ in 12 months |

---

## What I Questioned and Why

### Q: Should we use NeRF or Gaussian Splatting?

**A**: Gaussian Splatting is the stronger long-term bet for this product direction. NeRF is slower and less practical for real-time viewing. Hybrid approaches should still be monitored.

### Q: Should we build our own processing pipeline or use an API?

**A**: Start with an API. A custom pipeline is expensive and slower to validate. Revisit self-hosting only when volume and control needs justify it.

### Q: Should we target Germany or Spain first for EU expansion?

**A**: Germany first. Larger market and stronger premium pricing fit. Spain remains attractive, especially for tourism-focused positioning.

### Q: Should we add LiDAR capture?

**A**: Not now. Photogrammetry is the better fit for food and product capture. LiDAR is more relevant for spatial/room capture later.

### Q: Is Russia worth the complexity?

**A**: Potentially yes, but only as a later carefully managed initiative. Legal, payments, compliance, and infrastructure constraints make it a non-immediate priority.

### Q: Should we use `model-viewer` or switch to Three.js/R3F?

**A**: Keep `model-viewer` for standard experiences. Use Three.js/R3F only where advanced rendering requirements justify the added complexity.

### Q: Dark mode — keep or add light option?

**A**: Keep dark as the default for now. It aligns with the current premium tech positioning. Revisit with testing when enough traffic exists to validate alternatives.

---

## Working Interpretation

Use this plan as strategic guidance, not as permission to work on every phase by default.

For most current sessions, the practical default is:
1. improve the public website
2. reduce UX/UI friction
3. strengthen responsiveness, accessibility, SEO, and trust
4. preserve maintainability
5. avoid broad speculative rewrites