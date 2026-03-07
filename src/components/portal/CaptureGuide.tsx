/**
 * CaptureGuide - Visual capture guidance for food photogrammetry
 *
 * Shows ring-shot protocol visualization, cross-polarization setup,
 * and an interactive pre-capture checklist. Based on the food-specific
 * photogrammetry research document.
 */
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  CheckSquare,
  Square,
  Sun,
  Aperture,
  RotateCw,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Target,
  Palette,
} from 'lucide-react';
import type { CaptureChecklistItem, ElevationRing } from '@/types/photogrammetry';

// ============================================================================
// CONSTANTS
// ============================================================================

const RING_SHOT_PROTOCOL: ElevationRing[] = [
  { angle_degrees: 15, shots_per_ring: 24, label: 'Low Angle' },
  { angle_degrees: 35, shots_per_ring: 24, label: 'Eye Level' },
  { angle_degrees: 55, shots_per_ring: 24, label: 'High Angle' },
  { angle_degrees: 75, shots_per_ring: 12, label: 'Top-Down' },
];

const CAPTURE_CHECKLIST: CaptureChecklistItem[] = [
  // Hardware
  {
    id: 'hw-1',
    category: 'hardware',
    label: 'Camera mounted on tripod/rig',
    description: 'Stable mount prevents motion blur. Use a ball head for angle adjustment.',
    is_critical: true,
  },
  {
    id: 'hw-2',
    category: 'hardware',
    label: 'Turntable centered and level',
    description: 'Motorized turntable at 0.5-1 RPM. Ensure it is level with a bubble level.',
    is_critical: true,
  },
  {
    id: 'hw-3',
    category: 'hardware',
    label: 'Tracking markers placed (if needed)',
    description: 'For low-texture foods (e.g. white rice, smooth soup), add small coded markers around the turntable.',
    is_critical: false,
  },
  // Lighting
  {
    id: 'lt-1',
    category: 'lighting',
    label: 'Cross-polarization filters installed',
    description: 'Linear polarizing film on lights + CPL on lens, oriented at 90° cross to suppress specular glare.',
    is_critical: true,
  },
  {
    id: 'lt-2',
    category: 'lighting',
    label: 'Even diffused lighting (2+ softboxes)',
    description: 'Use 2-4 softboxes at 5500K for even illumination. Avoid hard shadows.',
    is_critical: true,
  },
  {
    id: 'lt-3',
    category: 'lighting',
    label: 'Ambient light controlled',
    description: 'Block windows and overhead lights. Only controlled studio lighting should be active.',
    is_critical: false,
  },
  // Camera Settings
  {
    id: 'cam-1',
    category: 'camera',
    label: 'Shoot RAW (14-bit)',
    description: 'RAW gives maximum latitude for color correction and white balance adjustment.',
    is_critical: true,
  },
  {
    id: 'cam-2',
    category: 'camera',
    label: 'Manual exposure (f/8-f/11, ISO 100)',
    description: 'f/8-f/11 for sharpness sweet spot. ISO 100 minimizes noise. Shutter speed from metering.',
    is_critical: true,
  },
  {
    id: 'cam-3',
    category: 'camera',
    label: 'White balance set to 5500K (fixed)',
    description: 'Never use auto WB. Set a custom Kelvin value matching your lights to prevent drift.',
    is_critical: true,
  },
  {
    id: 'cam-4',
    category: 'camera',
    label: 'Focus fixed (manual or AF-lock)',
    description: 'Focus on the subject center, then switch to manual focus to prevent refocusing between shots.',
    is_critical: false,
  },
  // Scene
  {
    id: 'sc-1',
    category: 'scene',
    label: 'Color checker card photographed',
    description: 'Shoot an X-Rite ColorChecker at the start for accurate color calibration in post.',
    is_critical: true,
  },
  {
    id: 'sc-2',
    category: 'scene',
    label: 'Clean, non-reflective background',
    description: 'Matte black or matte grey background. No glossy surfaces that cause reflections.',
    is_critical: false,
  },
  // Calibration
  {
    id: 'cal-1',
    category: 'calibration',
    label: 'Scale reference in frame',
    description: 'Include a known-size reference (ruler or calibration cube) for accurate real-world scaling.',
    is_critical: false,
  },
];

