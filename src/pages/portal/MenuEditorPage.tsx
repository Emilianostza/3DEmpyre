import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paintbrush, ExternalLink, Save, Check, Loader2,
  LayoutGrid, Rows3, Columns3, Minus, Equal, AlignVerticalSpaceAround,
  RotateCcw, ChevronDown, Type, RectangleHorizontal, Square, Pill,
  MonitorSmartphone,
} from 'lucide-react';
import { usePortalContext } from '@/types/portal';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectStatus } from '@/types/domain';
import {
  THEME_PRESETS,
  DEFAULT_CUSTOMIZATION,
  useLayoutPresets,
  type CustomizationState,
  type ThemePreset,
  type CardLayout,
  type CardStyle,
  type MenuSpacing,
  type HeroSize,
  type FontWeight,
  type CardRadius,
} from '@/components/common/CustomizationPanel';

/* ── helpers ────────────────────────────────────────────────────────────────── */

const radiusMap: Record<CardRadius, string> = { sharp: '0px', rounded: '12px', pill: '24px' };
const spacingMap: Record<MenuSpacing, string> = { compact: '8px', default: '16px', spacious: '24px' };
const heroHeightMap: Record<HeroSize, number> = { short: 90, default: 130, tall: 170 };
const fontWeightMap: Record<FontWeight, number> = { light: 300, default: 400, bold: 700 };

/* ── Section wrapper ────────────────────────────────────────────────────────── */

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.04] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-5 py-3 text-left group transition-colors hover:bg-white/[0.02]"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? '600px' : '0', opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pb-4 space-y-4">{children}</div>
      </div>
    </div>
  );
};

/* ── OptionButton ────────────────────────────────────────────────────────────── */

const OptionBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  brandColor?: string;
}> = ({ active, onClick, icon, label, brandColor = '#d97706' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
      active
        ? 'text-white border-transparent shadow-lg'
        : 'bg-transparent border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]'
    }`}
    style={active ? { backgroundColor: brandColor + '30', borderColor: brandColor + '60', color: brandColor } : undefined}
  >
    {icon}
    {label}
  </button>
);

/* ── ThemeSwatch ─────────────────────────────────────────────────────────────── */

const ThemeSwatch: React.FC<{
  preset: ThemePreset;
  active: boolean;
  onClick: () => void;
  onHover: (id: string | null) => void;
}> = ({ preset, active, onClick, onHover }) => (
  <button
    onClick={onClick}
    onMouseEnter={() => onHover(preset.id)}
    onMouseLeave={() => onHover(null)}
    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 ${
      active
        ? 'border-white/20 bg-white/[0.04] shadow-[0_0_16px_-4px] shadow-current'
        : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.02]'
    }`}
  >
    {/* Color swatches */}
    <div className="flex gap-[2px] flex-shrink-0">
      <div className="w-5 h-8 rounded-l-md transition-transform group-hover:scale-105" style={{ backgroundColor: preset.bg }} />
      <div className="w-5 h-8 transition-transform group-hover:scale-105" style={{ backgroundColor: preset.surface }} />
      <div className="w-5 h-8 rounded-r-md transition-transform group-hover:scale-105" style={{ backgroundColor: preset.brandColor }} />
    </div>
    <span className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors flex-1 min-w-0">
      {preset.label}
    </span>
    {active && (
      <div
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: preset.brandColor }}
      >
        <Check className="w-3 h-3 text-white" />
      </div>
    )}
  </button>
);

/* ── Mini preview card ───────────────────────────────────────────────────────── */

