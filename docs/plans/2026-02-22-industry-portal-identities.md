# Industry-Specific Customer Portal Identities — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make each customer's portal dashboard visually and functionally unique to their industry, driven by configuration objects.

**Architecture:** A single `CustomerDashboard` component reads an `IndustryPortalConfig` object (resolved from the organization's industry) to control theming (accent colors, gradients, icons), KPI cards, widget order, and all customer-facing labels. The config is stored in a new `src/constants/portal-configs.ts` file. Industry is added to the `Organization` type and exposed via `AuthContext`. Mock auth users get industry-specific demo accounts. Login page gets an industry selector for customer demo roles.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, react-i18next, lucide-react icons

---

### Task 1: Add `industry` to Organization type and AuthContext

**Files:**

- Modify: `src/types/auth.ts` (line ~55, Organization interface)
- Modify: `src/contexts/AuthContext.tsx` (line ~230, organization creation in login)
- Modify: `src/types.ts` (import reference)

**What to do:**

Add an optional `industry` field to the `Organization` interface in `src/types/auth.ts`:

```typescript
// In the Organization interface, add after metadata:
import { Industry } from '@/types';

export interface Organization {
  // ... existing fields ...
  industry?: Industry; // Customer's industry vertical
}
```

Add the `Industry` import at the top of `src/types/auth.ts`:

```typescript
import { Industry } from '@/types';
```

Then in `src/contexts/AuthContext.tsx`, update the organization object created during login (around line 230). Currently it creates a minimal org object — add the `industry` field. We'll derive it from the user's email for mock data:

```typescript
// In the login function, where setOrganization is called (~line 230):
setOrganization({
  id: userDomain.orgId,
  name: '',
  slug: '',
  countryCode: 'ee' as const,
  region: 'eu' as const,
  gdprConsent: false,
  dataRetentionDays: 365,
  industry: (userDomain as any).industry, // Will be set by mock users
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

**Verify:** Run `npx tsc --noEmit` — should compile with no errors.

---

### Task 2: Add industry-specific mock users to auth service

**Files:**

- Modify: `src/services/api/auth.ts` (MOCK_USERS_MAP, ~line 56)
- Modify: `src/pages/Login.tsx` (mockUsers array, ~line 41)

**What to do:**

In `src/services/api/auth.ts`, add 3 new mock customer users to `MOCK_USERS_MAP` (after the existing `user-client-bistro` entry at line 105):

```typescript
'user-client-hotel': {
  id: 'user-client-hotel',
  email: 'client@grandhotel.com',
  name: 'Grand Hotel Manager',
  role: { type: 'customer_owner', orgId: 'cust-hotel', customerId: 'cust-hotel' },
  orgId: 'cust-hotel',
  customerId: 'cust-hotel',
  industry: 'Hospitality',
  status: 'active' as const,
  mfaEnabled: false,
  failedLoginAttempts: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
'user-client-retail': {
  id: 'user-client-retail',
  email: 'client@fashionstore.com',
  name: 'Fashion Store Owner',
  role: { type: 'customer_owner', orgId: 'cust-retail', customerId: 'cust-retail' },
  orgId: 'cust-retail',
  customerId: 'cust-retail',
  industry: 'Retail',
  status: 'active' as const,
  mfaEnabled: false,
  failedLoginAttempts: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
'user-client-realestate': {
  id: 'user-client-realestate',
  email: 'client@luxuryproperties.com',
  name: 'Luxury Properties Agent',
  role: { type: 'customer_owner', orgId: 'cust-realestate', customerId: 'cust-realestate' },
  orgId: 'cust-realestate',
  customerId: 'cust-realestate',
  industry: 'RealEstate',
  status: 'active' as const,
  mfaEnabled: false,
  failedLoginAttempts: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
```

Also add `industry: 'Restaurant'` to the existing `user-client-bistro` entry (line ~93).

Then in `src/pages/Login.tsx`, update the `mockUsers` array (line 41-46) to include the new demo customers:

```typescript
const mockUsers = [
  { email: 'admin@company.com', role: 'employee', name: 'Admin' },
  { email: 'approver@company.com', role: 'employee', name: 'Approver' },
  { email: 'tech@company.com', role: 'employee', name: 'Technician' },
  { email: 'client@bistro.com', role: 'customer', name: '🍽️ Restaurant Owner' },
  { email: 'client@grandhotel.com', role: 'customer', name: '🏨 Hotel Manager' },
  { email: 'client@fashionstore.com', role: 'customer', name: '🛍️ Retail Store Owner' },
  { email: 'client@luxuryproperties.com', role: 'customer', name: '🏠 Real Estate Agent' },
];
```

**Important:** Update the `mockLogin` function to pass the `industry` field through to the login response. In the `mockLogin` function, after finding the user, also set the organization's industry in the context. This happens via the `AuthContext.tsx` login function which reads `(userDomain as any).industry`.

In `AuthContext.tsx`, update the login function where `setOrganization` is called to read industry from the login response. The mock user's `industry` field gets serialized through the DTO, so we need to also pass it through `userToDTO`/`userFromDTO`. The simplest approach: store industry on the organization mock data and read it in the context.

Actually, the cleanest approach: In `AuthContext.tsx`'s `login` function, after `const userDomain = userFromDTO(response.user)`, derive the industry from a new field on the login response. For mock users, we can add the industry to the mock user data and pass it through.

Update the `mockLogin` function in `auth.ts` to include industry in the response:

```typescript
async function mockLogin(request: LoginRequest): Promise<LoginResponse> {
  await delay(800);

  const user = Object.values(MOCK_USERS_MAP).find(
    (u) => u.email.toLowerCase() === request.email.toLowerCase()
  );

  if (!user) {
    throw {
      status: 401,
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    };
  }

  const token = `mock-token-${user.id}-${Date.now()}`;
  const refreshToken = `mock-refresh-${user.id}-${Date.now()}`;

  return {
    user: { ...userToDTO(user), industry: user.industry },
    token,
    refreshToken,
    expiresIn: 3600,
  };
}
```

And update `AuthContext.tsx` login to read it:

```typescript
// After const userDomain = userFromDTO(response.user);
const industry = (response.user as any).industry;

setOrganization({
  // ... existing fields ...
  industry: industry || undefined,
  // ...
});
```

**Verify:** Run `npx tsc --noEmit` and then log in as each new customer in browser to confirm it works.

---

### Task 3: Create IndustryPortalConfig type and config objects

**Files:**

- Modify: `src/types.ts` (add IndustryPortalConfig interface)
- Create: `src/constants/portal-configs.ts` (4 industry configs)

**What to do:**

First, add the `IndustryPortalConfig` interface to `src/types.ts` (after the existing `IndustryConfig` interface, ~line 37):

```typescript
import { LucideIcon } from 'lucide-react';

export interface IndustryPortalConfig {
  id: string;
  theme: {
    accent: string; // Tailwind color prefix: 'brand' | 'sky' | 'orange' | 'emerald'
    accentBg: string; // Light bg class: 'bg-brand-50' | 'bg-sky-50' | etc.
    accentBgDark: string; // Dark bg class: 'dark:bg-brand-900/20' | etc.
    accentText: string; // Text class: 'text-brand-600' | etc.
    accentTextDark: string; // Dark text class: 'dark:text-brand-400' | etc.
    gradient: string; // Gradient CSS class
    iconComponent: LucideIcon;
  };
  labels: {
    welcome: string; // i18n key for welcome title
    assets: string; // i18n key — "Menu Items" | "Room Scans" | "Products" | "Properties"
    assetSingular: string; // i18n key — "Dish" | "Room" | "Product" | "Property"
    projects: string; // i18n key — "Menus" | "Tours" | "Products" | "Listings"
    newRequest: string; // i18n key for CTA button
  };
  kpis: Array<{
    label: string; // i18n key
    iconComponent: LucideIcon;
    colorBg: string; // bg class for icon container
    colorText: string; // text class for number
    valueKey: 'activeProjects' | 'inReview' | 'published';
  }>;
  widgets: Array<
    | 'assetReview'
    | 'analytics'
    | 'projectProgress'
    | 'assetGrid'
    | 'downloadCenter'
    | 'embedGenerator'
    | 'qrCodeManager'
  >;
}
```

Then create `src/constants/portal-configs.ts` with the 4 configs:

```typescript
import { IndustryPortalConfig } from '@/types';
import {
  ChefHat,
  Building2,
  ShoppingBag,
  Home,
  BookOpen,
  Clock,
  Layers,
  Hotel,
  Package,
  Map,
} from 'lucide-react';

export const PORTAL_CONFIGS: Record<string, IndustryPortalConfig> = {
  Restaurant: {
    id: 'Restaurant',
    theme: {
      accent: 'brand',
      accentBg: 'bg-brand-50',
      accentBgDark: 'dark:bg-brand-900/20',
      accentText: 'text-brand-600',
      accentTextDark: 'dark:text-brand-400',
      gradient: 'from-brand-600 to-violet-600',
      iconComponent: ChefHat,
    },
    labels: {
      welcome: 'portal.industry.restaurant.welcome',
      assets: 'portal.industry.restaurant.assets',
      assetSingular: 'portal.industry.restaurant.assetSingular',
      projects: 'portal.industry.restaurant.projects',
      newRequest: 'portal.industry.restaurant.newRequest',
    },
    kpis: [
      {
        label: 'portal.industry.restaurant.kpi.active',
        iconComponent: BookOpen,
        colorBg: 'bg-brand-50 dark:bg-brand-900/20',
        colorText: 'text-brand-600 dark:text-brand-400',
        valueKey: 'activeProjects',
      },
      {
        label: 'portal.industry.restaurant.kpi.inReview',
        iconComponent: Clock,
        colorBg: 'bg-orange-50 dark:bg-orange-900/20',
        colorText: 'text-orange-600 dark:text-orange-400',
        valueKey: 'inReview',
      },
      {
        label: 'portal.industry.restaurant.kpi.live',
        iconComponent: Layers,
        colorBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        colorText: 'text-emerald-600 dark:text-emerald-400',
        valueKey: 'published',
      },
    ],
    widgets: [
      'assetReview',
      'analytics',
      'projectProgress',
      'assetGrid',
      'downloadCenter',
      'embedGenerator',
      'qrCodeManager',
    ],
  },

  Hospitality: {
    id: 'Hospitality',
    theme: {
      accent: 'sky',
      accentBg: 'bg-sky-50',
      accentBgDark: 'dark:bg-sky-900/20',
      accentText: 'text-sky-600',
      accentTextDark: 'dark:text-sky-400',
      gradient: 'from-sky-600 to-indigo-600',
      iconComponent: Building2,
    },
    labels: {
      welcome: 'portal.industry.hospitality.welcome',
      assets: 'portal.industry.hospitality.assets',
      assetSingular: 'portal.industry.hospitality.assetSingular',
      projects: 'portal.industry.hospitality.projects',
      newRequest: 'portal.industry.hospitality.newRequest',
    },
    kpis: [
      {
        label: 'portal.industry.hospitality.kpi.active',
        iconComponent: Hotel,
        colorBg: 'bg-sky-50 dark:bg-sky-900/20',
        colorText: 'text-sky-600 dark:text-sky-400',
        valueKey: 'activeProjects',
      },
      {
        label: 'portal.industry.hospitality.kpi.inReview',
        iconComponent: Clock,
        colorBg: 'bg-orange-50 dark:bg-orange-900/20',
        colorText: 'text-orange-600 dark:text-orange-400',
        valueKey: 'inReview',
      },
      {
        label: 'portal.industry.hospitality.kpi.live',
        iconComponent: Layers,
        colorBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        colorText: 'text-emerald-600 dark:text-emerald-400',
        valueKey: 'published',
      },
    ],
    widgets: [
      'assetReview',
      'assetGrid',
      'qrCodeManager',
      'downloadCenter',
      'analytics',
      'projectProgress',
    ],
  },

  Retail: {
    id: 'Retail',
    theme: {
      accent: 'orange',
      accentBg: 'bg-orange-50',
      accentBgDark: 'dark:bg-orange-900/20',
      accentText: 'text-orange-600',
      accentTextDark: 'dark:text-orange-400',
      gradient: 'from-orange-600 to-amber-600',
      iconComponent: ShoppingBag,
    },
    labels: {
      welcome: 'portal.industry.retail.welcome',
      assets: 'portal.industry.retail.assets',
      assetSingular: 'portal.industry.retail.assetSingular',
      projects: 'portal.industry.retail.projects',
      newRequest: 'portal.industry.retail.newRequest',
    },
    kpis: [
      {
        label: 'portal.industry.retail.kpi.active',
        iconComponent: Package,
        colorBg: 'bg-orange-50 dark:bg-orange-900/20',
        colorText: 'text-orange-600 dark:text-orange-400',
        valueKey: 'activeProjects',
      },
      {
        label: 'portal.industry.retail.kpi.inReview',
        iconComponent: Clock,
        colorBg: 'bg-blue-50 dark:bg-blue-900/20',
        colorText: 'text-blue-600 dark:text-blue-400',
        valueKey: 'inReview',
      },
      {
        label: 'portal.industry.retail.kpi.live',
        iconComponent: Layers,
        colorBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        colorText: 'text-emerald-600 dark:text-emerald-400',
        valueKey: 'published',
      },
    ],
    widgets: [
      'assetReview',
      'assetGrid',
      'embedGenerator',
      'downloadCenter',
      'analytics',
      'projectProgress',
    ],
  },

  RealEstate: {
    id: 'RealEstate',
    theme: {
      accent: 'emerald',
      accentBg: 'bg-emerald-50',
      accentBgDark: 'dark:bg-emerald-900/20',
      accentText: 'text-emerald-600',
      accentTextDark: 'dark:text-emerald-400',
      gradient: 'from-emerald-600 to-teal-600',
      iconComponent: Home,
    },
    labels: {
      welcome: 'portal.industry.realEstate.welcome',
      assets: 'portal.industry.realEstate.assets',
      assetSingular: 'portal.industry.realEstate.assetSingular',
      projects: 'portal.industry.realEstate.projects',
      newRequest: 'portal.industry.realEstate.newRequest',
    },
    kpis: [
      {
        label: 'portal.industry.realEstate.kpi.active',
        iconComponent: Map,
        colorBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        colorText: 'text-emerald-600 dark:text-emerald-400',
        valueKey: 'activeProjects',
      },
      {
        label: 'portal.industry.realEstate.kpi.inReview',
        iconComponent: Clock,
        colorBg: 'bg-orange-50 dark:bg-orange-900/20',
        colorText: 'text-orange-600 dark:text-orange-400',
        valueKey: 'inReview',
      },
      {
        label: 'portal.industry.realEstate.kpi.live',
        iconComponent: Layers,
        colorBg: 'bg-teal-50 dark:bg-teal-900/20',
        colorText: 'text-teal-600 dark:text-teal-400',
        valueKey: 'published',
      },
    ],
    widgets: [
      'assetReview',
      'assetGrid',
      'qrCodeManager',
      'downloadCenter',
      'analytics',
      'projectProgress',
    ],
  },
};

/** Get config for an industry, defaulting to Restaurant */
export function getPortalConfig(industry?: string): IndustryPortalConfig {
  if (industry && PORTAL_CONFIGS[industry]) {
    return PORTAL_CONFIGS[industry];
  }
  return PORTAL_CONFIGS.Restaurant;
}
```

**Verify:** Run `npx tsc --noEmit` — should compile cleanly.

---

### Task 4: Create IndustryKPIStrip component

**Files:**

- Create: `src/components/portal/IndustryKPIStrip.tsx`

**What to do:**

Create a config-driven KPI strip that replaces the hardcoded KPI cards in Portal.tsx. This component reads the industry config and renders the appropriate KPIs with the right colors and icons.

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndustryPortalConfig } from '@/types';

interface KPIValues {
  activeProjects: number;
  inReview: number;
  published: number;
}

interface Props {
  config: IndustryPortalConfig;
  values: KPIValues;
}

export const IndustryKPIStrip: React.FC<Props> = ({ config, values }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3">
      {config.kpis.map((kpi, index) => {
        const Icon = kpi.iconComponent;
        const value = values[kpi.valueKey];

        return (
          <div
            key={index}
            className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow min-w-[140px]"
          >
            <div className={`w-9 h-9 rounded-lg ${kpi.colorBg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${kpi.colorText}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${kpi.colorText} leading-none`}>
                {value}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
                {t(kpi.label)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

**Verify:** Run `npx tsc --noEmit`.

---

### Task 5: Create IndustryWidgetRenderer component

**Files:**

- Create: `src/components/portal/IndustryWidgetRenderer.tsx`

**What to do:**

Create a component that maps widget ID strings to actual portal components and renders them in the config-defined order.

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Asset, Project, IndustryPortalConfig } from '@/types';
import { CustomerAssetReview } from './CustomerAssetReview';
import { CustomerAnalytics } from './CustomerAnalytics';
import { ProjectProgress } from './ProjectProgress';
import { AssetGrid } from './AssetGrid';
import { DownloadCenter } from './DownloadCenter';
import { EmbedGenerator } from './EmbedGenerator';
import { BrandedQRCode } from './BrandedQRCode';

interface Props {
  config: IndustryPortalConfig;
  assets: Asset[];
  projects: Project[];
  onApproveAsset: (assetId: string) => Promise<void>;
  onRequestRevision: (assetId: string, feedback: string) => Promise<void>;
}

export const IndustryWidgetRenderer: React.FC<Props> = ({
  config,
  assets,
  projects,
  onApproveAsset,
  onRequestRevision,
}) => {
  const { t } = useTranslation();

  const widgetMap: Record<string, React.ReactNode> = {
    assetReview: (
      <CustomerAssetReview
        key="assetReview"
        assets={assets}
        projects={projects}
        onApprove={onApproveAsset}
        onRequestRevision={onRequestRevision}
      />
    ),
    analytics: <CustomerAnalytics key="analytics" assets={assets} />,
    projectProgress: <ProjectProgress key="projectProgress" projects={projects} assets={assets} />,
    assetGrid: (
      <div key="assetGrid">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
          {t(config.labels.assets)}
        </h2>
        <AssetGrid assets={assets} role="customer" />
      </div>
    ),
    downloadCenter: <DownloadCenter key="downloadCenter" assets={assets} projects={projects} />,
    embedGenerator: <EmbedGenerator key="embedGenerator" assets={assets} projects={projects} />,
    qrCodeManager: <BrandedQRCode key="qrCodeManager" assets={assets} projects={projects} />,
  };

  return (
    <>
      {config.widgets.map((widgetId) => (
        <React.Fragment key={widgetId}>
          {widgetMap[widgetId] || null}
        </React.Fragment>
      ))}
    </>
  );
};
```

**Verify:** Run `npx tsc --noEmit`.

---

### Task 6: Create IndustryHeader component

**Files:**

- Create: `src/components/portal/IndustryHeader.tsx`

**What to do:**

Create an industry-themed header bar that shows above the customer dashboard with the industry icon, gradient accent, and welcome message.

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndustryPortalConfig } from '@/types';

interface Props {
  config: IndustryPortalConfig;
  userName: string;
}

export const IndustryHeader: React.FC<Props> = ({ config, userName }) => {
  const { t } = useTranslation();
  const Icon = config.theme.iconComponent;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6">
      {/* Gradient accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${config.theme.gradient}`} />

      <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-zinc-900">
        {/* Industry icon */}
        <div className={`w-12 h-12 rounded-xl ${config.theme.accentBg} ${config.theme.accentBgDark} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${config.theme.accentText} ${config.theme.accentTextDark}`} />
        </div>

        {/* Welcome text */}
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
            {t(config.labels.welcome)}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {userName}
          </p>
        </div>
      </div>
    </div>
  );
};
```

**Verify:** Run `npx tsc --noEmit`.

---

### Task 7: Update Portal.tsx customer dashboard to use config-driven components

**Files:**

- Modify: `src/pages/Portal.tsx`

**What to do:**

This is the main integration task. In Portal.tsx:

1. Import the new components and config:

```typescript
import { IndustryKPIStrip } from '@/components/portal/IndustryKPIStrip';
import { IndustryWidgetRenderer } from '@/components/portal/IndustryWidgetRenderer';
import { IndustryHeader } from '@/components/portal/IndustryHeader';
import { getPortalConfig } from '@/constants/portal-configs';
import { useAuth } from '@/contexts/AuthContext';
```

2. Inside the Portal component, resolve the config from the org's industry:

```typescript
const { organization } = useAuth();
const portalConfig = getPortalConfig(organization?.industry);
```

3. Compute KPI values (these already exist as `activeProjectCount`, `assetsInReviewCount`, `publishedAssetCount`):

```typescript
const kpiValues = {
  activeProjects: activeProjectCount,
  inReview: assetsInReviewCount,
  published: publishedAssetCount,
};
```

4. Replace the customer dashboard section (lines ~508-561 in Portal.tsx). Currently it's:

```tsx
{role === 'customer' ? (
  <>
    <CustomerAssetReview ... />
    <CustomerAnalytics ... />
    <ProjectProgress ... />
    <div>
      <h2>...</h2>
      <AssetGrid ... />
    </div>
    <DownloadCenter ... />
    <EmbedGenerator ... />
    <BrandedQRCode ... />
  </>
) : (
```

Replace the customer branch with:

```tsx
{role === 'customer' ? (
  <>
    <IndustryHeader config={portalConfig} userName={t('portal.bistroOwner')} />
    <IndustryKPIStrip config={portalConfig} values={kpiValues} />
    <IndustryWidgetRenderer
      config={portalConfig}
      assets={assets}
      projects={projects}
      onApproveAsset={async (assetId) => {
        try {
          await AssetsProvider.update(assetId, { status: 'Published' });
          const assetData = await AssetsProvider.list();
          setAssets(assetData as Asset[]);
          success(t('portal.toast.assetApproved'));
        } catch (err) {
          const msg = err instanceof Error ? err.message : t('portal.toast.failedApproveAsset');
          if (import.meta.env.DEV) console.error('Failed to approve asset', err);
          toastError(msg);
        }
      }}
      onRequestRevision={async (assetId, feedback) => {
        try {
          await AssetsProvider.update(assetId, { status: 'Processing' });
          const assetData = await AssetsProvider.list();
          setAssets(assetData as Asset[]);
          success(t('portal.toast.revisionRequested'));
        } catch (err) {
          const msg = err instanceof Error ? err.message : t('portal.toast.failedRevision');
          if (import.meta.env.DEV) console.error('Failed to request revision', err);
          toastError(msg);
        }
      }}
    />
  </>
) : (
```

5. Update the header's active tab color to use the industry accent. Find the nav tab button styling (~line 421) and update the active state to use the config's accent colors:

```tsx
className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 focus:outline-none ${
  activeTab === item.id
    ? role === 'customer'
      ? `${portalConfig.theme.accentBg} ${portalConfig.theme.accentBgDark} ${portalConfig.theme.accentText} ${portalConfig.theme.accentTextDark}`
      : 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
}`}
```

6. Update the header brand section to show the industry icon and name instead of hardcoded "Bistro Owner" when in customer mode. Replace lines ~401-411:

```tsx
{
  role === 'customer' ? (
    <div className="hidden sm:flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-md ${portalConfig.theme.accentBg} ${portalConfig.theme.accentBgDark} flex items-center justify-center`}
      >
        {React.createElement(portalConfig.theme.iconComponent, {
          className: `w-3.5 h-3.5 ${portalConfig.theme.accentText} ${portalConfig.theme.accentTextDark}`,
        })}
      </div>
      <div>
        <div className="font-bold text-zinc-900 dark:text-white text-sm leading-tight">
          {t(portalConfig.labels.welcome)}
        </div>
      </div>
    </div>
  ) : (
    <div className="hidden sm:block">
      <div className="font-bold text-zinc-900 dark:text-white text-base leading-tight">
        Managed<span className="text-brand-600 dark:text-brand-400">3D</span>
      </div>
      <div className="text-xs leading-tight">
        {t('portal.welcomeBack')}{' '}
        <span className="font-bold text-sm text-zinc-900 dark:text-white">
          {t('portal.bistroOwner')}
        </span>
      </div>
    </div>
  );
}
```

**Verify:** Run `npx tsc --noEmit`, then `npm run build`. Open browser and log in as each demo customer to verify the themed dashboard.

---

### Task 8: Add i18n keys for all 4 locales

**Files:**

- Modify: `public/locales/en/translation.json`
- Modify: `public/locales/de/translation.json`
- Modify: `public/locales/es/translation.json`
- Modify: `public/locales/ru/translation.json`

**What to do:**

Add the following keys to each locale. The keys follow the pattern `portal.industry.<industryId>.<field>`.

**English (`en/translation.json`):**

```json
"portal.industry.restaurant.welcome": "Restaurant Dashboard",
"portal.industry.restaurant.assets": "Menu Items",
"portal.industry.restaurant.assetSingular": "Dish",
"portal.industry.restaurant.projects": "Menus",
"portal.industry.restaurant.newRequest": "New Menu Capture",
"portal.industry.restaurant.kpi.active": "Active Menus",
"portal.industry.restaurant.kpi.inReview": "Items In Review",
"portal.industry.restaurant.kpi.live": "Live Menu Items",

"portal.industry.hospitality.welcome": "Hospitality Dashboard",
"portal.industry.hospitality.assets": "Room Scans",
"portal.industry.hospitality.assetSingular": "Room",
"portal.industry.hospitality.projects": "Tours",
"portal.industry.hospitality.newRequest": "New Tour Capture",
"portal.industry.hospitality.kpi.active": "Active Tours",
"portal.industry.hospitality.kpi.inReview": "Rooms In Review",
"portal.industry.hospitality.kpi.live": "Published Spaces",

"portal.industry.retail.welcome": "Retail Dashboard",
"portal.industry.retail.assets": "3D Models",
"portal.industry.retail.assetSingular": "Product",
"portal.industry.retail.projects": "Products",
"portal.industry.retail.newRequest": "New Product Capture",
"portal.industry.retail.kpi.active": "Active Products",
"portal.industry.retail.kpi.inReview": "Models In Review",
"portal.industry.retail.kpi.live": "Live Products",

"portal.industry.realEstate.welcome": "Real Estate Dashboard",
"portal.industry.realEstate.assets": "Virtual Tours",
"portal.industry.realEstate.assetSingular": "Property",
"portal.industry.realEstate.projects": "Listings",
"portal.industry.realEstate.newRequest": "New Property Capture",
"portal.industry.realEstate.kpi.active": "Active Listings",
"portal.industry.realEstate.kpi.inReview": "Tours In Review",
"portal.industry.realEstate.kpi.live": "Published Tours"
```

**German (`de/translation.json`):**

```json
"portal.industry.restaurant.welcome": "Restaurant-Dashboard",
"portal.industry.restaurant.assets": "Menüpunkte",
"portal.industry.restaurant.assetSingular": "Gericht",
"portal.industry.restaurant.projects": "Menüs",
"portal.industry.restaurant.newRequest": "Neue Menüaufnahme",
"portal.industry.restaurant.kpi.active": "Aktive Menüs",
"portal.industry.restaurant.kpi.inReview": "In Überprüfung",
"portal.industry.restaurant.kpi.live": "Live-Menüpunkte",

"portal.industry.hospitality.welcome": "Gastgewerbe-Dashboard",
"portal.industry.hospitality.assets": "Zimmerscans",
"portal.industry.hospitality.assetSingular": "Zimmer",
"portal.industry.hospitality.projects": "Touren",
"portal.industry.hospitality.newRequest": "Neue Touraufnahme",
"portal.industry.hospitality.kpi.active": "Aktive Touren",
"portal.industry.hospitality.kpi.inReview": "Zimmer in Überprüfung",
"portal.industry.hospitality.kpi.live": "Veröffentlichte Räume",

"portal.industry.retail.welcome": "Einzelhandel-Dashboard",
"portal.industry.retail.assets": "3D-Modelle",
"portal.industry.retail.assetSingular": "Produkt",
"portal.industry.retail.projects": "Produkte",
"portal.industry.retail.newRequest": "Neue Produktaufnahme",
"portal.industry.retail.kpi.active": "Aktive Produkte",
"portal.industry.retail.kpi.inReview": "Modelle in Überprüfung",
"portal.industry.retail.kpi.live": "Live-Produkte",

"portal.industry.realEstate.welcome": "Immobilien-Dashboard",
"portal.industry.realEstate.assets": "Virtuelle Touren",
"portal.industry.realEstate.assetSingular": "Immobilie",
"portal.industry.realEstate.projects": "Angebote",
"portal.industry.realEstate.newRequest": "Neue Immobilienaufnahme",
"portal.industry.realEstate.kpi.active": "Aktive Angebote",
"portal.industry.realEstate.kpi.inReview": "Touren in Überprüfung",
"portal.industry.realEstate.kpi.live": "Veröffentlichte Touren"
```

**Spanish (`es/translation.json`):**

```json
"portal.industry.restaurant.welcome": "Panel de Restaurante",
"portal.industry.restaurant.assets": "Platos del menú",
"portal.industry.restaurant.assetSingular": "Plato",
"portal.industry.restaurant.projects": "Menús",
"portal.industry.restaurant.newRequest": "Nueva captura de menú",
"portal.industry.restaurant.kpi.active": "Menús activos",
"portal.industry.restaurant.kpi.inReview": "En revisión",
"portal.industry.restaurant.kpi.live": "Platos en línea",

"portal.industry.hospitality.welcome": "Panel de Hostelería",
"portal.industry.hospitality.assets": "Escaneos de habitaciones",
"portal.industry.hospitality.assetSingular": "Habitación",
"portal.industry.hospitality.projects": "Tours",
"portal.industry.hospitality.newRequest": "Nueva captura de tour",
"portal.industry.hospitality.kpi.active": "Tours activos",
"portal.industry.hospitality.kpi.inReview": "Habitaciones en revisión",
"portal.industry.hospitality.kpi.live": "Espacios publicados",

"portal.industry.retail.welcome": "Panel de Comercio",
"portal.industry.retail.assets": "Modelos 3D",
"portal.industry.retail.assetSingular": "Producto",
"portal.industry.retail.projects": "Productos",
"portal.industry.retail.newRequest": "Nueva captura de producto",
"portal.industry.retail.kpi.active": "Productos activos",
"portal.industry.retail.kpi.inReview": "Modelos en revisión",
"portal.industry.retail.kpi.live": "Productos en línea",

"portal.industry.realEstate.welcome": "Panel Inmobiliario",
"portal.industry.realEstate.assets": "Tours virtuales",
"portal.industry.realEstate.assetSingular": "Propiedad",
"portal.industry.realEstate.projects": "Anuncios",
"portal.industry.realEstate.newRequest": "Nueva captura de propiedad",
"portal.industry.realEstate.kpi.active": "Anuncios activos",
"portal.industry.realEstate.kpi.inReview": "Tours en revisión",
"portal.industry.realEstate.kpi.live": "Tours publicados"
```

**Russian (`ru/translation.json`):**

```json
"portal.industry.restaurant.welcome": "Панель ресторана",
"portal.industry.restaurant.assets": "Блюда меню",
"portal.industry.restaurant.assetSingular": "Блюдо",
"portal.industry.restaurant.projects": "Меню",
"portal.industry.restaurant.newRequest": "Новая съёмка меню",
"portal.industry.restaurant.kpi.active": "Активные меню",
"portal.industry.restaurant.kpi.inReview": "На проверке",
"portal.industry.restaurant.kpi.live": "Опубликованные блюда",

"portal.industry.hospitality.welcome": "Панель гостеприимства",
"portal.industry.hospitality.assets": "Сканы номеров",
"portal.industry.hospitality.assetSingular": "Номер",
"portal.industry.hospitality.projects": "Туры",
"portal.industry.hospitality.newRequest": "Новая съёмка тура",
"portal.industry.hospitality.kpi.active": "Активные туры",
"portal.industry.hospitality.kpi.inReview": "Номера на проверке",
"portal.industry.hospitality.kpi.live": "Опубликованные пространства",

"portal.industry.retail.welcome": "Панель розницы",
"portal.industry.retail.assets": "3D модели",
"portal.industry.retail.assetSingular": "Товар",
"portal.industry.retail.projects": "Товары",
"portal.industry.retail.newRequest": "Новая съёмка товара",
"portal.industry.retail.kpi.active": "Активные товары",
"portal.industry.retail.kpi.inReview": "Модели на проверке",
"portal.industry.retail.kpi.live": "Опубликованные товары",

"portal.industry.realEstate.welcome": "Панель недвижимости",
"portal.industry.realEstate.assets": "Виртуальные туры",
"portal.industry.realEstate.assetSingular": "Объект",
"portal.industry.realEstate.projects": "Объявления",
"portal.industry.realEstate.newRequest": "Новая съёмка объекта",
"portal.industry.realEstate.kpi.active": "Активные объявления",
"portal.industry.realEstate.kpi.inReview": "Туры на проверке",
"portal.industry.realEstate.kpi.live": "Опубликованные туры"
```

Place these keys near the existing `portal.*` keys in each file.

**Verify:** Run `npm run build` to ensure no JSON syntax errors. Switch locale in browser while on customer dashboard to verify translations render.

---

### Task 9: Final build and visual verification

**Files:** None (verification only)

**What to do:**

1. Run `npm run build` — should succeed with no errors.
2. Start dev server: `npm run dev`
3. Navigate to `http://localhost:3000/app/login`
4. Test each demo customer login and verify:

   **Restaurant Owner (client@bistro.com):**
   - Purple accent header with ChefHat icon
   - KPIs: "Active Menus", "Items In Review", "Live Menu Items"
   - Welcome: "Restaurant Dashboard"
   - Widgets in order: Asset Review → Analytics → Progress → Grid → Downloads → Embed → QR

   **Hotel Manager (client@grandhotel.com):**
   - Sky blue accent header with Building2 icon
   - KPIs: "Active Tours", "Rooms In Review", "Published Spaces"
   - Welcome: "Hospitality Dashboard"
   - Widgets in order: Asset Review → Grid → QR → Downloads → Analytics → Progress

   **Retail Store Owner (client@fashionstore.com):**
   - Orange accent header with ShoppingBag icon
   - KPIs: "Active Products", "Models In Review", "Live Products"
   - Welcome: "Retail Dashboard"
   - Widgets in order: Asset Review → Grid → Embed → Downloads → Analytics → Progress

   **Real Estate Agent (client@luxuryproperties.com):**
   - Emerald accent header with Home icon
   - KPIs: "Active Listings", "Tours In Review", "Published Tours"
   - Welcome: "Real Estate Dashboard"
   - Widgets in order: Asset Review → Grid → QR → Downloads → Analytics → Progress

5. Switch language to Spanish and verify labels translate correctly.
6. Verify employee dashboard (admin@company.com) is unchanged.
