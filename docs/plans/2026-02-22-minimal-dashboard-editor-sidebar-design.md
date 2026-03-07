# Design: Minimal Customer Dashboard + Editor Sidebar

**Date:** 2026-02-22
**Status:** Approved
**Approach:** Strip dashboard to KPIs + project cards. Move all tools into the editor via a collapsible sidebar.

## Summary

The customer portal dashboard is overloaded with 7+ widgets. Customers see analytics, asset review, downloads, embed generators, QR codes — all at once on login. The fix: make the dashboard dead-simple (3 KPIs + project cards), and put all the tools inside the project editor where they're contextually relevant.

## Part 1: Simplified Customer Dashboard

### Keeps

- IndustryHeader (themed gradient bar + icon + welcome message)
- IndustryKPIStrip (3 config-driven KPI cards per industry)

### Replaces all 7 widgets with

**ProjectCards** — a responsive grid of the customer's projects. Each card shows:

- Project name
- Status badge (colored: Live, In Review, Processing, Pending)
- Item count
- Total views (if published, else hidden)
- Last updated timestamp
- "Open" button → navigates to `/project/:id/menu/edit`

### Review notification banner

If assets are awaiting review, a compact banner appears above the project cards:

> "5 items need your review" [Review Now →]
> Clicking it navigates to the relevant project's Review sidebar tab.

### Layout

```
[Industry Header + Welcome]
[KPI: Active] [KPI: In Review] [KPI: Live]

Your Menus                              + New Menu
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Summer Menu  │ │ Lunch Menu  │ │ Pastry Col. │
│ Live ●       │ │ In Review ● │ │ Processing  │
│ 6 items      │ │ 4 items     │ │ 3 items     │
│ 2.4k views   │ │ --          │ │ --          │
│ Updated 2h   │ │ Updated 1d  │ │ Updated 3d  │
│    [Open →]  │ │   [Open →]  │ │   [Open →]  │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Part 2: Editor Sidebar

The editor page (`/project/:id/menu/edit`) gets a collapsible sidebar on the left edge.

### Sidebar tabs (icon-only, 48px wide)

| Icon          | Tab                  | Content                                             |
| ------------- | -------------------- | --------------------------------------------------- |
| `List`        | Menu Items (default) | Full menu editor (current view)                     |
| `CheckCircle` | Review               | CustomerAssetReview filtered to this project        |
| `BarChart3`   | Analytics            | CustomerAnalytics filtered to this project's assets |
| `Download`    | Downloads            | DownloadCenter filtered to this project             |
| `QrCode`      | Share & Embed        | EmbedGenerator + BrandedQRCode combined             |

### Behavior

- **Default**: Sidebar collapsed — only icons visible (48px strip). Menu editor has full width.
- **Click tab**: Sidebar expands to ~380px showing the panel content. Menu content shifts right.
- **Click same tab or X**: Sidebar collapses back.
- **Mobile (<768px)**: Sidebar becomes a bottom sheet that slides up when a tab is tapped. A small bottom nav bar shows the 5 tab icons.

### Layout (expanded)

```
┌──────┬───────────────────────────────────────┐
│ 📋 ← │ [Menu Header - Save]                  │
│ ✅   │ [Hero Section]                        │
│ 📊   │ [Category Tabs]                       │
│ 📥   │ [Menu Items]                          │
│ 📱   │                                       │
│      │                                       │
│ Panel│                                       │
│ here │                                       │
│ when │                                       │
│ open │                                       │
└──────┴───────────────────────────────────────┘
```

## Part 3: Widget Migration Map

| Widget              | Dashboard (before) | Dashboard (after) | Editor (after)            |
| ------------------- | ------------------ | ----------------- | ------------------------- |
| IndustryHeader      | Yes                | Yes               | No                        |
| IndustryKPIStrip    | Yes                | Yes               | No                        |
| CustomerAssetReview | Yes                | No                | Review tab                |
| CustomerAnalytics   | Yes                | No                | Analytics tab             |
| ProjectProgress     | Yes                | No                | Removed (status on cards) |
| AssetGrid           | Yes                | No                | Removed (items in editor) |
| DownloadCenter      | Yes                | No                | Downloads tab             |
| EmbedGenerator      | Yes                | No                | Share & Embed tab         |
| BrandedQRCode       | Yes                | No                | Share & Embed tab         |

**Zero information lost.** Every feature still accessible, just relocated to where it's contextually useful.

## Part 4: Files Changed

| File                                      | Change                                                               |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `src/pages/Portal.tsx`                    | Customer dashboard: replace IndustryWidgetRenderer with ProjectCards |
| `src/components/portal/ProjectCards.tsx`  | **New** — project card grid with status, stats, open button          |
| `src/components/portal/ReviewBanner.tsx`  | **New** — compact notification banner for pending reviews            |
| `src/pages/RestaurantMenu.tsx`            | Add EditorSidebar wrapper around existing content                    |
| `src/components/portal/EditorSidebar.tsx` | **New** — collapsible sidebar with icon tabs + panel rendering       |
| `src/constants/portal-configs.ts`         | Remove `widgets` array from configs (no longer needed)               |
| `public/locales/*/translation.json`       | Add i18n keys for sidebar tabs, project cards, review banner         |

## Not In Scope

- Employee dashboard changes
- New menu creation flow
- Backend API changes
- Template pages other than RestaurantMenu (showcase, catalog, etc. will get sidebars later)
