import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed, Search, Box, Smartphone,
  LayoutGrid, List, SlidersHorizontal, ChevronDown, Pencil,
  ArrowUpDown, EyeOff, X, Check, Share2,
  MoreVertical, QrCode, Copy, Trash2, Paintbrush,
} from 'lucide-react';
import { usePortalContext } from '@/types/portal';
import { useAuth } from '@/contexts/AuthContext';
import { MenusProvider } from '@/services/dataProvider';
import type { MenuItemDTO, MenuConfigDTO } from '@/types/dtos';
import { tagStyle } from '@/components/common/DishCardContent';
import { DishCardShell } from '@/components/common/DishCardShell';
import { ItemEditModal } from '@/components/common/ItemEditModal';
import {
  CustomizationPanel,
  DEFAULT_CUSTOMIZATION,
  useLayoutPresets,
  resolveTheme,
  type CustomizationState,
} from '@/components/common/CustomizationPanel';

// ── Helpers ───────────────────────────────────────────────────────────────────

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'views' | 'category';

function parsePrice(p: string): number {
  return parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
}

/** Write updated items back to the editor's localStorage cache so
 *  RestaurantMenu picks up changes made from the portal side. */
function writeItemsToEditorCache(orgId: string, projectId: string, items: MenuItemDTO[]): void {
  try {
    const key = `mc3d_menu_${orgId}_${projectId}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : {};
    // Convert MenuItemDTO (snake_case) → MenuItem (camelCase)
    const menuItems = items.map((d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      desc: d.desc,
      price: d.price,
      image: d.image,
      calories: d.calories,
      tags: d.tags,
      allergens: d.allergens,
      modelUrl: d.model_url,
      pairsWell: d.pairs_well,
      hidden: d.hidden,
      reviewStatus: d.review_status,
      viewCount: d.view_count,
      arLaunches: d.ar_launches,
      marketplace_listed: d.marketplace_listed,
      marketplace_price: d.marketplace_price,
    }));
    localStorage.setItem(key, JSON.stringify({ ...existing, menuItems }));
  } catch { /* full or unavailable */ }
}


/** Shape returned by loadEditorCache — items + visual settings from the editor. */
interface EditorCache {
  items: (MenuItemDTO & { spiceLevel?: number })[];
  brandColor: string;
  surface: string;
  bg: string;
  currency: string;
  showPrices: boolean;
  cardStyle: 'horizontal' | 'stacked';
  cardRadius: 'sharp' | 'rounded' | 'pill';
  fieldVisibility: {
    description?: boolean;
    price?: boolean;
    tags?: boolean;
    calories?: boolean;
    spiceLevel?: boolean;
    allergens?: boolean;
    pairsWell?: boolean;
  };
  customization: CustomizationState;
}

function loadEditorCache(orgId: string, projectId: string): EditorCache | null {
  try {
    const raw = localStorage.getItem(`mc3d_menu_${orgId}_${projectId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const menuItems: Array<Record<string, unknown>> = parsed?.menuItems;
    if (!Array.isArray(menuItems) || menuItems.length === 0) return null;

    // Convert MenuItem (camelCase) → MenuItemDTO (snake_case) + spiceLevel
    const items = menuItems.map((m) => ({
      id: (m.id as string) ?? '',
      name: (m.name as string) ?? '',
      category: (m.category as string) ?? '',
      desc: (m.desc as string) ?? '',
      price: (m.price as string) ?? '',
      image: (m.image as string) ?? '',
      calories: (m.calories as string) ?? '',
      tags: (m.tags as string[]) ?? [],
      allergens: (m.allergens as string[]) ?? [],
      model_url: (m.modelUrl as string) ?? '',
      pairs_well: (m.pairsWell as string[]) ?? [],
      hidden: m.hidden as boolean | undefined,
      review_status: m.reviewStatus as MenuItemDTO['review_status'],
      view_count: m.viewCount as number | undefined,
      ar_launches: m.arLaunches as number | undefined,
      marketplace_listed: m.marketplace_listed as boolean | undefined,
      marketplace_price: m.marketplace_price as string | undefined,
      spiceLevel: m.spiceLevel as number | undefined,
    }));

    // Read visual settings from menuSettings + customization
    const ms = parsed?.menuSettings as Record<string, unknown> | undefined;
    const cust = parsed?.customization as Record<string, unknown> | undefined;

    // Build full CustomizationState from stored customization object
    const customization: CustomizationState = {
      ...DEFAULT_CUSTOMIZATION,
      ...(cust as Partial<CustomizationState> | undefined),
      // themePreset + customBrandColor live in menuSettings
      themePreset: (ms?.themePreset as string) ?? DEFAULT_CUSTOMIZATION.themePreset,
      customBrandColor: (ms?.customBrandColor as string) ?? DEFAULT_CUSTOMIZATION.customBrandColor,
    };

    // Resolve theme colors from the customization state
    const theme = resolveTheme(customization);
    const brandColor = theme.brandColor;

    return {
      items,
      brandColor,
      surface: theme.surface,
      bg: theme.bg,
      currency: (ms?.currency as string) ?? '$',
      showPrices: (ms?.showPrices as boolean) ?? true,
      cardStyle: customization.cardStyle,
      cardRadius: customization.cardRadius,
      fieldVisibility: (ms?.fieldVisibility as EditorCache['fieldVisibility']) ?? {},
      customization,
    };
  } catch {
    return null;
  }
}

// ── Menu-Style Dish Card ──────────────────────────────────────────────────────

// ── More Dropdown ─────────────────────────────────────────────────────────────

interface MoreDropdownProps {
  onEditDetails?: () => void;
  onDuplicate?: () => void;
  onToggleHidden?: () => void;
  onDelete?: () => void;
}

const MoreDropdown: React.FC<MoreDropdownProps> = ({ onEditDetails, onDuplicate, onToggleHidden, onDelete }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-more-menu]')) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const items = [
    { icon: <Pencil className="w-3.5 h-3.5" />, label: 'Edit Details', onClick: onEditDetails },
    { icon: <QrCode className="w-3.5 h-3.5" />, label: 'QR code' },
    { icon: <Copy className="w-3.5 h-3.5" />, label: 'Duplicate', onClick: onDuplicate },
    { icon: <EyeOff className="w-3.5 h-3.5" />, label: 'Hide', onClick: onToggleHidden },
    { icon: <Trash2 className="w-3.5 h-3.5" />, label: 'Delete', danger: true, onClick: onDelete },
  ];

  return (
    <div className="relative" data-more-menu>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all px-3 py-2 rounded-xl hover:bg-white/5"
      >
        <MoreVertical className="w-3.5 h-3.5" />
        More
      </button>
      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 w-44 rounded-xl py-1.5 shadow-2xl z-50"
          style={{ background: '#18181b', border: '1px solid #27272a' }}
        >
          {items.map((item) => {
            const cls = `flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium transition-all ${item.danger
                ? 'text-zinc-400 hover:bg-red-500/10 hover:text-red-400'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`;
            return (
              <button
                key={item.label}
                className={cls}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.icon} {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Menu-Style Dish Card ──────────────────────────────────────────────────────

const DishCard: React.FC<{
  item: MenuItemDTO & { spiceLevel?: number };
  allItems: (MenuItemDTO & { spiceLevel?: number })[];
  showPrices: boolean;
  currency: string;
  projectId: string;
  brandColor: string;
  cardStyle?: 'horizontal' | 'stacked';
  cardRadius?: 'sharp' | 'rounded' | 'pill';
  fieldVisibility?: EditorCache['fieldVisibility'];
  onUpdateItem?: (updated: Partial<MenuItemDTO>) => void;
}> = ({ item, allItems, showPrices, currency, projectId, brandColor, cardStyle, cardRadius, fieldVisibility, onUpdateItem }) => {
  const [editOpen, setEditOpen] = useState(false);

  // Match RestaurantMenu: replace '$' in stored price with the chosen currency
  const price = showPrices && item.price
    ? item.price.replace('$', currency)
    : null;

  // Resolve pairsWell IDs → display names (same logic as RestaurantMenu)
  const resolvedPairsWell = (item.pairs_well ?? []).map((p) => {
    const matched = allItems.find((i) => i.id === p);
    return matched ? matched.name : p;
  });

  return (
    <>
      <DishCardShell
        name={item.name}
        price={price}
        desc={item.desc}
        tags={item.tags}
        calories={item.calories}
        spiceLevel={item.spiceLevel}
        allergens={item.allergens}
        pairsWell={resolvedPairsWell}
        fieldVisibility={fieldVisibility}
        brandColor={brandColor}
        image={item.image}
        hidden={item.hidden}
        cardStyle={cardStyle}
        cardRadius={cardRadius}
        contentClassName={item.model_url ? 'cursor-pointer' : ''}
        imagePlaceholder={
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-600">
            <UtensilsCrossed className="w-8 h-8" />
            <span className="text-xs font-medium text-center px-2 leading-tight">{item.name}</span>
          </div>
        }
        imageOverlay={undefined}
      >
        {/* ── Action Buttons — matches RestaurantMenu structure ── */}
        <div className="flex items-center gap-3">
          {item.model_url && (
            <button
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl text-white transition-all active:scale-95 hover:brightness-110 group/ar"
              style={{
                backgroundColor: brandColor,
                boxShadow: `0 10px 15px -3px ${brandColor}1a`,
              }}
            >
              <Smartphone className="w-4 h-4 transition-transform group-hover/ar:rotate-12" />
              3D / AR
            </button>
          )}
          <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all px-3 py-2 rounded-xl hover:bg-white/5">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <MoreDropdown
            onEditDetails={() => setEditOpen(true)}
          />
        </div>
      </DishCardShell>

      {editOpen && (
        <ItemEditModal
          item={item}
          brandColor={brandColor}
          onSave={(updated) => {
            onUpdateItem?.(updated);
            setEditOpen(false);
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
};

// ── List Row ──────────────────────────────────────────────────────────────────

const DishRow: React.FC<{
  item: MenuItemDTO;
  showPrices: boolean;
  currency: string;
  projectId: string;
  brandColor: string;
}> = ({ item, showPrices, currency, projectId, brandColor }) => {
  const price = showPrices && item.price
    ? item.price.replace('$', currency)
    : '—';
  return (
    <tr className="group hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
            {item.image
              ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              : <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed className="w-4 h-4 text-zinc-600" /></div>}
          </div>
          <div>
            <div className="font-bold text-white text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</div>
            {item.desc && <div className="text-xs text-zinc-500 truncate max-w-[200px]">{item.desc}</div>}
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-xs text-zinc-500 capitalize">{item.category}</td>
      <td className="px-5 py-3.5">
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${tagStyle(tag)}`}>{tag}</span>
          ))}
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm font-bold" style={{ color: brandColor }}>{price}</td>
      <td className="px-5 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to={`/project/${projectId}/menu`} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-400 hover:bg-white/5 transition-colors" title="View">
            <Box className="w-4 h-4" />
          </Link>
          <Link to={`/project/${projectId}/menu/edit`} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-400 hover:bg-white/5 transition-colors" title="Edit">
            <Pencil className="w-4 h-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const AssetsPage: React.FC = () => {
  const { t } = useTranslation();
  const { projects } = usePortalContext();
  const { user } = useAuth();
  const orgId = user?.orgId ?? 'org-001';

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [config, setConfig] = useState<MenuConfigDTO | null>(null);
  const [editorSettings, setEditorSettings] = useState<Omit<EditorCache, 'items'> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showHidden, setShowHidden] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) setSelectedProjectId(projects[0].id);
  }, [projects, selectedProjectId]);

  // Keep a ref to the latest apiConfig so live-sync helpers can overlay
  // localStorage items without re-fetching the API every time.
  const apiConfigRef = useRef<MenuConfigDTO | null>(null);

  /** Read editor cache and apply items + visual settings to state. */
  const applyCacheToState = useCallback((base: MenuConfigDTO) => {
    const cached = loadEditorCache(orgId, selectedProjectId);
    if (cached) {
      const { items: cachedItems, ...settings } = cached;
      setConfig({ ...base, items: cachedItems as MenuItemDTO[] });
      setEditorSettings(settings);
    } else {
      setConfig(base);
      setEditorSettings(null);
    }
  }, [orgId, selectedProjectId]);

  // Initial fetch: get API config, then overlay localStorage items + settings
  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    MenusProvider.get(selectedProjectId)
      .then((apiConfig) => {
        if (!apiConfig) { setConfig(null); apiConfigRef.current = null; return; }
        apiConfigRef.current = apiConfig;
        applyCacheToState(apiConfig);
      })
      .catch(() => { setConfig(null); apiConfigRef.current = null; })
      .finally(() => setLoading(false));
  }, [selectedProjectId, orgId, applyCacheToState]);

  // Live sync: re-read localStorage when the tab regains focus (same-tab
  // navigation) or when another tab writes to localStorage (cross-tab).
  useEffect(() => {
    if (!selectedProjectId) return;

    const syncFromCache = () => {
      const base = apiConfigRef.current;
      if (!base) return;
      applyCacheToState(base);
    };

    const onFocus = () => syncFromCache();
    window.addEventListener('focus', onFocus);

    const onStorage = (e: StorageEvent) => {
      if (e.key === `mc3d_menu_${orgId}_${selectedProjectId}`) syncFromCache();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [selectedProjectId, orgId, applyCacheToState]);

  const items = (config?.items ?? []) as (MenuItemDTO & { spiceLevel?: number })[];
  const currency = editorSettings?.currency ?? config?.currency ?? '$';
  const showPrices = editorSettings?.showPrices ?? config?.show_prices ?? true;
  const brandColor = editorSettings?.brandColor ?? config?.brand_color ?? '#d97706';
  const surface = editorSettings?.surface ?? '#18181b';
  const bg = editorSettings?.bg ?? '#09090b';
  const cardStyle = editorSettings?.cardStyle ?? 'horizontal';
  const cardRadius = editorSettings?.cardRadius ?? 'rounded';
  const fieldVisibility = editorSettings?.fieldVisibility ?? (config?.field_visibility as EditorCache['fieldVisibility']) ?? {};

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const allTags = useMemo(() => Array.from(new Set(items.flatMap((i) => i.tags))).sort(), [items]);
  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }, []);

  const handleUpdateItem = useCallback((updated: Partial<MenuItemDTO>) => {
    if (!config || !updated.id) return;
    const newItems = config.items.map((it) =>
      it.id === updated.id ? { ...it, ...updated } : it
    );
    const newConfig = { ...config, items: newItems };
    setConfig(newConfig);
    // Write back to localStorage so the menu editor sees the change
    writeItemsToEditorCache(orgId, selectedProjectId, newItems);
    // Persist to API
    const { id: _id, org_id: _org, project_id: _pid, created_at: _ca, updated_at: _ua, ...payload } = newConfig;
    MenusProvider.save(selectedProjectId, payload).catch(() => {
      setConfig(config);
    });
  }, [config, selectedProjectId, orgId]);

  const filtered = useMemo(() => {
    let result = showHidden ? items : items.filter((i) => !i.hidden);
    if (activeCategory !== 'All') result = result.filter((i) => i.category === activeCategory);
    if (activeTags.length > 0) result = result.filter((i) => activeTags.every((t) => i.tags.includes(t)));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    switch (sortBy) {
      case 'price-asc': return [...result].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      case 'price-desc': return [...result].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
      case 'views': return [...result].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));
      case 'category': return [...result].sort((a, b) => a.category.localeCompare(b.category));
      default: return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [items, activeCategory, activeTags, searchQuery, sortBy, showHidden]);

  const hiddenCount = items.filter((i) => i.hidden).length;

  return (
    <div
      className="min-h-screen rounded-3xl py-6 md:py-8 space-y-6 text-zinc-100"
      style={{
        background: `linear-gradient(180deg, ${bg} 0%, ${bg}ee 100%)`,
        fontFamily: "'Outfit', sans-serif",
        '--brand': brandColor,
        '--bg': bg,
        '--surface': surface,
        '--text': '#fafafa',
        '--muted': '#71717a',
        '--border': '#27272a',
        '--radius': '16px',
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t('portal.tab.dishes', 'Dishes')}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {filtered.length} {t('portal.dishes.items', 'dishes')}
            {hiddenCount > 0 && !showHidden && <span className="ml-2 text-zinc-600">· {hiddenCount} hidden</span>}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Menu selector */}
          {projects.length > 1 && (
            <select
              value={selectedProjectId}
              onChange={(e) => { setSelectedProjectId(e.target.value); setActiveCategory('All'); setActiveTags([]); }}
              className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search dishes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 w-44"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-9 pr-8 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 appearance-none"
            >
              <option value="name">Name A–Z</option>
              <option value="category">Category</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="views">Most Viewed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          {/* Filters */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${showFilters ? 'bg-brand-900/30 border-brand-700/50 text-brand-400' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeTags.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">{activeTags.length}</span>}
          </button>

          {/* View mode */}
          <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-1" role="group">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-2xl p-4 space-y-4" style={{ background: 'rgba(24,24,27,0.7)', border: '0.8px solid rgba(255,255,255,0.08)' }}>
          {allTags.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Filter by Tag</p>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => {
                  const active = activeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${active ? 'bg-brand-600 text-white border-brand-600' : `${tagStyle(tag)} hover:opacity-80`}`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      {tag}
                    </button>
                  );
                })}
                {activeTags.length > 0 && (
                  <button onClick={() => setActiveTags([])} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-red-400 border border-red-800/50 hover:bg-red-900/20 transition-all">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>
          )}
          {hiddenCount > 0 && (
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-sm font-medium text-zinc-300">Show hidden dishes</p>
                <p className="text-xs text-zinc-600">{hiddenCount} hidden from the public menu</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:ring-4 peer-focus:ring-brand-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Category tabs */}
      {categories.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${activeCategory === cat ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 rounded-3xl animate-pulse" style={{ background: 'rgba(24,24,27,0.5)' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
          <UtensilsCrossed className="w-10 h-10 text-zinc-700 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>No dishes found</h3>
          <p className="text-zinc-600 text-sm">Try adjusting your filters or add dishes via the menu editor.</p>
        </div>
      )}

      {/* Grid — matches RestaurantMenu card style */}
      {!loading && filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filtered.map((item) => (
            <DishCard
              key={item.id}
              item={item}
              allItems={items}
              showPrices={showPrices}
              currency={currency}
              projectId={selectedProjectId}
              brandColor={brandColor}
              cardStyle={cardStyle}
              cardRadius={cardRadius}
              fieldVisibility={fieldVisibility}
              onUpdateItem={handleUpdateItem}
            />
          ))}
        </div>
      )}

      {/* List */}
      {!loading && filtered.length > 0 && viewMode === 'list' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(24,24,27,0.65)', border: '0.8px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full text-sm text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Dish', 'Category', 'Tags', 'Price', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <DishRow key={item.id} item={item} showPrices={showPrices} currency={currency} projectId={selectedProjectId} brandColor={brandColor} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
