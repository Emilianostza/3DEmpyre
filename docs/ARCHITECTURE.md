# System Architecture

## Overview

**Managed Capture 3D Platform** is a modern React SPA built with TypeScript and Vite that manages professional 3D photogrammetry services across multiple organizations and countries.

### Key Constraints

- **Scale**: 10,000 active projects × 500 photographer contractors
- **Operations**: Estonia, Greece, France (EU/GDPR compliance required)
- **Data Model**: Multi-tenant, organization-scoped
- **Roles**: Admin, Technician, Approver, SalesLead (employees); CustomerOwner, CustomerViewer (clients)

---

## Technology Stack

### Frontend

- **Framework**: React 19 + TypeScript 5.8
- **Build Tool**: Vite 6 (3.8s build time)
- **Styling**: Tailwind CSS 3.4 (compiled, not CDN)
- **Routing**: React Router 7 (hash-based)
- **State**: React Context (auth, theme, notifications)
- **3D Viewer**: @google/model-viewer 4.1 + Three.js 0.182
- **Icons**: Lucide React 0.563
- **UI Components**: Custom (Button, Card, Modal, Form, etc.)

### Testing & Quality

- **Unit Tests**: Vitest 4.0 (happy-dom environment)
- **Test Utilities**: @testing-library/react 16.3
- **Linting**: ESLint 9 (flat config)
- **Formatting**: Prettier 3.8
- **Pre-commit**: Husky 9 + lint-staged 16
- **CI/CD**: GitHub Actions (5 parallel jobs, ~90s total)

### Backend & Services (Planned)

- **Auth**: Supabase (JWT-based)
- **Database**: PostgreSQL (via Supabase)
- **Storage**: S3-compatible (Wasabi, Cloudflare R2, AWS S3)
- **Serverless**: Netlify Functions
- **Security**: RLS policies, RBAC at type level

### Deployment

- **Hosting**: Netlify (automatic deployments from main)
- **DNS**: Custom domain via Netlify
- **Build**: `npm run build` → 1.3MB gzipped
- **Environment**: Feature flags for mock vs real data

---

## Directory Structure

