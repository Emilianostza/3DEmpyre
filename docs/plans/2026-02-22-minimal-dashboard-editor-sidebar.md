# Minimal Dashboard + Editor Sidebar — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strip the customer portal dashboard to KPIs + project cards, and move all tools (analytics, downloads, QR, embed, review) into the editor page via a collapsible sidebar.

**Architecture:** The customer dashboard replaces its IndustryWidgetRenderer (7 widgets) with a new ProjectCards component showing a responsive grid of project cards with status, stats, and "Open" links. The editor page (RestaurantMenu.tsx) wraps its existing content inside a new EditorSidebar that provides icon-tab navigation to panels containing the relocated widgets (CustomerAssetReview, CustomerAnalytics, DownloadCenter, EmbedGenerator, BrandedQRCode). Zero information is lost — features simply move to where they're contextually relevant.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, react-i18next, lucide-react

---

### Task 1: Create ProjectCards component

**Files:**

- Create: `src/components/portal/ProjectCards.tsx`

**What to do:**

Create a responsive grid of project cards for the customer dashboard. Each card shows: project name, status badge, item count, total views (if published), last updated, and an "Open" button that navigates to the project editor.

The component receives `projects: Project[]` and `assets: Asset[]` as props. For each project it computes:

- `itemCount`: number of assets with matching `project_id`
- `totalViews`: sum of `viewCount` for those assets
- `statusColor`: based on project.status (same palette as existing PROJECT_STATUS_MAP in Portal.tsx)
- `lastUpdated`: `timeAgo(project.created_at)` or a more recent asset timestamp

**Interface:**

```typescript
interface Props {
  projects: Project[];
  assets: Asset[];
}
```

**Card layout:**

- Responsive grid: 1 col mobile, 2 cols sm, 3 cols lg
- Each card: `bg-white dark:bg-zinc-900` rounded-xl with border, padding, hover shadow
- Top: project name (font-bold, truncate) + status badge (colored pill)
- Middle: item count + total views (if > 0)
- Bottom: "Updated X ago" + "Open →" link button
- The "Open" link navigates to `/project/${project.id}/menu/edit`

**Section header above the grid:**

- Left: "Your Menus" heading (or industry-specific from config labels)
- Right: "Get a Free Quote" link button (brand-colored, links to /request)

**Verify:** Run `npx tsc --noEmit` to confirm it compiles.

---

### Task 2: Create ReviewBanner component

**Files:**

- Create: `src/components/portal/ReviewBanner.tsx`

**What to do:**

A compact notification banner that appears above the project cards when assets are awaiting review (status "In Review").

**Props:** `assets: Asset[]`, `projects: Project[]`

**Behavior:**

- Count assets with `status === 'In Review'`
- If count > 0, render a banner: amber/orange tinted background, bell or eye icon, text "X items need your review", and a "Review Now →" button
- The "Review Now" button navigates to the first project that has In Review assets: `/project/${projectId}/menu/edit?tab=review`
- If count === 0, render nothing (return null)

**Verify:** Run `npx tsc --noEmit`.

---

### Task 3: Update Portal.tsx customer dashboard

**Files:**

- Modify: `src/pages/Portal.tsx`

**What to do:**

Replace the IndustryWidgetRenderer in the customer dashboard section with the new ProjectCards and ReviewBanner.

1. Add imports:

```typescript
import { ProjectCards } from '@/components/portal/ProjectCards';
import { ReviewBanner } from '@/components/portal/ReviewBanner';
```

2. Find the customer dashboard section (where `role === 'customer'` renders inside `activeTab === 'dashboard'`). Currently it renders:

```tsx
<IndustryHeader ... />
<IndustryKPIStrip ... />
<IndustryWidgetRenderer ... />
```

Replace `<IndustryWidgetRenderer ... />` with:

```tsx
<ReviewBanner assets={assets} projects={projects} />
<ProjectCards projects={projects} assets={assets} />
```

Keep IndustryHeader and IndustryKPIStrip — they stay.

3. The imports for CustomerAssetReview, CustomerAnalytics, ProjectProgress, AssetGrid, DownloadCenter, EmbedGenerator, BrandedQRCode can stay in Portal.tsx for now (the employee dashboard still uses some of them). If they're only used in IndustryWidgetRenderer, they can be cleaned up later.

**Verify:** Run `npm run build`. Open browser, log in as any customer, verify: KPIs visible, project cards visible, no widgets below.

---

### Task 4: Create EditorSidebar component

**Files:**

- Create: `src/components/portal/EditorSidebar.tsx`

**What to do:**

A collapsible sidebar for the editor page with icon tabs and panel content.

**Props:**

```typescript
interface EditorSidebarProps {
  projectId: string;
  assets: Asset[];
  projects: Project[];
  children: React.ReactNode; // The main editor content
}
```

**State:** `activeTab: string | null` (null = collapsed, string = expanded with that tab visible)

**Tab definitions:**

