# CLAUDE.md

Primary objective for review tasks: improve the website’s clarity, trust, conversion flow, responsiveness, accessibility, performance, and maintainability without breaking existing behavior.

## Project

React 19 + Vite 6 + Tailwind CSS 3 SPA for a managed 3D capture service serving restaurants and enterprises.
Supabase backend, React Router v7 with lazy routes, deployed on Cloudflare Workers.

This is a production website. Improve it carefully. Prefer small safe changes with clear user benefit.

## Workspace — ALWAYS READ FIRST

All research, plans, and session notes live in `.claude/workspace/`.

Before starting any work, always read:
- `.claude/workspace/INDEX.md`

Use these files as the source of truth for current context:
- Master plan: `.claude/workspace/plans/MASTER-PLAN.md`
- Session history: `.claude/workspace/notes/SESSION-LOG.md`
- Decisions & reasoning: `.claude/workspace/notes/DECISIONS.md`
- Warnings & pitfalls: `.claude/workspace/notes/WARNINGS-AND-PITFALLS.md`
- Research: `.claude/workspace/research/`
- Changelog: `.claude/workspace/changelog/CHANGELOG.md`
- Open questions: `.claude/workspace/notes/QUESTIONS.md`

Update relevant workspace files whenever plans change, work is completed, or important new findings appear.

## Required Working Method

For any non-trivial task, always follow this order:

1. Read `.claude/workspace/INDEX.md`
2. Read any directly relevant workspace files
3. Map the relevant architecture before changing code
4. Identify constraints, risks, and likely impacted areas
5. Create a short audit or execution plan
6. Make small, focused changes
7. Re-check affected areas after each batch
8. Update workspace notes/changelog if the task changes project state

Do not jump straight into broad rewrites.
Do not assume full understanding until the relevant files and routes were inspected.

## Required Audit Workflow

When asked to improve, review, or audit the website, do not jump straight into edits.

Always follow this order:
1. Read `.claude/workspace/INDEX.md`
2. Map the relevant architecture for the task
3. Create an audit ledger before making changes
4. Inspect the site in batches, not all at once
5. Rank issues by severity and user impact
6. Fix only the highest-impact issues first
7. Re-check affected pages/components after each batch
8. Update workspace notes and changelog when work is completed

Never claim full coverage unless all major routes, shared components, forms, and key flows were inspected.

Always separate:
- confirmed issues
- likely issues
- unknowns not yet verified

If runtime inspection is not possible, say so clearly and base findings only on code review.

## Website Review Standards

For any full-site review, inspect these areas:

- functionality and edge cases
- UI consistency
- UX friction and conversion clarity
- mobile responsiveness
- accessibility
- loading, empty, and error states
- performance risks
- SEO basics
- copy clarity and CTA strength
- maintainability, duplication, and dead code

For every issue found, include:
- severity
- page or component
- file path
- user impact
- root cause
- exact fix
- confidence level

## Coverage Rules

A website audit is not complete until these are reviewed when relevant:

- all public routes
- header, footer, nav, and shared layout
- all shared UI primitives/components
- all forms and validation flows
- mobile views for important pages
- auth-related flows
- loading, empty, and error states
- SEO/meta handling
- key CTA paths leading to `/request`

If a section could not be reviewed, explicitly list it under unknowns or remaining coverage.

## Change Discipline

- Prefer small, reversible changes
- Do not mix unrelated fixes in one batch
- Preserve existing product intent unless clearly harmful or broken
- Do not rewrite large areas without first proving need
- After changes, run the smallest relevant validation first, then broader checks
- Explain why each change matters
- Avoid speculative refactors unless they clearly reduce risk or improve maintainability

## UI/UX Quality Bar

Prefer:
- clear visual hierarchy
- consistent spacing and rhythm
- strong CTA visibility
- obvious form feedback
- clean mobile layouts
- accessible contrast and focus states
- minimal friction in request/contact flows
- trustworthy enterprise presentation
- clear copy and realistic reassurance

Watch for:
- weak spacing rhythm
- unclear sections
- inconsistent button/link styles
- vague copy
- crowded layouts
- dead-end screens
- confusing navigation
- weak reassurance near CTAs
- unclear or low-trust conversion paths

## Build & Dev

Available commands:
- `npm run dev` — local Vite dev server (frontend only)
- `npm run build` — production build (Vite)
- `npm run check` — full CI pipeline (format → lint → typecheck → test:coverage → knip → audit)
- `npm run lint` — ESLint with `--max-warnings=0`
- `npm run typecheck` — `tsc --noEmit`
- `npm run knip` — dead code detection (config in `knip.json`)
- `npm run worker:dev` — local Cloudflare Worker (full stack on port 8787)
- `npm run worker:deploy` — deploy to Cloudflare production
- `npm run worker:typecheck` — typecheck Worker files (`tsconfig.worker.json`)

Rules:
- All checks must pass before merging
- Do not introduce new warnings
- Coverage thresholds enforced: 80% lines/functions/statements, 70% branches

## Key Architecture

### Source Layout (`src/`)

- `components/` — UI primitives and shared widgets
- `config/` — site-wide constants (`CTA_TEXT`, routes)
- `constants/` — enums and static data
- `contexts/` — React context providers (Theme, Toast, Auth)
- `hooks/` — custom hooks
- `pages/` — route-level page components and templates
- `services/` — data providers and API layer
- `types/` — shared TypeScript types
- `utils/` — helper functions
- `lib/` — third-party wrappers
- `locales/` — i18n translation files

### Key Dependencies