```
project-root/
├── .github/
│   ├── workflows/
│   │   └── ci.yml                    # GitHub Actions CI pipeline
│   └── templates/
│       ├── pull_request_template.md
│       └── example_diffs.md
├── .husky/                            # Git hooks
│   └── pre-commit                     # Lint + type check before commit
├── docs/
│   ├── ARCHITECTURE.md               # This file
│   ├── CI_CD_QUALITY_GATES.md        # CI/CD documentation
│   ├── PHASE_1_4_IMPLEMENTATION.md   # Features guide
│   ├── DEPLOYMENT_GUIDE.md           # Netlify setup
│   ├── OPERATIONS_RUNBOOK.md         # Operational procedures
│   └── archives/                      # Deprecated/reference files
├── netlify/
│   └── functions/                     # Serverless functions
│       └── gemini-proxy.ts            # Secure API proxy
├── public/                            # Static assets
├── scripts/                           # Build/deployment scripts
├── src/
│   ├── __tests__/                    # Unit tests
│   │   ├── setup.ts                  # Vitest environment setup
│   │   ├── AuthContext.test.tsx      # Authentication tests
│   │   └── ModelEditor.test.tsx      # 3D viewer tests
│   ├── components/
│   │   ├── Button.tsx                # Shared UI components
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Form.tsx
│   │   ├── Toast.tsx
│   │   ├── Layout.tsx                # Main layout wrapper
│   │   ├── ErrorBoundary.tsx         # Error handling
│   │   ├── ProtectedRoute.tsx        # Auth middleware
│   │   ├── ScrollToTop.tsx
│   │   ├── DarkModeToggle.tsx
│   │   ├── devtools/
│   │   │   └── CodeInspector.tsx     # (Dev-only, gated)
│   │   ├── editor/
│   │   │   ├── ModelEditor.tsx       # 3D model viewer & controls
│   │   │   ├── AssetUploader.tsx     # File upload
│   │   │   └── EmbeddedModelEditor.tsx
│   │   ├── portal/
│   │   │   ├── ProjectTable.tsx      # Project management
│   │   │   ├── AssetGrid.tsx         # Asset display
│   │   │   ├── ProjectProgress.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── AssetAnalyticsBoard.tsx
│   │   ├── analytics/
│   │   │   ├── Dashboard.tsx         # Analytics overview
│   │   │   ├── MetricCard.tsx
│   │   │   └── ChartRenderer.tsx
│   │   └── gallery/
│   │       └── Gallery.tsx            # Public showcase
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Authentication state
│   │   ├── ThemeContext.tsx          # Dark mode state
│   │   └── ToastContext.tsx          # Notifications
│   ├── hooks/
│   │   ├── useToast.ts               # Notification hook
│   │   └── useProjectStateMachine.ts # Workflow hooks
│   ├── pages/
│   │   ├── Home.tsx                  # Landing page
│   │   ├── Gallery.tsx               # 3D gallery
│   │   ├── Pricing.tsx               # Pricing page
│   │   ├── RequestForm.tsx           # Project request (wizard)
│   │   ├── Industry.tsx              # Industry-specific pages
│   │   ├── HowItWorks.tsx
│   │   ├── NotFound.tsx
│   │   ├── Login.tsx                 # Auth page
│   │   ├── Portal.tsx                # Dashboard (employee/customer)
│   │   ├── editor/
│   │   │   ├── ModelEditor.tsx       # 3D editor
│   │   │   └── SceneDashboard.tsx    # Scene management
│   │   └── templates/
│   │       └── RestaurantMenu.tsx    # Demo template
│   ├── services/
│   │   ├── api/
│   │   │   ├── auth.ts               # Authentication API
│   │   │   ├── projects.ts           # Projects API
│   │   │   ├── assets.ts             # Assets API
│   │   │   ├── requests.ts           # Request management
│   │   │   ├── payouts.ts            # Photographer payouts
│   │   │   ├── audit-logs.ts         # Audit logging
│   │   │   ├── qa.ts                 # Quality assurance
│   │   │   ├── config.ts             # API configuration
│   │   │   ├── client.ts             # HTTP client
│   │   │   ├── real/                 # Real backend services
│   │   │   │   ├── projects.ts
│   │   │   │   └── assets.ts
│   │   │   └── mock/                 # Mock data layer (dev)
│   │   │       ├── projects.ts       # Mock projects
│   │   │       └── assets.ts         # Mock assets
│   │   ├── dataProvider.ts           # Unified data access (routes to mock/real)
│   │   ├── mockData.ts               # Legacy mock data (deprecated)
│   │   ├── upload.ts                 # File upload handling
│   │   ├── upload/
│   │   │   └── signed-upload.ts      # S3 signed URLs
│   │   ├── analytics/
│   │   │   ├── dashboard.ts
│   │   │   └── events.ts
│   │   ├── auth/
│   │   │   ├── adapter.ts            # Auth adapter interface
│   │   │   └── supabase-adapter.ts   # Supabase auth
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase client
│   │   │   └── test-connection.ts
│   │   ├── workflow/
│   │   │   └── state-machine.ts      # Project state machine
│   │   ├── payouts/
│   │   │   └── calculator.ts         # Payout calculations
│   │   ├── qrcode.ts                 # QR code generation
│   │   ├── logging.ts                # Logging service
│   │   ├── errorMonitoring.ts        # Error tracking
│   │   ├── caching.ts                # Caching layer
│   │   ├── rateLimiting.ts           # Rate limiting
│   │   ├── tierEnforcement.ts        # Feature tier checking
│   │   ├── tiers.ts                  # Pricing tiers definition
│   │   └── stateMachine.ts           # Generic state machines
│   ├── types/
│   │   ├── auth.ts                   # Authentication types (User, Role, etc.)
│   │   ├── project.ts                # Project domain types
│   │   ├── asset.ts                  # Asset domain types
│   │   └── ...
│   ├── types.ts                      # Global type definitions
│   ├── constants.tsx                 # Constants and configurations
│   ├── App.tsx                       # Root component
│   ├── index.tsx                     # Entry point
│   ├── index.css                     # Global styles + Tailwind
│   └── model-viewer.d.ts             # @google/model-viewer types
├── supabase/                         # Supabase migrations
│   └── migrations/                   # Database schema
├── .env.example                      # Environment variables template
├── .eslintrc.js                      # ESLint configuration
├── .prettierrc.json                  # Prettier configuration
├── .prettierignore                   # Prettier ignore patterns
├── eslint.config.js                  # ESLint flat config
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite build configuration
├── netlify.toml                      # Netlify configuration
├── package.json                      # NPM dependencies & scripts
├── README.md                         # Project overview
├── CLAUDE.md                         # Claude Code instructions
├── CONTRIBUTING.md                   # Contribution guidelines
└── index.html                        # HTML entry point
```