```typescript
const SIDEBAR_TABS = [
  { id: 'review', icon: CheckCircle, label: 'editor.sidebar.review' },
  { id: 'analytics', icon: BarChart3, label: 'editor.sidebar.analytics' },
  { id: 'downloads', icon: Download, label: 'editor.sidebar.downloads' },
  { id: 'share', icon: QrCode, label: 'editor.sidebar.share' },
];
```

**Layout structure:**

```
┌─────────────────────────────────────────────────────────┐
│ [Icon Strip 48px] [Panel 380px if open] [Main Content]  │
└─────────────────────────────────────────────────────────┘
```

- **Icon strip (always visible, 48px wide):**
  - Fixed left, full height, `bg-stone-900 border-r border-stone-800`
  - Each tab: 48x48 button with icon, tooltip on hover
  - Active tab: highlighted with brand/accent color background
  - At bottom: a small back arrow "← Dashboard" link to `/portal/dashboard`

- **Panel (visible when activeTab !== null, 380px wide):**
  - `bg-stone-950 border-r border-stone-800`
  - Header: tab label + close X button
  - Content: scrollable area rendering the appropriate widget
  - Slide animation: `transition-all duration-200`

- **Main content area:**
  - Renders `{children}` (the existing RestaurantMenu content)
  - Has `margin-left` set to: 48px (collapsed) or 48px + 380px = 428px (expanded)
  - On mobile (<768px): no sidebar icon strip. Instead, a floating bottom nav bar with the 4 tab icons. Tapping one opens a bottom sheet.

**Panel content mapping:**

```typescript
switch(activeTab) {
  case 'review':
    return <CustomerAssetReview assets={projectAssets} projects={[project]} onApprove={...} onRequestRevision={...} />;
  case 'analytics':
    return <CustomerAnalytics assets={projectAssets} />;
  case 'downloads':
    return <DownloadCenter assets={projectAssets} projects={[project]} />;
  case 'share':
    return (
      <>
        <EmbedGenerator assets={projectAssets} projects={[project]} />
        <BrandedQRCode assets={projectAssets} projects={[project]} />
      </>
    );
}
```

Where `projectAssets = assets.filter(a => a.project_id === projectId)`.

**URL tab support:** Read `?tab=review` from URL search params. If present, set that tab as initially active (for the ReviewBanner "Review Now" link).

**Verify:** Run `npx tsc --noEmit`.

---

### Task 5: Integrate EditorSidebar into RestaurantMenu.tsx

**Files:**

- Modify: `src/pages/templates/RestaurantMenu.tsx`

**What to do:**

Wrap the existing RestaurantMenu content inside the EditorSidebar component, but ONLY in edit mode.

1. Add imports:

```typescript
import { EditorSidebar } from '@/components/portal/EditorSidebar';
import { Asset } from '@/types';
import { AssetsProvider } from '@/services/dataProvider';
```

2. Add assets state and fetch:

```typescript
const [assets, setAssets] = useState<Asset[]>([]);

useEffect(() => {
  const fetchAssets = async () => {
    try {
      const assetData = await AssetsProvider.list();
      setAssets(assetData as Asset[]);
    } catch {
      if (import.meta.env.DEV) console.error('Failed to load assets');
    }
  };
  if (isEditMode) fetchAssets();
}, [isEditMode]);
```

3. In the return JSX, wrap the outermost `<div>` content. Currently:

```tsx
return (
  <div className="min-h-screen bg-stone-950 ...">
    <MenuSettingsModal ... />
    {/* Owner preview badge */}
    <MenuHeader ... />
    <MenuHero ... />
    <CategoryTabs ... />
    {/* Search bar */}
    <main ...>...</main>
    <footer ...>...</footer>
    {/* Sheets & Overlays */}
  </div>
);
```

For edit mode, wrap everything inside EditorSidebar:

```tsx
return (
  <div className="min-h-screen bg-stone-950 ...">
    <MenuSettingsModal ... />
    {isEditMode ? (
      <EditorSidebar
        projectId={id || ''}
        assets={assets}
        projects={project ? [project] : []}
      >
        {/* All existing content (badge, header, hero, tabs, search, main, footer) */}
      </EditorSidebar>
    ) : (
      <>
        {/* Same content, no sidebar */}
      </>
    )}
    {/* Sheets & Overlays (stay outside sidebar) */}
  </div>
);
```

To avoid duplicating the menu content, extract it into a local variable or use a renderContent function:

```tsx
const menuContent = (
  <>
    {isOwner && <div className="fixed z-30 ...">...</div>}
    <MenuHeader ... />
    <MenuHero ... />
    <CategoryTabs ... />
    {showSearch && ...}
    <main ...>...</main>
    <footer ...>...</footer>
  </>
);

return (
  <div className="min-h-screen bg-stone-950 ..." style={cssVars} {...devAttrs}>
    <MenuSettingsModal ... />
    {isEditMode ? (
      <EditorSidebar projectId={id || ''} assets={assets} projects={project ? [project] : []}>
        {menuContent}
      </EditorSidebar>
    ) : (
      menuContent
    )}
    {/* Sheets & overlays stay outside */}
    <ItemDetailsSheet ... />
    {viewerItem && <ModelViewerOverlay ... />}
    ...
  </div>
);
```

