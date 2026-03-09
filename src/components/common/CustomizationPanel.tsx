import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Paintbrush, ChevronUp, ChevronDown, X, Loader2, Wand2, Sparkles,
  LayoutGrid, Rows3, Columns3, Minus, Equal, AlignVerticalSpaceAround,
  ImagePlus, RotateCcw, FolderOpen, Save, Trash2, Bookmark,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CardLayout = 'grid' | 'single';
export type CardStyle = 'horizontal' | 'stacked';
export type MenuSpacing = 'compact' | 'default' | 'spacious';
export type HeroSize = 'short' | 'default' | 'tall';
export type FontWeight = 'light' | 'default' | 'bold';
export type CardRadius = 'sharp' | 'rounded' | 'pill';

export interface ThemePreset {
  id: string;
  label: string;
  brandColor: string;
  bg: string;
  surface: string;
  accent: string;
}

export interface CustomizationState {
  themePreset: string;
  customBrandColor: string;
  cardLayout: CardLayout;
  cardStyle: CardStyle;
  spacing: MenuSpacing;
  heroSize: HeroSize;
  heroImage: string;
  fontWeight: FontWeight;
  cardRadius: CardRadius;
}

export interface SavedLayoutPreset {
  id: string;
  name: string;
  state: CustomizationState;
  createdAt: string;
  updatedAt: string;
}

export interface SavedLayoutPresetsStore {
  presets: SavedLayoutPreset[];
  activePresetId: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'amber', label: 'Warm Amber', brandColor: '#d97706', bg: '#09090b', surface: '#18181b', accent: '#fbbf24' },
  { id: 'slate', label: 'Cool Slate', brandColor: '#6366f1', bg: '#0f172a', surface: '#1e293b', accent: '#818cf8' },
  { id: 'emerald', label: 'Emerald', brandColor: '#059669', bg: '#022c22', surface: '#064e3b', accent: '#34d399' },
  { id: 'rose', label: 'Rose', brandColor: '#e11d48', bg: '#0c0a09', surface: '#1c1917', accent: '#fb7185' },
  { id: 'purple', label: 'Royal', brandColor: '#7c3aed', bg: '#0a0015', surface: '#1a0a2e', accent: '#a78bfa' },
];

export const DEFAULT_CUSTOMIZATION: CustomizationState = {
  themePreset: 'amber',
  customBrandColor: '',
  cardLayout: 'grid',
  cardStyle: 'horizontal',
  spacing: 'default',
  heroSize: 'default',
  heroImage: '',
  fontWeight: 'default',
  cardRadius: 'rounded',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

export function extractDominantColor(imageUrl: string): Promise<{ r: number; g: number; b: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
        count++;
      }
      resolve({ r: Math.round(rSum / count), g: Math.round(gSum / count), b: Math.round(bSum / count) });
    };
    img.onerror = () => resolve({ r: 128, g: 128, b: 128 });
    img.src = imageUrl;
  });
}

export function suggestLayoutFromColor(color: { r: number; g: number; b: number }): Partial<CustomizationState> {
  const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
  let bestPreset = THEME_PRESETS[0];
  let bestDist = Infinity;
  for (const preset of THEME_PRESETS) {
    const pRgb = hexToRgb(preset.brandColor);
    const pHsl = rgbToHsl(pRgb.r, pRgb.g, pRgb.b);
    const hueDist = Math.min(Math.abs(h - pHsl.h), 360 - Math.abs(h - pHsl.h));
    const dist = hueDist + (s < 0.1 ? 50 : 0);
    if (dist < bestDist) { bestDist = dist; bestPreset = preset; }
  }
  const isDark = l < 0.35;
  const isWarm = (h >= 0 && h <= 60) || h >= 330;
  return {
    themePreset: bestPreset.id,
    heroSize: isDark ? 'tall' : 'default',
    spacing: isDark ? 'spacious' : 'default',
    fontWeight: isDark ? 'light' : 'default',
    cardStyle: isWarm ? 'stacked' : 'horizontal',
    cardRadius: isWarm ? 'rounded' : 'pill',
    cardLayout: 'grid',
  };
}

