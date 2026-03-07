# Design: Industry-Specific Customer Portal Identities

**Date:** 2026-02-22
**Status:** Approved
**Approach:** Config-Driven Dashboard (Approach A)

## Summary

Make each customer's logged-in portal dashboard adapt to their industry. A restaurant owner sees a purple restaurant-themed dashboard with menus, dishes, and QR codes. A hotel owner sees a sky-blue hospitality dashboard with room tours and virtual spaces. Same underlying widgets — different config driving labels, colors, KPIs, and widget order.

Employee/admin dashboards remain unchanged (generic operations view).

## How Industry Gets Assigned

- Add `industry: Industry` to `Organization` type in `auth.ts`
- Industry is set when the admin creates the customer's org (sourced from the request form)
- `AuthContext` exposes `organization.industry` so the portal can resolve the correct config
- `Login.tsx` demo role selector gets an industry picker for customer roles

## Dashboard Config Interface

```typescript
interface IndustryPortalConfig {
  id: string; // e.g. 'restaurants'
  theme: {
    accent: string; // Tailwind color (e.g. 'brand', 'sky', 'orange', 'emerald')
    gradient: string; // CSS gradient class
    icon: LucideIcon; // Header icon
  };
  headerTitle: string; // i18n key for welcome message
  ctaLabel: string; // i18n key for primary action
  labels: {
    assets: string; // i18n key — "Menu Items" / "Room Scans" / "Products" / "Properties"
    assetSingular: string; // i18n key — "Dish" / "Room" / "Product" / "Property"
    projects: string; // i18n key — "Menus" / "Tours" / "Catalogs" / "Listings"
  };
  kpis: Array<{
    label: string; // i18n key
    icon: LucideIcon;
    colorClass: string; // Tailwind color classes
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

## Per-Industry Configs

### Restaurant (existing customers, default)

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| **Accent**       | Purple (`brand-600`)                                                    |
| **Icon**         | `ChefHat`                                                               |
| **Gradient**     | Purple → Violet                                                         |
| **KPIs**         | Active Menus · Items In Review · Live Menu Items                        |
| **Widget order** | Asset Review → QR Codes → Download Center → Embed Generator → Analytics |
| **Labels**       | assets: "Menu Items", projects: "Menus"                                 |

### Hospitality

| Field            | Value                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| **Accent**       | Sky blue (`sky-600`)                                                         |
| **Icon**         | `Building2`                                                                  |
| **Gradient**     | Sky → Indigo                                                                 |
| **KPIs**         | Active Tours · Rooms In Review · Published Spaces                            |
| **Widget order** | Asset Review → Asset Grid (gallery) → QR Codes → Download Center → Analytics |
| **Labels**       | assets: "Room Scans", projects: "Tours"                                      |

### Retail / E-commerce

| Field            | Value                                                                               |
| ---------------- | ----------------------------------------------------------------------------------- |
| **Accent**       | Orange (`orange-600`)                                                               |
| **Icon**         | `ShoppingBag`                                                                       |
| **Gradient**     | Orange → Amber                                                                      |
| **KPIs**         | Active Products · Models In Review · Live Products                                  |
| **Widget order** | Asset Review → Asset Grid (catalog) → Embed Generator → Download Center → Analytics |
| **Labels**       | assets: "3D Models", projects: "Products"                                           |

### Real Estate

| Field            | Value                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| **Accent**       | Emerald (`emerald-600`)                                                      |
| **Icon**         | `Home`                                                                       |
| **Gradient**     | Emerald → Teal                                                               |
| **KPIs**         | Active Listings · Tours In Review · Published Tours                          |
| **Widget order** | Asset Review → Asset Grid (gallery) → QR Codes → Download Center → Analytics |
| **Labels**       | assets: "Virtual Tours", projects: "Listings"                                |

## Themed UI Sections

The industry theme applies to these UI elements in the customer portal:

1. **Header accent bar** — thin gradient strip at top matching industry color
2. **KPI cards** — icon background and number color use industry accent
3. **Active tab indicator** — uses industry accent instead of generic brand
4. **Section headings** — use industry-specific labels from config
5. **Primary CTA button** — uses industry accent color
6. **Welcome message** — "Your Restaurant Dashboard" / "Your Hotel Dashboard" / etc.

## Files Changed

| File                                               | Change                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| `src/types/auth.ts`                                | Add `industry?: Industry` to `Organization` interface               |
| `src/types.ts`                                     | Add `IndustryPortalConfig` interface                                |
| `src/constants/portal-configs.ts`                  | **New** — 4 industry dashboard config objects                       |
| `src/pages/Portal.tsx`                             | Customer branch uses config to render themed KPIs + ordered widgets |
| `src/components/portal/IndustryHeader.tsx`         | **New** — themed customer header with industry icon/gradient        |
| `src/components/portal/IndustryKPIStrip.tsx`       | **New** — config-driven KPI cards with industry colors              |
| `src/components/portal/IndustryWidgetRenderer.tsx` | **New** — maps widget ID strings to actual components               |
| `src/pages/Login.tsx`                              | Add industry selector dropdown for demo customer roles              |
| `src/contexts/AuthContext.tsx`                     | Include `organization.industry` in context value                    |
| `public/locales/en/translation.json`               | Add `portal.industry.*` i18n keys                                   |
| `public/locales/de/translation.json`               | Add translated keys                                                 |
| `public/locales/es/translation.json`               | Add translated keys                                                 |
| `public/locales/ru/translation.json`               | Add translated keys                                                 |

## Not In Scope

- Employee/admin dashboard changes (stays generic)
- Backend API changes (mock data only for now)
- Industry-specific unique widgets (all use same widget components, just different config)
- Custom data models per industry (all share Project/Asset types)
