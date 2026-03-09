import React, { useState } from 'react';
import { EyeOff } from 'lucide-react';
import { DishCardContent, type DishCardContentProps } from './DishCardContent';

// ─── Radius helpers ─────────────────────────────────────────────────────────

export type CardLayout = 'horizontal' | 'stacked';
export type CardRadius = 'sharp' | 'rounded' | 'pill';

const articleRadius = (r: CardRadius) =>
  r === 'sharp' ? 'rounded-lg' : r === 'pill' ? 'rounded-[2rem]' : 'rounded-3xl';

const imageRadius = (r: CardRadius, layout: CardLayout) => {
  if (r === 'sharp')
    return layout === 'stacked'
      ? 'rounded-t-md'
      : 'rounded-t-md lg:rounded-t-none lg:rounded-l-md';
  if (r === 'pill')
    return layout === 'stacked'
      ? 'rounded-t-[1.75rem]'
      : 'rounded-t-[1.75rem] lg:rounded-t-none lg:rounded-l-[1.75rem]';
  return layout === 'stacked'
    ? 'rounded-t-2xl'
    : 'rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl';
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DishCardShellProps {
  /* ── Content (forwarded to DishCardContent) ── */
  name: string;
  price?: string | null;
  desc?: string;
  tags?: string[];
  calories?: string;
  spiceLevel?: number;
  allergens?: string[];
  pairsWell?: string[];
  fieldVisibility?: DishCardContentProps['fieldVisibility'];
  brandColor?: string;

  /* ── Image ── */
  image?: string;
  hidden?: boolean;

  /* ── Layout ── */
  cardStyle?: CardLayout;
  cardRadius?: CardRadius;

  /* ── Article overrides ── */
  /** Extra classes appended to the article (e.g. drag-state, z-index) */
  articleClassName?: string;
  /** Extra inline styles merged onto the article */
  articleStyle?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;

  /* ── Image area slots ── */
  /** Rendered inside the article, before the image container (e.g. drag handle) */
  beforeImage?: React.ReactNode;
  /** Rendered behind the static image layer (e.g. Inline3DPreview) */
  imageBehind?: React.ReactNode;
  /** Rendered on top of the image area (e.g. 3D badge, ControlsHint) */
  imageOverlay?: React.ReactNode;
  /** Shown when there is no image */
  imagePlaceholder?: React.ReactNode;
  /** If true the static image fades out on hover to reveal imageBehind */
  imageFadesOnHover?: boolean;
  /** Extra classes on the image container */
  imageClassName?: string;
  onImageClick?: (e: React.MouseEvent) => void;
  imageRole?: string;
  imageTabIndex?: number;
  onImageKeyDown?: (e: React.KeyboardEvent) => void;
  imageAriaLabel?: string;

  /* ── Content area overrides ── */
  contentClassName?: string;
  contentOnClick?: (e: React.MouseEvent) => void;

  /* ── Action buttons slot ── */
  children?: React.ReactNode;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const DishCardShell: React.FC<DishCardShellProps> = ({
  // Content
  name, price, desc, tags, calories, spiceLevel, allergens, pairsWell,
  fieldVisibility, brandColor,

  // Image
  image, hidden,

  // Layout
  cardStyle = 'horizontal', cardRadius = 'rounded',

  // Article overrides
  articleClassName = '', articleStyle,
  onClick, onDragOver, onDrop,

  // Image slots
  beforeImage, imageBehind, imageOverlay, imagePlaceholder,
  imageFadesOnHover = false,
  imageClassName = '', onImageClick, imageRole, imageTabIndex, onImageKeyDown, imageAriaLabel,

  // Content
  contentClassName, contentOnClick,

  // Children
  children,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  const layout = cardStyle === 'stacked' ? 'flex-col' : 'flex-col lg:flex-row';
  const imageSizeClass =
    cardStyle === 'stacked'
      ? 'h-56 sm:h-64'
      : 'h-56 sm:h-64 lg:w-48 xl:w-56 lg:h-auto';

  return (
    <article
      className={`group relative flex ${layout} backdrop-blur-md border ${articleRadius(cardRadius)} overflow-visible transition-all duration-500 shadow-xl shadow-black/10 premium-card-glow ${
        hidden
          ? 'border-white/10 opacity-50'
          : 'border-white/10 hover:border-white/25 hover:shadow-2xl hover:shadow-black/40 hover:bg-zinc-900/60 hover:-translate-y-1'
      } cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:outline-none ${articleClassName}`}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--surface) 65%, transparent)',
        ...articleStyle,
      }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {beforeImage}

      {/* ── Image ── */}
      <div
        className={`relative w-full ${imageSizeClass} flex-shrink-0 bg-zinc-800 overflow-hidden ${imageRadius(cardRadius, cardStyle)} transition-all duration-500 ${imageClassName}`}
        onClick={onImageClick}
        role={imageRole}
        tabIndex={imageTabIndex}
        onKeyDown={onImageKeyDown}
        aria-label={imageAriaLabel}
      >
        {/* Loading skeleton */}
        {image && !imgLoaded && (
          <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
        )}

        {/* Layer behind the static image (e.g. 3D preview) */}
        {imageBehind}

        {/* Static image */}
        {image ? (
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              imageFadesOnHover
                ? 'group-hover:opacity-0 group-hover:pointer-events-none'
                : ''
            }`}
            style={imageBehind ? { zIndex: 30, isolation: 'isolate' } : undefined}
          >
            <img
              src={image}
              alt={name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover ${
                !imageFadesOnHover
                  ? 'transition-transform duration-500 group-hover:scale-105'
                  : ''
              } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        ) : (
          imagePlaceholder
        )}

        {/* Overlay content (badges, hints, etc.) */}
        {imageOverlay}

        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Hidden overlay */}
        {hidden && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center">
            <EyeOff className="w-8 h-8 text-white/20" />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <DishCardContent
        name={name}
        price={price}
        desc={desc}
        tags={tags}
        calories={calories}
        spiceLevel={spiceLevel}
        allergens={allergens}
        pairsWell={pairsWell}
        fieldVisibility={fieldVisibility}
        brandColor={brandColor}
        className={contentClassName}
        onClick={contentOnClick}
      >
        {children}
      </DishCardContent>
    </article>
  );
};

DishCardShell.displayName = 'DishCardShell';