// ─── Preset Storage ──────────────────────────────────────────────────────────

const PRESETS_STORAGE_KEY = (orgId: string, projectId: string) =>
  `mc3d_layout_presets_${orgId}_${projectId}`;

function loadPresetsFromStorage(orgId: string, projectId: string): SavedLayoutPresetsStore {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY(orgId, projectId));
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { presets: [], activePresetId: null };
}

function savePresetsToStorage(orgId: string, projectId: string, store: SavedLayoutPresetsStore): void {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY(orgId, projectId), JSON.stringify(store));
  } catch { /* full */ }
}

export function useLayoutPresets(orgId: string, projectId: string | undefined) {
  const [presetsStore, setPresetsStore] = useState<SavedLayoutPresetsStore>(() =>
    projectId ? loadPresetsFromStorage(orgId, projectId) : { presets: [], activePresetId: null }
  );

  useEffect(() => {
    if (projectId) setPresetsStore(loadPresetsFromStorage(orgId, projectId));
  }, [orgId, projectId]);

  useEffect(() => {
    if (projectId) savePresetsToStorage(orgId, projectId, presetsStore);
  }, [presetsStore, orgId, projectId]);

  const savePreset = useCallback((name: string, state: CustomizationState): SavedLayoutPreset => {
    const now = new Date().toISOString();
    const preset: SavedLayoutPreset = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      name,
      state,
      createdAt: now,
      updatedAt: now,
    };
    setPresetsStore((prev) => ({
      presets: [...prev.presets, preset],
      activePresetId: preset.id,
    }));
    return preset;
  }, []);

  const loadPreset = useCallback((presetId: string): CustomizationState | null => {
    const found = presetsStore.presets.find((p) => p.id === presetId);
    if (!found) return null;
    setPresetsStore((prev) => ({ ...prev, activePresetId: presetId }));
    return found.state;
  }, [presetsStore.presets]);

  const deletePreset = useCallback((presetId: string) => {
    setPresetsStore((prev) => ({
      presets: prev.presets.filter((p) => p.id !== presetId),
      activePresetId: prev.activePresetId === presetId ? null : prev.activePresetId,
    }));
  }, []);

  const updatePreset = useCallback((presetId: string, state: CustomizationState) => {
    setPresetsStore((prev) => ({
      ...prev,
      presets: prev.presets.map((p) =>
        p.id === presetId ? { ...p, state, updatedAt: new Date().toISOString() } : p
      ),
    }));
  }, []);

  return { presets: presetsStore.presets, activePresetId: presetsStore.activePresetId, savePreset, loadPreset, deletePreset, updatePreset };
}

// ─── Resolve Theme ───────────────────────────────────────────────────────────