const MiniMenuPreview: React.FC<{
  theme: ThemePreset;
  customization: CustomizationState;
}> = ({ theme, customization }) => {
  const radius = radiusMap[customization.cardRadius];
  const gap = spacingMap[customization.spacing];
  const heroH = heroHeightMap[customization.heroSize];
  const fw = fontWeightMap[customization.fontWeight];
  const isGrid = customization.cardLayout === 'grid';
  const isHorizontal = customization.cardStyle === 'horizontal';

  const Card = ({ name, price, desc, wide }: { name: string; price: string; desc?: string; wide?: boolean }) => (
    <div
      className="flex overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: theme.surface,
        borderRadius: radius,
        flexDirection: isHorizontal ? 'row' : 'column',
        width: wide && !isGrid ? '100%' : undefined,
      }}
    >
      {/* Image placeholder */}
      <div
        className="flex-shrink-0 relative overflow-hidden"
        style={{
          width: isHorizontal ? (isGrid ? 80 : 110) : '100%',
          height: isHorizontal ? (isGrid ? 80 : 90) : 70,
          background: `linear-gradient(135deg, ${theme.bg}, ${theme.surface})`,
          borderRadius: radius,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.brandColor + '40'} strokeWidth="1.5">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M8 2v6M21 15V2c-2 0-4 1.5-4 5s2 5 4 5M8 11v11M21 15v7" />
          </svg>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 p-2.5 flex flex-col justify-center min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <span
            className="text-[10px] truncate"
            style={{ color: '#e4e4e7', fontWeight: fw }}
          >
            {name}
          </span>
          <span className="text-[9px] font-semibold flex-shrink-0" style={{ color: theme.brandColor }}>
            {price}
          </span>
        </div>
        {desc && (
          <span className="text-[8px] mt-0.5 truncate" style={{ color: 'rgba(161,161,170,0.6)' }}>
            {desc}
          </span>
        )}
        <div className="flex gap-1 mt-1">
          <span className="inline-block px-1.5 py-[1px] rounded text-[7px]" style={{ backgroundColor: theme.brandColor + '15', color: theme.brandColor + '90' }}>
            Popular
          </span>
          <span className="inline-block w-6 h-[3px] rounded-full mt-1" style={{ backgroundColor: theme.brandColor + '12' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 select-none"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Mini hero */}
      <div
        className="relative overflow-hidden transition-all duration-300"
        style={{
          height: heroH,
          background: `linear-gradient(180deg, ${theme.surface} 0%, ${theme.bg} 100%)`,
        }}
      >
        {/* Restaurant name */}
        <div className="absolute bottom-3 left-3">
          <div className="text-[8px] uppercase tracking-[0.15em] mb-0.5" style={{ color: theme.brandColor + '80' }}>
            Contemporary European
          </div>
          <div className="text-sm font-bold text-white" style={{ fontWeight: fw > 400 ? 700 : 500 }}>
            Restaurant Menu
          </div>
          <div className="flex gap-1 mt-1">
            <span className="text-[7px] px-1 py-[1px] rounded-sm" style={{ backgroundColor: theme.brandColor + '20', color: theme.brandColor }}>
              Open now
            </span>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-3 py-2 border-b" style={{ borderColor: theme.surface }}>
        <span
          className="text-[8px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: theme.brandColor + '20', color: theme.brandColor }}
        >
          Starters
        </span>
        <span className="text-[8px] px-2 py-0.5 text-zinc-500">Mains</span>
        <span className="text-[8px] px-2 py-0.5 text-zinc-500">Desserts</span>
      </div>

      {/* Cards grid */}
      <div
        className="p-3 transition-all duration-300"
        style={{
          display: 'grid',
          gridTemplateColumns: isGrid ? 'repeat(2, 1fr)' : '1fr',
          gap,
        }}
      >
        <Card name="Truffle Arancini" price="$14" desc="Crispy risotto balls with black truffle" />
        <Card name="Tuna Tartare" price="$18" desc="Fresh ahi tuna with citrus ponzu" />
        <Card name="Caesar Salad" price="$12" desc="Romaine, croutons, parmesan" wide />
        {isGrid && <Card name="Soup du Jour" price="$10" desc="Chef's daily selection" />}
      </div>
    </div>
  );
};

/* ── Main component ──────────────────────────────────────────────────────────── */

const MenuEditorPage: React.FC = () => {
  const { t } = useTranslation();
  const { projects } = usePortalContext();

  const project = useMemo(
    () => projects.find((p) => p.status === ProjectStatus.Delivered) ?? projects[0],
    [projects],
  );
  const projectId = project?.id ?? '';

  // Customization state
  const [customization, setCustomization] = useState<CustomizationState>(
    () => ({ ...DEFAULT_CUSTOMIZATION }),
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // Org ID — must match RestaurantMenu.tsx's key format
  const { user } = useAuth();
  const orgId = user?.orgId ?? 'org-001';
  const { presets, activePresetId, loadPreset } =
    useLayoutPresets(orgId, projectId);

  // Load saved customization from localStorage
  useEffect(() => {
    if (!projectId) return;
    try {
      const raw = localStorage.getItem(`mc3d_menu_${orgId}_${projectId}`);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.customization) {
          setCustomization({ ...DEFAULT_CUSTOMIZATION, ...data.customization });
        }
      }
    } catch {
      // ignore
    }
  }, [projectId]);

  // Write customization to localStorage
  const persistToLocalStorage = useCallback(
    (state: CustomizationState) => {
      if (!projectId) return;
      try {
        const key = `mc3d_menu_${orgId}_${projectId}`;
        const raw = localStorage.getItem(key);
        const existing = raw ? JSON.parse(raw) : {};
        existing.customization = state;
        localStorage.setItem(key, JSON.stringify(existing));
      } catch {
        // ignore
      }
    },
    [projectId],
  );

  // Change handler
  const handleChange = useCallback(
    (patch: Partial<CustomizationState>) => {
      setCustomization((prev) => {
        const next = { ...prev, ...patch };
        persistToLocalStorage(next);
        return next;
      });
      setSaved(false);
      setDirty(true);
    },
    [persistToLocalStorage],
  );

  // Save
  const handleSave = useCallback(() => {
    if (!projectId) return;
    setSaving(true);
    persistToLocalStorage(customization);
    setSaved(true);
    setDirty(false);
    setTimeout(() => {
      setSaved(false);
      setSaving(false);
    }, 1500);
  }, [projectId, customization, persistToLocalStorage]);

  // Load preset
  const handleLoadPreset = useCallback(
    (presetId: string) => {
      const loaded = loadPreset(presetId);
      if (loaded) {
        setCustomization(loaded);
        setSaved(false);
      }
    },
    [loadPreset],
  );

  // Active theme (use hovered for preview when hovering)
  const activeTheme = useMemo(() => {
    const themeId = hoveredTheme ?? customization.themePreset;
    if (!hoveredTheme && customization.customBrandColor) {
      return {
        ...THEME_PRESETS[0],
        brandColor: customization.customBrandColor,
      };
    }
    return THEME_PRESETS.find((t) => t.id === themeId) ?? THEME_PRESETS[0];
  }, [customization.themePreset, customization.customBrandColor, hoveredTheme]);

  // Preview customization (swap theme when hovering)
  const previewCustomization = useMemo(() => {
    if (hoveredTheme) return { ...customization, themePreset: hoveredTheme, customBrandColor: '' };
    return customization;
  }, [customization, hoveredTheme]);

  const previewUrl = projectId ? `/project/${projectId}/menu` : '';

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Paintbrush className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Menu Editor</h1>
            <p className="text-sm text-zinc-500">Customize your menu appearance</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-zinc-500">No projects found. Create a project first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: activeTheme.brandColor + '15' }}
          >
            <Paintbrush className="w-5 h-5 transition-colors duration-300" style={{ color: activeTheme.brandColor }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {t('portal.tab.menuEditor', 'Menu Editor')}
            </h1>
            <p className="text-sm text-zinc-500">
              {project.name} &mdash; Customize appearance &amp; layout
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 border border-white/[0.06] hover:border-white/[0.12] hover:text-zinc-300 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              View live menu
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="relative inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60 shadow-lg"
            style={{
              backgroundColor: saved ? '#059669' : activeTheme.brandColor,
              boxShadow: `0 4px 24px -4px ${saved ? '#05966940' : activeTheme.brandColor + '40'}`,
            }}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Saved!' : 'Save Changes'}
            {dirty && !saved && !saving && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeTheme.brandColor }} />
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: activeTheme.brandColor }} />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex gap-5 items-start">
        {/* Controls Panel */}
        <div className="w-[340px] flex-shrink-0 bg-zinc-900/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Theme */}
          <Section title="Theme">
            <div className="space-y-1">
              {THEME_PRESETS.map((preset) => (
                <ThemeSwatch
                  key={preset.id}
                  preset={preset}
                  active={customization.themePreset === preset.id && !customization.customBrandColor}
                  onClick={() => handleChange({ themePreset: preset.id, customBrandColor: '' })}
                  onHover={setHoveredTheme}
                />
              ))}
            </div>
            <div className="pt-2 flex items-center gap-3">
              <span className="text-[11px] font-medium text-zinc-500">Custom</span>
              <div className="relative">
                <input
                  type="color"
                  value={customization.customBrandColor || activeTheme.brandColor}
                  onChange={(e) => handleChange({ customBrandColor: e.target.value })}
                  className="w-7 h-7 rounded-lg border border-white/[0.1] cursor-pointer bg-transparent"
                />
              </div>
              {customization.customBrandColor && (
                <span className="text-[10px] text-zinc-600 font-mono">
                  {customization.customBrandColor}
                </span>
              )}
            </div>
          </Section>

          {/* Layout */}
          <Section title="Layout">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-600 mb-1.5">Grid</p>
              <div className="flex gap-1.5">
                <OptionBtn
                  active={customization.cardLayout === 'grid'}
                  onClick={() => handleChange({ cardLayout: 'grid' as CardLayout })}
                  icon={<LayoutGrid className="w-3 h-3" />}
                  label="Grid"
                  brandColor={activeTheme.brandColor}
                />
                <OptionBtn
                  active={customization.cardLayout === 'single'}
                  onClick={() => handleChange({ cardLayout: 'single' as CardLayout })}
                  icon={<Rows3 className="w-3 h-3" />}
                  label="List"
                  brandColor={activeTheme.brandColor}
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-600 mb-1.5">Card style</p>
              <div className="flex gap-1.5">
                <OptionBtn
                  active={customization.cardStyle === 'horizontal'}
                  onClick={() => handleChange({ cardStyle: 'horizontal' as CardStyle })}
                  icon={<Columns3 className="w-3 h-3" />}
                  label="Horizontal"
                  brandColor={activeTheme.brandColor}
                />
                <OptionBtn
                  active={customization.cardStyle === 'stacked'}
                  onClick={() => handleChange({ cardStyle: 'stacked' as CardStyle })}
                  icon={<Rows3 className="w-3 h-3" />}
                  label="Stacked"
                  brandColor={activeTheme.brandColor}
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-600 mb-1.5">Corners</p>
              <div className="flex gap-1.5">
                <OptionBtn
                  active={customization.cardRadius === 'sharp'}
                  onClick={() => handleChange({ cardRadius: 'sharp' as CardRadius })}
                  icon={<Square className="w-3 h-3" />}
                  label="Sharp"
                  brandColor={activeTheme.brandColor}
                />
                <OptionBtn
                  active={customization.cardRadius === 'rounded'}
                  onClick={() => handleChange({ cardRadius: 'rounded' as CardRadius })}
                  icon={<RectangleHorizontal className="w-3 h-3" />}
                  label="Rounded"
                  brandColor={activeTheme.brandColor}
                />
                <OptionBtn
                  active={customization.cardRadius === 'pill'}
                  onClick={() => handleChange({ cardRadius: 'pill' as CardRadius })}
                  icon={<Pill className="w-3 h-3" />}
                  label="Pill"
                  brandColor={activeTheme.brandColor}
                />
              </div>
            </div>
          </Section>

          {/* Spacing & Size */}
          <Section title="Spacing & Size">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-600 mb-1.5">Density</p>
              <div className="flex gap-1.5">
                <OptionBtn
                  active={customization.spacing === 'compact'}
                  onClick={() => handleChange({ spacing: 'compact' as MenuSpacing })}
                  icon={<Minus className="w-3 h-3" />}
                  label="Compact"
                  brandColor={activeTheme.brandColor}
                />
                <OptionBtn
                  active={customization.spacing === 'default'}
                  onClick={() => handleChange({ spacing: 'default' as MenuSpacing })}
                  icon={<Equal className="w-3 h-3" />}
                  label="Default"
                  brandColor={activeTheme.brandColor}
                />
                <OptionBtn
                  active={customization.spacing === 'spacious'}
                  onClick={() => handleChange({ spacing: 'spacious' as MenuSpacing })}
                  icon={<AlignVerticalSpaceAround className="w-3 h-3" />}
                  label="Spacious"
                  brandColor={activeTheme.brandColor}
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-600 mb-1.5">Hero banner</p>
              <div className="flex gap-1.5">
                {(['short', 'default', 'tall'] as HeroSize[]).map((s) => (
                  <OptionBtn
                    key={s}
                    active={customization.heroSize === s}
                    onClick={() => handleChange({ heroSize: s })}
                    label={s.charAt(0).toUpperCase() + s.slice(1)}
                    brandColor={activeTheme.brandColor}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-600 mb-1.5">Font weight</p>
              <div className="flex gap-1.5">
                {(['light', 'default', 'bold'] as FontWeight[]).map((w) => (
                  <OptionBtn
                    key={w}
                    active={customization.fontWeight === w}
                    onClick={() => handleChange({ fontWeight: w })}
                    icon={<Type className="w-3 h-3" />}
                    label={w.charAt(0).toUpperCase() + w.slice(1)}
                    brandColor={activeTheme.brandColor}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* Saved Presets */}
          {presets.length > 0 && (
            <Section title="Saved Presets" defaultOpen={false}>
              <div className="space-y-1">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleLoadPreset(p.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                      activePresetId === p.id
                        ? 'border-white/20 bg-white/[0.04] text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Reset */}
          <div className="px-5 py-3 border-t border-white/[0.04]">
            <button
              onClick={() => handleChange({ ...DEFAULT_CUSTOMIZATION })}
              className="flex items-center gap-2 text-[11px] font-medium text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to defaults
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="flex-1 min-w-0 sticky top-4">
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
            {/* Preview chrome bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.12em]">
                  Live Preview
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
            </div>

            {/* Preview body */}
            <div className="p-5 flex items-start justify-center">
              {/* Phone-ish frame */}
              <div className="w-full max-w-[480px]">
                {/* URL bar mockup */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-t-xl border border-b-0"
                  style={{
                    backgroundColor: activeTheme.surface,
                    borderColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                  <span className="text-[10px] text-zinc-500 font-mono truncate">
                    3dempyre.com/project/{projectId}/menu
                  </span>
                </div>

                {/* Mini menu preview */}
                <div
                  className="border border-t-0 rounded-b-xl overflow-hidden transition-all duration-300"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <MiniMenuPreview
                    theme={activeTheme}
                    customization={previewCustomization}
                  />
                </div>

                {/* Hint text */}
                <p className="text-center mt-3 text-[10px] text-zinc-600">
                  Changes apply instantly to your live menu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuEditorPage;