---

## Data Flow Architecture

### Authentication Flow

```
User Login
  ↓
AuthContext.tsx (login handler)
  ↓
authService.ts (mock or Supabase)
  ↓
JWT Token + User Profile
  ↓
localStorage (persistent)
  ↓
apiClient.setToken() (on all requests)
  ↓
Backend (Supabase) validates JWT
  ↓
RLS Policies filter user data
```

### Data Access Flow

```
Component needs data
  ↓
dataProvider.ts (unified interface)
  ↓
USE_REAL_API flag (feature flag)
  ├─ true → real API (src/services/api/real/)
  └─ false → mock data (src/services/api/mock/)
  ↓
Component receives data
  ↓
Render or cache with React Query (future)
```

### 3D Model Flow

```
User uploads file (AssetUploader)
  ↓
Signed S3 URL (upload/signed-upload.ts)
  ↓
Browser uploads directly to S3
  ↓
Backend processes (webhook)
  ↓
Asset marked as ready
  ↓
ModelEditor loads from S3 → model-viewer component
  ↓
User transforms/edits
  ↓
Save to database
```

---

## State Management

### Authentication (AuthContext)

```tsx
{
  user: User | null,
  token: string | null,
  loading: boolean,
  error: string | null,
  login(email, password): Promise<void>,
  logout(): Promise<void>,
  hasPermission(action, resource): boolean,
}
```

### Theme (ThemeContext)

```tsx
{
  isDark: boolean,
  toggle(): void,
}
```

### Notifications (ToastContext)

```tsx
{
  toasts: Toast[],
  success(message): void,
  error(message): void,
  warning(message): void,
  removeToast(id): void,
}
```

---

## Type System Strategy

### Role-Based Type Definitions

```typescript
type UserRole =
  | { type: 'admin'; orgId: string }
  | { type: 'technician'; orgId: string; assignedProjects: string[] }
  | { type: 'customer_owner'; orgId: string }
  | { type: 'customer_viewer'; orgId: string }
  | { type: 'sales_lead'; orgId: string };
```

### State Machine Types

```typescript
type ProjectStatus = 'pending' | 'approved' | 'processing' | 'qa' | 'delivered' | 'archived';

type ProjectStatusTransition = {
  from: ProjectStatus;
  to: ProjectStatus;
  requiredRole?: UserRole['type'];
  requiresApproval?: boolean;
};
```

### DTO Pattern

```typescript
// Domain (API)
interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  // ...
}

// DTO (Response)
interface ProjectDTO {
  id: string;
  name: string;
  status: string; // Serializable
  // ...
}
```

---

## API Strategy

### Unified Data Provider

```typescript
// Component code (doesn't care about mock vs real)
const projects = await ProjectsProvider.list();

// Behind the scenes (configurable)
// VITE_USE_MOCK_DATA=true → Mock API (dev)
// VITE_USE_MOCK_DATA=false → Real API (prod)
```

### Mock Data (Development)

- Fast feedback loop (no network)
- Realistic data structures
- Simulated delays (500-800ms)
- State mutations (add/update/delete)

### Real API (Production)

- Supabase REST API
- JWT authentication
- RLS policies (row-level security)
- Proper pagination & filtering

---

## Security Model

### Authentication

1. User logs in → JWT generated with role + org_id
2. JWT stored in localStorage
3. JWT sent on every API request (Authorization header)
4. Backend verifies signature (cryptographically secure)

### Authorization

1. Backend extracts role from JWT
2. RLS policies filter data by organization
3. Frontend can check permissions with `useAuth().hasPermission()`
4. Protected routes verify before rendering

### Secrets

- **Gemini API Key**: Server-side only (Netlify Functions)
- **Database Credentials**: Supabase project-specific
- **.env.local**: Never committed (in .gitignore)
- **Environment Variables**: Set via Netlify Settings

---

## Performance Optimizations

### Bundle Size

- Lazy-loaded routes (React.lazy)
- Code splitting (vendor chunks: react, router, icons, model-viewer)
- Tree-shaking (ESLint removes console.log in production)
- Current: **1.3MB gzipped** (target: <1.5MB)