- TanStack React Query 5 for async state/caching
- i18n — translations in `src/locales/`, configured in `src/i18n.ts`
- `<model-viewer>` — Web Component for 3D previews (type declarations in `src/model-viewer.d.ts`)

### Patterns

- Dark/light mode controlled by ThemeContext; user preference saved to localStorage; toggle in header
- React 19 metadata hoisting: `<title>` and `<meta>` rendered from components hoist to `<head>`
- `import.meta.env.DEV` for dev-only conditional rendering
- All public CTAs route to `/request` (free quote form, not self-serve signup)
- DataProvider pattern: `src/services/dataProvider.ts` exposes `ProjectsProvider`, `AssetsProvider`, `MenusProvider` with lazy mock/real switching via `VITE_USE_MOCK_DATA`
- Menu persistence: JSONB-based `menu_configs` table (one config per project) with DTO mappers in `RestaurantMenu.tsx`; migration in `scripts/02-menu-configs.sql`
- Image loading: all `<img>` tags use `loading="lazy"` except above-the-fold hero/avatar images which may use `loading="eager"`

### Known Architectural Notes

- `useDraftRequest` hook was deleted; session storage draft persistence is not active
- Per-route error boundaries use `SafePage` wrapper in `App.tsx`
- Token refresh uses TTL-based `setTimeout`, not polling

## Product Rules

### CTA Conventions

All user-facing CTAs should say:
- "Get a Free Quote" or
- "Get a free quote"

Do not use:
- "Request Capture"
- "Get started"
- "Start a Request"

The `/request` page is a free quote form, so CTA copy must reflect that.
Add "No credit card required" reassurance near primary CTAs where appropriate.

### Messaging Rules

- Managed capture only; this is not self-serve capture
- Employees can create customer accounts; customers can view and modify only content that has been provided to them
- Use the canonical domain `managedcapture3d.com`
- SOC 2 claim must be "SOC 2 Compliant", not "Type II"
- Only 1 testimonial exists; use singular phrasing such as "What our client says" where needed

## Git Workflow

- Never push directly to `main`
- Branch → PR → merge
- `.claude/worktrees/` entries may appear as gitlinks in the index; ignore them and do not try to fix submodule errors related to these
- Repo: `github.com/Emilianostza/managed-capture-3d-platform`

## Deployment — Cloudflare Workers

Live URL: `https://3d-empyre.emilianostza.workers.dev`
Repo: `github.com/Emilianostza/managed-capture-3d-platform`

### Worker Architecture

- Entry: `worker/index.ts` — routes `/api/*` to handlers, delegates static to `env.ASSETS`
- Config: `wrangler.toml` — `[assets]` serves `dist/` with SPA fallback
- Shared modules: `worker/shared/` (cookies, csrf, roles, types)
- 7 API routes: auth-login, auth-session, auth-refresh, auth-logout, auth-signup, assets-signed-url, gemini-proxy
- Static headers: `public/_headers` (immutable cache for hashed assets, security headers)

### Deploy Commands

- `npm run worker:dev` — local Worker dev server (port 8787)
- `npm run worker:deploy` — deploy to Cloudflare production
- `npm run worker:build` — dry-run build
- `npm run worker:typecheck` — typecheck Worker files only

### Secrets (set via `wrangler secret put`)

- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

### Local Testing

Copy `.dev.vars.example` → `.dev.vars` and fill in real credentials.
Run `npm run build` then `npm run worker:dev`.

## Gotchas

- ESLint globals are manually listed in `eslint.config.js`; if using a new browser API (such as `getComputedStyle` or `CSS`), add it to globals or ESLint will flag `no-undef`
- `scripts/` are excluded from ESLint; they follow their own patterns
- `no-non-null-assertion` is disabled for test files; `!` is allowed in tests
- Unused vars/functions should be prefixed with `_` rather than deleted if reserved for future use
- In `src/`, only `console.warn` and `console.error` are allowed
- `knip` unused exports rule is off; only files/deps/duplicates are enforced
- 9 portal components are in knip ignore list and reserved for future portal features, including `OnboardingChecklist`
- `/#contact` anchor does not exist anywhere; never link to it
- Demo credentials in `Login.tsx` must stay wrapped in `import.meta.env.DEV`
- Email links in legal pages should use `mailto:` with underline-offset-2 styling

## Definition of Done

A task is not complete until, when relevant:

- affected code is updated cleanly
- affected routes/components are re-checked
- no existing behavior is accidentally broken
- CTA rules remain correct
- mobile behavior remains usable
- accessibility is not worsened
- relevant checks are run
- workspace notes/changelog are updated if project state materially changed

For audits, completion requires:
- issue list grouped by severity
- exact file/page/component references
- clear distinction between confirmed issues, likely issues, and unknowns
- remaining coverage gaps explicitly listed

## Output Expectations

When reviewing or improving the site, output should usually include:

- executive summary
- critical issues
- high/medium/low issues
- quick wins
- suggested refactors
- remaining unknowns
- validation performed
- next best improvements

## Status & Next Steps

Current status snapshot:
- 240 tests passing, 16 pre-existing failures (unrelated to auth)
- 0 type errors
- 0 lint issues
- status last noted: Mar 7, 2026

Current priorities:
1. ~~Migrate JWT from localStorage to HttpOnly cookies~~ — DONE (pending deployed verification)
2. Expand test coverage to 80%+
3. Set up CI/CD with GitHub Actions
4. Complete Supabase integration (replace mock providers)
5. Lighthouse audit for Core Web Vitals