**Verify:** Run `npm run build`. Open browser, log in as customer, open a project. Verify:

- Sidebar icon strip visible on left edge (4 icons)
- Click "Analytics" icon → panel slides out showing analytics
- Click "Downloads" icon → panel shows download options
- Menu content shifts right when panel is open
- Click the same icon or X → panel collapses

---

### Task 6: Add i18n keys for all 4 locales

**Files:**

- Modify: `public/locales/en/translation.json`
- Modify: `public/locales/de/translation.json`
- Modify: `public/locales/es/translation.json`
- Modify: `public/locales/ru/translation.json`

**What to do:**

Add keys for the editor sidebar tabs, the project cards section, and the review banner.

**English:**

```json
"editor.sidebar.review": "Review",
"editor.sidebar.analytics": "Analytics",
"editor.sidebar.downloads": "Downloads",
"editor.sidebar.share": "Share & Embed",
"editor.sidebar.backToDashboard": "Back to Dashboard",
"portal.yourMenus": "Your Menus",
"portal.openProject": "Open",
"portal.projectItems": "{{count}} items",
"portal.projectViews": "{{count}} views",
"portal.reviewBanner.title": "{{count}} items need your review",
"portal.reviewBanner.action": "Review Now"
```

**German:**

```json
"editor.sidebar.review": "Überprüfung",
"editor.sidebar.analytics": "Analytik",
"editor.sidebar.downloads": "Downloads",
"editor.sidebar.share": "Teilen & Einbetten",
"editor.sidebar.backToDashboard": "Zurück zum Dashboard",
"portal.yourMenus": "Ihre Menüs",
"portal.openProject": "Öffnen",
"portal.projectItems": "{{count}} Artikel",
"portal.projectViews": "{{count}} Aufrufe",
"portal.reviewBanner.title": "{{count}} Artikel benötigen Ihre Überprüfung",
"portal.reviewBanner.action": "Jetzt überprüfen"
```

**Spanish:**

```json
"editor.sidebar.review": "Revisión",
"editor.sidebar.analytics": "Analíticas",
"editor.sidebar.downloads": "Descargas",
"editor.sidebar.share": "Compartir e integrar",
"editor.sidebar.backToDashboard": "Volver al panel",
"portal.yourMenus": "Tus menús",
"portal.openProject": "Abrir",
"portal.projectItems": "{{count}} artículos",
"portal.projectViews": "{{count}} visitas",
"portal.reviewBanner.title": "{{count}} artículos necesitan tu revisión",
"portal.reviewBanner.action": "Revisar ahora"
```

**Russian:**

```json
"editor.sidebar.review": "Проверка",
"editor.sidebar.analytics": "Аналитика",
"editor.sidebar.downloads": "Загрузки",
"editor.sidebar.share": "Поделиться",
"editor.sidebar.backToDashboard": "Назад к панели",
"portal.yourMenus": "Ваши меню",
"portal.openProject": "Открыть",
"portal.projectItems": "{{count}} позиций",
"portal.projectViews": "{{count}} просмотров",
"portal.reviewBanner.title": "{{count}} позиций ждут проверки",
"portal.reviewBanner.action": "Проверить сейчас"
```

**Verify:** Run `npm run build`.

---

### Task 7: Final build + visual verification

**Files:** None (verification only)

**What to do:**

1. Run `npm run build` — should succeed with no errors.
2. Start dev server: `npm run dev`
3. Navigate to `http://localhost:3000/app/login`
4. Log in as Restaurant Owner (client@bistro.com)

**Verify dashboard:**

- Industry header (purple, chef hat) visible
- 3 KPI cards visible
- Review banner visible (if In Review assets exist)
- Project cards grid visible with status, item count, views
- NO widgets below cards (analytics, downloads, QR, etc. are GONE from dashboard)
- Click "Open" on a project card → navigates to editor

**Verify editor:**

- Sidebar icon strip visible on left (4 icons: review, analytics, downloads, share)
- Default: sidebar collapsed, menu has full width
- Click Analytics icon → panel slides out (380px), shows chart and stats
- Click Downloads icon → panel switches to download options
- Click Share icon → shows embed generator + QR code tools
- Click Review icon → shows asset review queue
- Click same icon or X → panel closes
- "← Dashboard" link at bottom of icon strip → returns to dashboard
- Menu editing still works: category tabs, search, item editing, 3D viewer
- Mobile: bottom nav bar instead of sidebar

5. Log in as Hotel Manager → verify hospitality-themed dashboard with project cards
6. Verify employee dashboard (admin@company.com) is unchanged