const CATEGORY_CONFIG = {
  hardware: { icon: Camera, label: 'Hardware Setup', color: 'text-blue-400' },
  lighting: { icon: Sun, label: 'Lighting', color: 'text-amber-400' },
  camera: { icon: Aperture, label: 'Camera Settings', color: 'text-purple-400' },
  scene: { icon: Target, label: 'Scene Prep', color: 'text-emerald-400' },
  calibration: { icon: Palette, label: 'Calibration', color: 'text-pink-400' },
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

interface CaptureGuideProps {
  variant?: 'full' | 'compact';
  onChecklistComplete?: () => void;
}

export const CaptureGuide: React.FC<CaptureGuideProps> = ({
  variant: _variant = 'full',
  onChecklistComplete,
}) => {
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedSection, setExpandedSection] = useState<string | null>('hardware');
  const [showProtocol, setShowProtocol] = useState(true);

  const totalShots = useMemo(
    () => RING_SHOT_PROTOCOL.reduce((sum, r) => sum + r.shots_per_ring, 0),
    []
  );

  const criticalItems = useMemo(
    () => CAPTURE_CHECKLIST.filter((item) => item.is_critical),
    []
  );

  const allCriticalChecked = useMemo(
    () => criticalItems.every((item) => checkedItems.has(item.id)),
    [criticalItems, checkedItems]
  );

  const checklistProgress = useMemo(() => {
    return Math.round((checkedItems.size / CAPTURE_CHECKLIST.length) * 100);
  }, [checkedItems]);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Check if all critical items done
      if (onChecklistComplete && criticalItems.every((item) => next.has(item.id))) {
        onChecklistComplete();
      }
      return next;
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // Group checklist by category
  const groupedChecklist = useMemo(() => {
    const groups: Record<string, CaptureChecklistItem[]> = {};
    for (const item of CAPTURE_CHECKLIST) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, []);

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* Ring-Shot Protocol Visualization */}
      {/* ================================================================ */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowProtocol(!showProtocol)}
          className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <RotateCw className="w-5 h-5 text-brand-400" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white">
                {t('capture.ringShotProtocol', 'Ring-Shot Capture Protocol')}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {totalShots} {t('capture.totalShots', 'total shots across')} {RING_SHOT_PROTOCOL.length} {t('capture.elevationRings', 'elevation rings')}
              </p>
            </div>
          </div>
          {showProtocol ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {showProtocol && (
          <div className="px-5 pb-5 space-y-5">
            {/* Visual ring diagram */}
            <div className="relative mx-auto w-64 h-64">
              {/* Center subject */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-zinc-700/80 border-2 border-zinc-600 flex items-center justify-center z-10">
                <Layers className="w-6 h-6 text-zinc-400" />
              </div>
              {/* Rings */}
              {RING_SHOT_PROTOCOL.map((ring, index) => {
                const size = 80 + index * 44;
                const _opacity = 0.15 + index * 0.08;
                const borderColor =
                  index === 0
                    ? 'border-blue-500'
                    : index === 1
                      ? 'border-emerald-500'
                      : index === 2
                        ? 'border-amber-500'
                        : 'border-pink-500';
                return (
                  <div
                    key={ring.angle_degrees}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed ${borderColor}`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      opacity: 0.4 + index * 0.15,
                    }}
                  >
                    {/* Camera dots */}
                    {Array.from({ length: Math.min(ring.shots_per_ring, 12) }).map((_, i) => {
                      const angle = (i / Math.min(ring.shots_per_ring, 12)) * 360;
                      const rad = (angle * Math.PI) / 180;
                      const _r = size / 2;
                      return (
                        <div
                          key={`${ring.angle_degrees}-${i}`}
                          className={`absolute w-2 h-2 rounded-full ${borderColor.replace('border-', 'bg-')}`}
                          style={{
                            top: `${50 + Math.sin(rad) * 50}%`,
                            left: `${50 + Math.cos(rad) * 50}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Ring legend */}
            <div className="grid grid-cols-2 gap-2">
              {RING_SHOT_PROTOCOL.map((ring, index) => {
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];
                const textColors = ['text-blue-400', 'text-emerald-400', 'text-amber-400', 'text-pink-400'];
                return (
                  <div
                    key={ring.angle_degrees}
                    className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.06] p-3"
                  >
                    <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                    <div>
                      <p className={`text-xs font-semibold ${textColors[index]}`}>
                        {ring.label}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {ring.angle_degrees}° &middot; {ring.shots_per_ring} shots
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cross-polarization tip */}
            <div className="rounded-lg bg-brand-500/10 border border-brand-500/20 p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-brand-300 mb-1">
                    {t('capture.crossPolTip', '2-Pass Capture for PBR Materials')}
                  </p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {t(
                      'capture.crossPolDesc',
                      'Pass 1: Cross-polarized (CPL at 90° to light polarizers) captures pure diffuse albedo. Pass 2: Normal (no filters) captures specular/roughness info. The difference map generates roughness textures.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* Pre-Capture Checklist */}
      {/* ================================================================ */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {t('capture.preChecklist', 'Pre-Capture Checklist')}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {checkedItems.size}/{CAPTURE_CHECKLIST.length} {t('capture.itemsChecked', 'items checked')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-400">{checklistProgress}%</span>
          </div>
        </div>

        {!allCriticalChecked && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-300">
              {t(
                'capture.criticalWarning',
                'Complete all critical items (marked with !) before starting capture to ensure quality results.'
              )}
            </p>
          </div>
        )}

        {/* Grouped checklist */}
        <div className="space-y-2">
          {Object.entries(groupedChecklist).map(([category, items]) => {
            const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
            const CategoryIcon = config.icon;
            const isExpanded = expandedSection === category;
            const checkedInGroup = items.filter((item) => checkedItems.has(item.id)).length;

            return (
              <div key={category} className="rounded-xl border border-white/[0.06] overflow-hidden">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-xs font-semibold text-white">{config.label}</span>
                    <span className="text-[10px] text-zinc-600">
                      {checkedInGroup}/{items.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-600" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-1">
                    {items.map((item) => {
                      const isChecked = checkedItems.has(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all ${
                            isChecked
                              ? 'bg-emerald-500/10'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-medium ${
                                  isChecked ? 'text-emerald-300 line-through' : 'text-white'
                                }`}
                              >
                                {item.label}
                              </span>
                              {item.is_critical && (
                                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-1 py-0.5 rounded">
                                  !
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CaptureGuide;