### Rendering

- Memoization (memo, useMemo, useCallback)
- Dark mode toggle (no re-render, CSS class)
- Virtual scrolling (future: React Query + React Virtual)
- Responsive images (lazy loading)

### Caching

- localStorage (auth tokens, user preferences)
- Mock data caching (with simulated TTL)
- React Query (future: deduplication, stale-while-revalidate)

---

## Testing Strategy

### Unit Tests (Vitest)

- Component rendering
- Hook behavior
- Utility functions
- Mock data services

### Test Setup

- **Environment**: happy-dom (lightweight, fast)
- **Location**: `src/__tests__/`
- **Naming**: `*.test.tsx` or `src/__tests__/*`
- **Coverage**: ~50% target (critical paths)

### E2E Tests (Planned)

- Playwright for browser automation
- Critical user flows (login → upload → publish)
- Role-based access control verification

---

## Deployment Pipeline

### Local Development

```bash
npm install          # Install deps
npm run dev          # Start dev server (3000)
npm run lint:fix     # Fix linting issues
npm run format       # Auto-format code
```

### Pre-commit

```bash
git add .
git commit ...       # → Husky pre-commit hook
  ├─ lint-staged     # ESLint + Prettier on staged files
  └─ TypeScript      # Type check (tsc --noEmit)
```

### CI/CD (GitHub Actions)

```
Push to main
  ├─ Quality gate    # Lint + types + format (10-15s)
  ├─ Tests           # Vitest + coverage (20-30s)
  ├─ Build           # Vite production (10-15s)
  ├─ Security        # npm audit (5-10s)
  └─ Dependencies    # Lock file check (5s)
→ All pass? Deploy to Netlify
```

### Production Deployment

```bash
npm run build        # Build dist/
# Netlify auto-deploys on push to main
# CDN caches assets (1 year expiry)
# HTML refreshed on every deploy (no-cache)
```

---

## Scaling Considerations

### For 10,000 Projects × 500 Photographers

#### Database

- Indexes on: orgId, projectId, status, createdAt
- Partition by organization
- Archive old projects (>1 year)

#### Frontend Caching

- Cursor-based pagination (not offset/limit)
- React Query with stale-while-revalidate
- Lazy-load heavy components (3D viewer)

#### API Rate Limiting

- Per-organization quotas
- Per-user throttling (burst capacity)
- Exponential backoff for retries

#### Analytics

- Event tracking (upload, publish, view)
- Aggregated metrics (projects, assets, payouts)
- Geographic distribution (Estonia, Greece, France)

---

## File Organization Philosophy

### Root Directory

- **Config files only**: vite.config.ts, tsconfig.json, etc.
- **Documentation only**: README.md, CONTRIBUTING.md, etc.
- **Clean root**: No source code or build artifacts

### `/src` Directory

- **All source code**: components, pages, services, types
- **Organized by domain**: auth, projects, assets, analytics
- **Test files co-located**: `Component.tsx` + `Component.test.tsx`

### `/docs` Directory

- **Architecture**: ARCHITECTURE.md (this file)
- **Guides**: CI_CD_QUALITY_GATES.md, DEPLOYMENT_GUIDE.md
- **Archives**: Old mockups, deprecated files

### `.github` Directory

- **CI/CD**: workflows/ci.yml
- **PR Templates**: templates/pull_request_template.md
- **Contributing**: CONTRIBUTING.md

---

## Decision Records (ADRs)

### ADR-1: Why React + TypeScript?

- Type safety prevents runtime errors
- Large ecosystem (3D viewer, forms, analytics)
- Team familiarity

### ADR-2: Why Vite + Tailwind?

- Vite: Fast dev server, optimized builds
- Tailwind: Utility-first, compile-time optimization

### ADR-3: Why Mock Data Layer?

- Decouples frontend from backend
- Fast development without API
- Easy to test both mock and real scenarios

### ADR-4: Why Organization-First Scoping?

- GDPR compliance (data isolation)
- Multi-tenant readiness
- Type-safe at database level

---

## Resource Links

- [Vite Documentation](https://vitejs.dev)
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Vitest](https://vitest.dev)
- [Google Model Viewer](https://modelviewer.dev)
- [Supabase](https://supabase.io)

---

**Last Updated**: February 12, 2026
**Version**: 1.0
**Audience**: Developers, Architects, DevOps
