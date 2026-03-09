import React from 'react';

// ─── Tag Styles ──────────────────────────────────────────────────────────────

const TAG_STYLES: Record<string, string> = {
  "Chef's Pick": 'bg-amber-900/40 text-amber-300 border-amber-800/50',
  Bestseller: 'bg-orange-900/40 text-orange-300 border-orange-800/50',
  Vegetarian: 'bg-green-900/40 text-green-300 border-green-800/50',
  Shareable: 'bg-sky-900/40 text-sky-300 border-sky-800/50',
  Premium: 'bg-purple-900/40 text-purple-300 border-purple-800/50',
  Seasonal: 'bg-teal-900/40 text-teal-300 border-teal-800/50',
  Signature: 'bg-rose-900/40 text-rose-300 border-rose-800/50',
  Sweet: 'bg-pink-900/40 text-pink-300 border-pink-800/50',
  Dessert: 'bg-pink-900/40 text-pink-300 border-pink-800/50',
  Classic: 'bg-stone-700/60 text-stone-300 border-stone-600/40',
  Raw: 'bg-red-900/40 text-red-300 border-red-800/50',
  New: 'bg-blue-900/40 text-blue-300 border-blue-800/50',
  Popular: 'bg-amber-900/40 text-amber-300 border-amber-800/50',
  Vegan: 'bg-green-900/40 text-green-300 border-green-800/50',
  Spicy: 'bg-orange-900/40 text-orange-300 border-orange-800/50',
  'Gluten-Free': 'bg-lime-900/40 text-lime-300 border-lime-800/50',
};

export const tagStyle = (tag: string) =>
  TAG_STYLES[tag] ?? 'bg-stone-800/60 text-stone-300 border-stone-700/40';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DishCardContentProps {
  name: string;
  /** Already formatted price string (e.g. "$28", "€14") — or null to hide */
  price?: string | null;
  desc?: string;
  tags?: string[];
  calories?: string;
  spiceLevel?: number;
  allergens?: string[];
  /** Already resolved to display names */
  pairsWell?: string[];

  /** Per-field visibility toggles — all default to true */
  fieldVisibility?: {
    description?: boolean;
    price?: boolean;
    tags?: boolean;
    calories?: boolean;
    spiceLevel?: boolean;
    allergens?: boolean;
    pairsWell?: boolean;
  };

  brandColor?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Slot for action buttons rendered below the content */
  children?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const DishCardContent: React.FC<DishCardContentProps> = ({
  name,
  price,
  desc,
  tags = [],
  calories,
  spiceLevel,
  allergens = [],
  pairsWell = [],
  fieldVisibility: fv,
  brandColor,
  className = '',
  onClick,
  children,
}) => {
  const showPrice = fv?.price ?? true;
  const showDesc = fv?.description ?? true;
  const showTags = fv?.tags ?? true;
  const showCalories = fv?.calories ?? true;
  const showSpice = fv?.spiceLevel ?? true;
  const showAllergens = fv?.allergens ?? true;
  const showPairs = fv?.pairsWell ?? true;

  return (
    <div
      className={`flex-1 min-w-0 p-4 sm:p-5 lg:py-5 lg:px-6 flex flex-col justify-between gap-3 ${className}`}
      onClick={onClick}
    >
      <div>
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3
            className="text-lg md:text-xl font-serif-premium font-bold text-white leading-tight truncate transition-colors group-hover:[color:var(--brand-hover)]"
            style={{ '--brand-hover': brandColor } as React.CSSProperties}
          >
            {name}
          </h3>
          {showPrice && price && (
            <span
              className="text-lg font-black font-sans-premium flex-shrink-0 tracking-tighter"
              style={{ color: brandColor }}
            >
              {price}
            </span>
          )}
        </div>

        {/* Description */}
        {showDesc && desc && (
          <p className="text-xs md:text-sm font-sans-premium leading-relaxed line-clamp-2 mb-2 text-zinc-400">
            {desc}
          </p>
        )}

        {/* Tags */}
        {showTags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-[10px] md:text-[11px] px-2 py-0.5 rounded-md border font-black uppercase tracking-widest transition-all ${tagStyle(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Calories */}
        {showCalories && calories && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Calories
            </span>
            <span className="text-[11px] font-semibold text-white bg-zinc-800/80 px-1.5 py-px rounded-md border border-zinc-700/50">
              {calories}
            </span>
          </div>
        )}

        {/* Spice Level */}
        {showSpice && (spiceLevel ?? 0) > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Spice
            </span>
            <span className="flex gap-0.5">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < (spiceLevel ?? 0) ? 'opacity-100' : 'opacity-20'}`}
                >
                  🌶
                </span>
              ))}
            </span>
          </div>
        )}

        {/* Allergens */}
        {showAllergens && allergens.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mb-2">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mr-1">
              Allergens
            </span>
            {allergens.map((a) => (
              <span
                key={a}
                className="text-[10px] md:text-[11px] px-1.5 py-px rounded-md bg-red-500/20 text-red-300 border border-red-500/25 font-semibold"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Pairs well with */}
        {showPairs && pairsWell.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mr-1">
              Pairs well with
            </span>
            {pairsWell.map((p) => (
              <span
                key={p}
                className="text-[10px] md:text-[11px] px-1.5 py-px rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/25 font-semibold"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons slot */}
      {children}
    </div>
  );
};

DishCardContent.displayName = 'DishCardContent';