export function resolveTheme(state: CustomizationState): ThemePreset {
  const base = THEME_PRESETS.find((t) => t.id === state.themePreset) ?? THEME_PRESETS[0];
  if (state.customBrandColor) {
    const rgb = hexToRgb(state.customBrandColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const h = Math.round(hsl.h);
    const s = Math.round(hsl.s * 100);
    return {
      ...base,
      brandColor: state.customBrandColor,
      bg: `hsl(${h}, ${Math.min(s, 30)}%, 4%)`,
      surface: `hsl(${h}, ${Math.min(s, 25)}%, 10%)`,
      accent: state.customBrandColor,
    };
  }
  return base;
}

// ─── Panel Component ─────────────────────────────────────────────────────────

export interface CustomizationPanelProps {
  state: CustomizationState;
  onChange: (patch: Partial<CustomizationState>) => void;
  isOpen: boolean;
  onClose: () => void;
  presets: SavedLayoutPreset[];
  activePresetId: string | null;
  onSavePreset: (name: string) => void;
  onLoadPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  onUpdatePreset: (presetId: string) => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = React.memo(({ state, onChange, isOpen, onClose, presets, activePresetId, onSavePreset, onLoadPreset, onDeletePreset, onUpdatePreset }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [hoveredTheme, _setHoveredTheme] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [autoStyling, setAutoStyling] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const currentTheme = resolveTheme(state);
  const previewTheme = hoveredTheme ? (THEME_PRESETS.find((t) => t.id === hoveredTheme) ?? currentTheme) : currentTheme;

  const isDefault = JSON.stringify(state) === JSON.stringify(DEFAULT_CUSTOMIZATION);

  const SegmentButton = ({
    active,
    onClick,
    children,
    title,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${active
        ? 'text-white shadow-lg'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
        }`}
      style={active ? { backgroundColor: currentTheme.brandColor, boxShadow: `0 4px 14px -3px ${currentTheme.brandColor}50` } : undefined}
    >
      {children}
    </button>
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed bottom-6 right-6 w-[340px] rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-2xl overflow-hidden"
      style={{
        zIndex: 9999,
        backgroundColor: `${previewTheme.surface}f2`,
        animation: 'customizer-slide-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        border: `1px solid ${currentTheme.brandColor}18`,
      }}
    >
      <style>{`
        @keyframes customizer-slide-in {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes customizer-glow {
          0%, 100% { box-shadow: 0 0 24px -6px ${currentTheme.brandColor}20, 0 20px 50px -12px rgba(0,0,0,0.6); }
          50% { box-shadow: 0 0 32px -4px ${currentTheme.brandColor}30, 0 20px 50px -12px rgba(0,0,0,0.6); }
        }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/5"
        style={{ background: `linear-gradient(90deg, ${currentTheme.brandColor}08, transparent)` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${currentTheme.brandColor}18` }}
          >
            <Paintbrush className="w-4 h-4" style={{ color: currentTheme.brandColor }} />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block leading-tight">Customize</span>
            <span className="text-[10px] text-zinc-500 leading-tight">Appearance & layout</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsMinimized((v) => !v)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
            aria-label={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="p-4 space-y-5 max-h-[65vh] overflow-y-auto scrollbar-thin">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Adjust how your menu looks to customers. Changes preview live. Save a named layout preset below to keep your settings.
          </p>

          {/* AI Auto-Style from Image */}
          {state.heroImage && (
            <button
              onClick={async () => {
                setAutoStyling(true);
                try {
                  const color = await extractDominantColor(state.heroImage);
                  const suggestion = suggestLayoutFromColor(color);
                  await new Promise((r) => setTimeout(r, 800));
                  onChange(suggestion);
                } finally {
                  setAutoStyling(false);
                }
              }}
              disabled={autoStyling}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.brandColor}, #7c3aed)`,
                boxShadow: `0 4px 20px -4px ${currentTheme.brandColor}40`,
              }}
            >
              {autoStyling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing image...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Auto-Style from Image
                  <Sparkles className="w-3 h-3 opacity-60" />
                </>
              )}
            </button>
          )}

          {/* Theme Presets with Mini Preview */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Theme
              </label>
              <span className="text-[10px] text-zinc-500 font-medium transition-all duration-200">
                {(hoveredTheme ? THEME_PRESETS.find((t) => t.id === hoveredTheme)?.label : currentTheme.label) ?? ''}
              </span>
            </div>

            {/* Mini preview card */}
            <div
              className="mb-3 rounded-xl p-3 border border-white/5 transition-all duration-500 overflow-hidden"
              style={{ backgroundColor: `${previewTheme.bg}cc` }}
            >
              <div className="flex gap-2.5 items-center">
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0 transition-all duration-500"
                  style={{
                    backgroundColor: previewTheme.surface,
                    backgroundImage: `linear-gradient(135deg, ${previewTheme.brandColor}30, transparent)`,
                  }}
                />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-2 rounded-full w-3/4 transition-all duration-500"
                    style={{ backgroundColor: `${previewTheme.accent}50` }}
                  />
                  <div
                    className="h-1.5 rounded-full w-1/2 transition-all duration-500"
                    style={{ backgroundColor: `${previewTheme.surface}90` }}
                  />
                </div>
                <div
                  className="w-8 h-5 rounded-md text-[8px] font-bold flex items-center justify-center text-white/90 transition-all duration-500"
                  style={{ backgroundColor: previewTheme.brandColor }}
                >
                  3D
                </div>
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="mt-3">
              <label className="text-[10px] font-medium text-zinc-500 mb-1.5 block">Custom Color</label>
              <label className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-2 py-1 cursor-pointer hover:border-white/15 transition-colors">
                <input
                  type="color"
                  value={state.customBrandColor || currentTheme.brandColor}
                  onChange={(e) => {
                    onChange({ customBrandColor: e.target.value });
                  }}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-none appearance-none"
                />
                <span className="text-xs font-mono text-zinc-400">{state.customBrandColor || currentTheme.brandColor}</span>
              </label>
            </div>
          </div>

          {/* Card Layout */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
              Layout
            </label>
            <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
              <SegmentButton
                active={state.cardLayout === 'grid'}
                onClick={() => onChange({ cardLayout: 'grid' })}
                title="Two columns"
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid
              </SegmentButton>
              <SegmentButton
                active={state.cardLayout === 'single'}
                onClick={() => onChange({ cardLayout: 'single' })}
                title="Single column"
              >
                <Rows3 className="w-3.5 h-3.5" /> List
              </SegmentButton>
            </div>
          </div>

          {/* Card Style */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
              Card Style
            </label>
            <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
              <SegmentButton
                active={state.cardStyle === 'horizontal'}
                onClick={() => onChange({ cardStyle: 'horizontal' })}
                title="Side-by-side image and text"
              >
                <Columns3 className="w-3.5 h-3.5" /> Row
              </SegmentButton>
              <SegmentButton
                active={state.cardStyle === 'stacked'}
                onClick={() => onChange({ cardStyle: 'stacked' })}
                title="Image on top, text below"
              >
                <Rows3 className="w-3.5 h-3.5" /> Stacked
              </SegmentButton>
            </div>
          </div>

          {/* Card Radius */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
              Corners
            </label>
            <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
              <SegmentButton
                active={state.cardRadius === 'sharp'}
                onClick={() => onChange({ cardRadius: 'sharp' })}
              >
                <div className="w-3.5 h-3.5 border-2 border-current rounded-none" /> Sharp
              </SegmentButton>
              <SegmentButton
                active={state.cardRadius === 'rounded'}
                onClick={() => onChange({ cardRadius: 'rounded' })}
              >
                <div className="w-3.5 h-3.5 border-2 border-current rounded-lg" /> Rounded
              </SegmentButton>
              <SegmentButton
                active={state.cardRadius === 'pill'}
                onClick={() => onChange({ cardRadius: 'pill' })}
              >
                <div className="w-3.5 h-3.5 border-2 border-current rounded-full" /> Pill
              </SegmentButton>
            </div>
          </div>

          {/* Spacing */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
              Spacing
            </label>
            <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
              <SegmentButton
                active={state.spacing === 'compact'}
                onClick={() => onChange({ spacing: 'compact' })}
              >
                <Minus className="w-3.5 h-3.5" /> Tight
              </SegmentButton>
              <SegmentButton
                active={state.spacing === 'default'}
                onClick={() => onChange({ spacing: 'default' })}
              >
                <Equal className="w-3.5 h-3.5" /> Default
              </SegmentButton>
              <SegmentButton
                active={state.spacing === 'spacious'}
                onClick={() => onChange({ spacing: 'spacious' })}
              >
                <AlignVerticalSpaceAround className="w-3.5 h-3.5" /> Airy
              </SegmentButton>
            </div>
          </div>

          {/* Hero Size */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
              Hero Banner
            </label>
            <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
              <SegmentButton
                active={state.heroSize === 'short'}
                onClick={() => onChange({ heroSize: 'short' })}
              >
                Short
              </SegmentButton>
              <SegmentButton
                active={state.heroSize === 'default'}
                onClick={() => onChange({ heroSize: 'default' })}
              >
                Default
              </SegmentButton>
              <SegmentButton
                active={state.heroSize === 'tall'}
                onClick={() => onChange({ heroSize: 'tall' })}
              >
                Tall
              </SegmentButton>
            </div>
            {/* Hero Image */}
            <div className="mt-3">
              <label className="text-[10px] font-medium text-zinc-500 mb-1.5 block">Hero Image</label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="hero-image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onChange({ heroImage: url });
                  }
                  e.target.value = '';
                }}
              />
              {state.heroImage ? (
                <div className="flex items-center gap-2">
                  <img src={state.heroImage} alt="Hero preview" className="w-12 h-8 rounded-lg object-cover border border-white/10" />
                  <button
                    type="button"
                    onClick={() => document.getElementById('hero-image-upload')?.click()}
                    className="text-[10px] font-medium text-zinc-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ heroImage: '' })}
                    className="text-[10px] font-medium text-zinc-500 hover:text-red-400 px-2 py-1 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/5 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => document.getElementById('hero-image-upload')?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-white/10 rounded-xl text-[11px] font-medium text-zinc-500 hover:border-white/20 hover:text-zinc-300 hover:bg-white/[0.02] transition-colors"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Upload image
                </button>
              )}
            </div>
          </div>

          {/* Font Weight */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
              Typography
            </label>
            <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
              <SegmentButton
                active={state.fontWeight === 'light'}
                onClick={() => onChange({ fontWeight: 'light' })}
              >
                <span className="font-light">Light</span>
              </SegmentButton>
              <SegmentButton
                active={state.fontWeight === 'default'}
                onClick={() => onChange({ fontWeight: 'default' })}
              >
                <span className="font-medium">Medium</span>
              </SegmentButton>
              <SegmentButton
                active={state.fontWeight === 'bold'}
                onClick={() => onChange({ fontWeight: 'bold' })}
              >
                <span className="font-black">Heavy</span>
              </SegmentButton>
            </div>
          </div>

          {/* Reset */}
          {!isDefault && (
            <button
              onClick={() => onChange({ ...DEFAULT_CUSTOMIZATION })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 border border-white/5 hover:border-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults
            </button>
          )}

          {/* ── Saved Layouts ── */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Saved Layouts
              </label>
              <span className="text-[10px] text-zinc-500 font-medium">
                {presets.length} saved
              </span>
            </div>

            {presets.length > 0 && (
              <div className="space-y-1.5 mb-3 max-h-[140px] overflow-y-auto scrollbar-thin">
                {presets.map((preset) => {
                  const isActive = activePresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${isActive
                        ? 'bg-white/10 border border-white/10'
                        : 'bg-white/[0.03] border border-transparent hover:border-white/5'
                        }`}
                    >
                      {isActive && (
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: currentTheme.brandColor }}
                        />
                      )}
                      <span className="flex-1 text-zinc-300 truncate font-medium">{preset.name}</span>
                      <button
                        onClick={() => onLoadPreset(preset.id)}
                        className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                        title="Load this layout"
                      >
                        <FolderOpen className="w-3 h-3" />
                      </button>
                      {isActive && (
                        <button
                          onClick={() => onUpdatePreset(preset.id)}
                          className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                          title="Update with current settings"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-white/5"
                        title="Delete preset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Save new preset */}
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Preset name..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                maxLength={30}
                className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/15 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPresetName.trim()) {
                    onSavePreset(newPresetName.trim());
                    setNewPresetName('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newPresetName.trim()) {
                    onSavePreset(newPresetName.trim());
                    setNewPresetName('');
                  }
                }}
                disabled={!newPresetName.trim()}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: newPresetName.trim() ? currentTheme.brandColor : undefined, color: newPresetName.trim() ? '#fff' : undefined }}
                title="Save current layout as preset"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
});
CustomizationPanel.displayName = 'CustomizationPanel';
