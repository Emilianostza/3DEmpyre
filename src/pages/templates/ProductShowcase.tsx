import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Smartphone,
  Star,
  Check,
  Copy,
  Code2,
  QrCode,
  Share2,
  ShoppingCart,
  Tag,
  Box,
  Eye,
} from 'lucide-react';
import { placeholder } from '@/config/site';
import { SEO } from '@/components/common/SEO';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductVariant {
  id: string;
  name: string;
  color: string;
  modelUrl: string;
  image: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  desc: string;
  price: string;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  features: string[];
  specs: { label: string; value: string }[];
  tags: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ASTRONAUT_GLB = '/models/AdvancedExport/3DModel_Custom.gltf';

const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aeron Ergonomic Chair',
    brand: 'FormLab Studio',
    category: 'Furniture',
    desc: 'A precision-engineered mesh office chair with PostureFit SL spinal support, eight zones of tension, and fully adjustable arms. Designed for extended work sessions with breathable material that distributes weight evenly.',
    price: '$1,395',
    rating: 4.8,
    reviewCount: 237,
    variants: [
      {
        id: 'v1a',
        name: 'Graphite',
        color: '#374151',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, '374151'),
      },
      {
        id: 'v1b',
        name: 'Mineral',
        color: '#9ca3af',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, '9ca3af'),
      },
      {
        id: 'v1c',
        name: 'Onyx',
        color: '#1f2937',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, '1f2937'),
      },
    ],
    features: [
      '8Z Pellicle mesh suspension',
      'PostureFit SL lumbar support',
      'Fully adjustable arms and tilt',
      '12-year manufacturer warranty',
      'BIFMA and GREENGUARD certified',
    ],
    specs: [
      { label: 'Weight Capacity', value: '350 lbs' },
      { label: 'Seat Height Range', value: '16 - 20.5 in' },
      { label: 'Material', value: 'Pellicle Mesh' },
      { label: 'Warranty', value: '12 Years' },
      { label: 'Assembly', value: 'Pre-assembled' },
    ],
    tags: ['Ergonomic', 'Office', 'Premium'],
  },
  {
    id: 'prod-2',
    name: 'AuraPods Max',
    brand: 'SoundCraft',
    category: 'Electronics',
    desc: 'Over-ear headphones with adaptive noise cancellation, spatial audio, and a computational audio chip that delivers immersive, theatre-like sound. Premium knit mesh canopy and memory foam cushions for all-day comfort.',
    price: '$549',
    rating: 4.5,
    reviewCount: 182,
    variants: [
      {
        id: 'v2a',
        name: 'Midnight Black',
        color: '#18181b',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, '18181b'),
      },
      {
        id: 'v2b',
        name: 'Arctic White',
        color: '#e4e4e7',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, 'e4e4e7'),
      },
    ],
    features: [
      'Active noise cancellation with transparency mode',
      'Spatial audio with dynamic head tracking',
      '20-hour battery life',
      'Digital crown for volume control',
      'Lightning and 3.5mm audio output',
    ],
    specs: [
      { label: 'Driver Size', value: '40mm' },
      { label: 'Frequency Response', value: '20Hz - 20kHz' },
      { label: 'Battery', value: '20 Hours' },
      { label: 'Weight', value: '384g' },
      { label: 'Connectivity', value: 'Bluetooth 5.0' },
    ],
    tags: ['Audio', 'Wireless', 'Noise-Cancelling'],
  },
  {
    id: 'prod-3',
    name: 'Heritage Leather Weekender',
    brand: 'Atelier Voss',
    category: 'Fashion',
    desc: 'Hand-stitched full-grain leather duffle bag with brass hardware, interior laptop sleeve, and detachable shoulder strap. Vegetable-tanned over six weeks for a rich patina that develops uniquely over time.',
    price: '$789',
    rating: 4.9,
    reviewCount: 64,
    variants: [
      {
        id: 'v3a',
        name: 'Cognac',
        color: '#92400e',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, '92400e'),
      },
      {
        id: 'v3b',
        name: 'Espresso',
        color: '#451a03',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, '451a03'),
      },
      {
        id: 'v3c',
        name: 'Black',
        color: '#171717',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, '171717'),
      },
    ],
    features: [
      'Full-grain vegetable-tanned leather',
      'YKK solid brass zippers',
      'Cotton twill interior lining',
      'Fits 15" laptop in padded sleeve',
      'Lifetime repair guarantee',
    ],
    specs: [
      { label: 'Dimensions', value: '22 x 11 x 12 in' },
      { label: 'Material', value: 'Full-grain Leather' },
      { label: 'Hardware', value: 'Solid Brass' },
      { label: 'Weight', value: '3.8 lbs' },
      { label: 'Capacity', value: '45L' },
    ],
    tags: ['Leather', 'Handmade', 'Travel'],
  },
  {
    id: 'prod-4',
    name: 'Oura Sculptural Vase',
    brand: 'Noma Ceramics',
    category: 'Home Decor',
    desc: 'Organic-form stoneware vase with a reactive ash glaze that creates one-of-a-kind surface patterns. Wheel-thrown and hand-finished by artisans in a small-batch studio, suitable for fresh or dried arrangements.',
    price: '$185',
    rating: 4.6,
    reviewCount: 43,
    variants: [
      {
        id: 'v4a',
        name: 'Ash White',
        color: '#d4d4d8',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, 'd4d4d8'),
      },
      {
        id: 'v4b',
        name: 'Charcoal',
        color: '#3f3f46',
        modelUrl: ASTRONAUT_GLB,
        image: placeholder(400, 400, '3f3f46'),
      },
    ],
    features: [
      'Wheel-thrown stoneware clay body',
      'Reactive ash glaze finish',
      'Watertight interior seal',
      'Food-safe and lead-free',
      'Signed and numbered by the artist',
    ],
    specs: [
      { label: 'Height', value: '14 in' },
      { label: 'Opening', value: '4.5 in' },
      { label: 'Material', value: 'Stoneware' },
      { label: 'Finish', value: 'Ash Glaze' },
      { label: 'Origin', value: 'Handmade' },
    ],
    tags: ['Ceramic', 'Artisan', 'Decor'],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Furniture: 'bg-amber-900/40 text-amber-300 border-amber-800/50',
  Electronics: 'bg-sky-900/40 text-sky-300 border-sky-800/50',
  Fashion: 'bg-rose-900/40 text-rose-300 border-rose-800/50',
  'Home Decor': 'bg-emerald-900/40 text-emerald-300 border-emerald-800/50',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const categoryBadge = (category: string): string =>
  CATEGORY_COLORS[category] ?? 'bg-zinc-800/60 text-zinc-300 border-zinc-700/40';

// ─── StarRating ──────────────────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number; count: number }> = ({ rating, count }) => {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < full
                ? 'text-amber-400 fill-amber-400'
                : i === full && partial > 0
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-zinc-700'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-zinc-400 font-medium">{rating}</span>
      <span className="text-xs text-zinc-500">({count})</span>
    </div>
  );
};

// ─── ProductSidebar ──────────────────────────────────────────────────────────

interface ProductSidebarProps {
  products: Product[];
  activeId: string;
  onSelect: (id: string) => void;
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({ products, activeId, onSelect }) => {
  const { t } = useTranslation();
  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 border-r border-zinc-800/60 bg-zinc-950 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
          {t('tpl.product.products')}
        </h2>
        <ul className="space-y-2" role="listbox" aria-label="Product list">
          {products.map((product) => {
            const isActive = product.id === activeId;
            return (
              <li key={product.id}>
                <button
                  role="option"
                  aria-selected={isActive}
                  onClick={() => onSelect(product.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 border ${
                    isActive
                      ? 'bg-zinc-800/80 border-zinc-700 shadow-lg shadow-zinc-900/50'
                      : 'bg-zinc-900/40 border-zinc-800/40 hover:bg-zinc-900/80 hover:border-zinc-700/60'
                  }`}
                >
                  <img
                    src={product.variants[0].image}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-zinc-800"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{product.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{product.brand}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-emerald-400">{product.price}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-zinc-400">{product.rating}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${categoryBadge(product.category)}`}
                    >
                      {product.category}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

// ─── ModelViewerPanel ────────────────────────────────────────────────────────

interface ModelViewerPanelProps {
  product: Product;
  activeVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
  productIndex: number;
  totalProducts: number;
  onNavigate: (dir: 1 | -1) => void;
}

const ModelViewerPanel: React.FC<ModelViewerPanelProps> = ({
  product,
  activeVariant,
  onVariantChange,
  productIndex,
  totalProducts,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModelLoaded(false);
    setModelError(false);
  }, [activeVariant.id]);

  useEffect(() => {
    try {
      import('@google/model-viewer');
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.warn('[ProductShowcase] Failed to load model-viewer:', message);
      }
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.warn('[ProductShowcase] Fullscreen error:', message);
      }
    }
  }, []);

  const handleAR = () => {
    const viewer = document.querySelector('model-viewer') as HTMLElement & {
      activateAR?: () => void;
    };
    viewer?.activateAR?.();
  };

  const handleResetCamera = () => {
    const viewer = document.querySelector('model-viewer') as HTMLElement;
    viewer?.setAttribute('camera-orbit', '0deg 75deg auto');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 3D Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[360px] lg:min-h-[500px] bg-zinc-900"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #27272a 0%, #09090b 70%)' }}
      >
        {!modelError ? (
          <>
            {/* @ts-expect-error model-viewer is a custom element */}
            <model-viewer
              key={activeVariant.id}
              src={activeVariant.modelUrl}
              alt={`3D model of ${product.name} - ${activeVariant.name}`}
              auto-rotate={autoRotate ? '' : undefined}
              auto-rotate-delay="500"
              rotation-per-second="20deg"
              camera-controls
              camera-orbit="0deg 75deg auto"
              shadow-intensity="0.8"
              shadow-softness="0.5"
              exposure="0.95"
              ar
              ar-modes="webxr scene-viewer quick-look"
              touch-action="pan-y"
              interaction-prompt="none"
              loading="eager"
              style={{ width: '100%', height: '100%' }}
              onLoad={() => setModelLoaded(true)}
              onError={() => setModelError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <img
              src={activeVariant.image}
              alt={product.name}
              className="w-40 h-40 rounded-2xl object-cover opacity-40"
            />
            <p className="text-zinc-400 text-sm">{t('tpl.product.previewUnavailable')}</p>
            <button
              onClick={() => {
                setModelError(false);
                setModelLoaded(false);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
            >
              {t('tpl.product.retry')}
            </button>
          </div>
        )}

        {/* Loading spinner */}
        {!modelLoaded && !modelError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/60 pointer-events-none">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm font-mono">{t('tpl.product.loadingModel')}</p>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(-1)}
              disabled={productIndex === 0}
              className="p-2 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-20 disabled:pointer-events-none"
              aria-label={t('tpl.product.previousProduct')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-500 font-mono bg-zinc-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-zinc-800">
              {productIndex + 1} of {totalProducts}
            </span>
            <button
              onClick={() => onNavigate(1)}
              disabled={productIndex === totalProducts - 1}
              className="p-2 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-20 disabled:pointer-events-none"
              aria-label={t('tpl.product.nextProduct')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className={`p-2 rounded-full backdrop-blur-md border transition-colors ${
                autoRotate
                  ? 'bg-violet-600/30 border-violet-500/50 text-violet-300'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              aria-label={autoRotate ? 'Stop rotation' : 'Start rotation'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-zinc-50 transition-colors text-xs"
            aria-label="Reset camera"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('tpl.product.resetView')}</span>
          </button>
          <button
            onClick={handleAR}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/40 transition-all hover:shadow-violet-900/60 hover:brightness-110 active:scale-95"
            aria-label={t('tpl.product.placeInSpace')}
          >
            <Smartphone className="w-4 h-4" />
            {t('tpl.product.placeInSpace')}
          </button>
        </div>
      </div>

      {/* Variant selector */}
      <div className="bg-zinc-950 border-t border-zinc-800/60 px-5 py-4">
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex-shrink-0">
            {t('tpl.product.color')}
          </span>
          <div className="flex items-center gap-3">
            {product.variants.map((variant) => {
              const isActive = variant.id === activeVariant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => onVariantChange(variant)}
                  className={`relative w-8 h-8 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'ring-2 ring-offset-2 ring-offset-zinc-950 ring-violet-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: variant.color }}
                  aria-label={variant.name}
                  aria-pressed={isActive}
                  title={variant.name}
                />
              );
            })}
          </div>
          <span className="text-sm text-zinc-300 font-medium">{activeVariant.name}</span>
        </div>
      </div>
    </div>
  );
};

// ─── ProductDetailsPanel ─────────────────────────────────────────────────────

interface ProductDetailsPanelProps {
  product: Product;
  onShare: () => void;
}

const ProductDetailsPanel: React.FC<ProductDetailsPanelProps> = ({ product, onShare }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const embedCode = useMemo(
    () =>
      `<model-viewer\n  src="${product.variants[0].modelUrl}"\n  alt="${product.name}"\n  ar camera-controls auto-rotate\n  style="width:100%;height:400px"\n></model-viewer>`,
    [product]
  );

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.warn('[ProductShowcase] Copy failed:', message);
      }
    }
  };

  const handleCopyEmbed = () => {
    try {
      navigator.clipboard.writeText(embedCode);
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.warn('[ProductShowcase] Embed copy failed:', message);
      }
    }
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-l border-zinc-800/60 bg-zinc-950 overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              {product.brand}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${categoryBadge(product.category)}`}
            >
              {product.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 leading-tight mb-3">{product.name}</h1>
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>

        {/* Price & CTA */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-zinc-50 font-mono">{product.price}</span>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/30 transition-all hover:shadow-violet-900/50 hover:brightness-110 active:scale-[0.98]">
            <ShoppingCart className="w-4 h-4" />
            {t('tpl.product.buyNow')}
          </button>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
            {t('tpl.product.description')}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{product.desc}</p>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
            {t('tpl.product.features')}
          </h2>
          <ul className="space-y-2">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Specifications */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
            {t('tpl.product.specifications')}
          </h2>
          <div className="rounded-xl border border-zinc-800/60 overflow-hidden">
            {product.specs.map((spec, idx) => (
              <div
                key={spec.label}
                className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                  idx % 2 === 0 ? 'bg-zinc-900/40' : 'bg-zinc-900/20'
                } ${idx < product.specs.length - 1 ? 'border-b border-zinc-800/40' : ''}`}
              >
                <span className="text-zinc-500">{spec.label}</span>
                <span className="text-zinc-200 font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
            {t('tpl.product.tags')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800/60 text-zinc-300 border border-zinc-700/40 font-medium"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Share & Embed */}
        <div className="border-t border-zinc-800/60 pt-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
            {t('tpl.product.shareEmbed')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onShare}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {t('tpl.product.share')}
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? t('tpl.product.copied') : t('tpl.product.link')}
            </button>
          </div>

          <button
            onClick={() => setShowEmbed((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 transition-colors"
          >
            <Code2 className="w-4 h-4" />
            {showEmbed ? t('tpl.product.hideEmbedCode') : t('tpl.product.showEmbedCode')}
          </button>

          {showEmbed && (
            <div className="relative">
              <pre className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800/60 rounded-xl p-3 overflow-x-auto font-mono whitespace-pre-wrap break-all">
                {embedCode}
              </pre>
              <button
                onClick={handleCopyEmbed}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label="Copy embed code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* QR placeholder */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/40">
            <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-8 h-8 text-zinc-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-300">{t('tpl.product.qrCode')}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{t('tpl.product.qrScanHint')}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ─── ProductShowcase (main) ──────────────────────────────────────────────────

const ProductShowcase: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [activeProductId, setActiveProductId] = useState(PRODUCTS[0].id);
  const [variantMap, setVariantMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    PRODUCTS.forEach((p) => {
      map[p.id] = p.variants[0].id;
    });
    return map;
  });

  const product = useMemo(
    () => PRODUCTS.find((p) => p.id === activeProductId) ?? PRODUCTS[0],
    [activeProductId]
  );

  const productIndex = PRODUCTS.findIndex((p) => p.id === activeProductId);

  const activeVariant = useMemo(
    () => product.variants.find((v) => v.id === variantMap[product.id]) ?? product.variants[0],
    [product, variantMap]
  );

  const handleVariantChange = useCallback(
    (variant: ProductVariant) => {
      setVariantMap((prev) => ({ ...prev, [product.id]: variant.id }));
    },
    [product.id]
  );

  const handleNavigate = useCallback(
    (dir: 1 | -1) => {
      const idx = PRODUCTS.findIndex((p) => p.id === activeProductId);
      const next = idx + dir;
      if (next >= 0 && next < PRODUCTS.length) {
        setActiveProductId(PRODUCTS[next].id);
      }
    },
    [activeProductId]
  );

  const handleShare = useCallback(() => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        navigator.share({ title: product.name, text: product.desc, url });
      } else {
        navigator.clipboard.writeText(url);
      }
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.warn('[ProductShowcase] Share failed:', message);
      }
    }
  }, [product]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleNavigate(-1);
      if (e.key === 'ArrowRight') handleNavigate(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNavigate]);

  if (import.meta.env.DEV) {
    console.warn('[ProductShowcase] Rendering for project:', id);
  }

  return (
    <>
      <SEO
        title={`${product.name} - Product Showcase`}
        description={product.desc}
        image={activeVariant.image}
      />

      <div
        className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row"
        data-route={`/project/${id ?? ''}/showcase`}
      >
        {/* ── Sidebar (gallery) ── */}
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800/60">
          {/* Mobile horizontal scroll */}
          <div className="flex gap-3 p-4 overflow-x-auto scrollbar-none">
            {PRODUCTS.map((p) => {
              const isActive = p.id === activeProductId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProductId(p.id)}
                  className={`flex-shrink-0 flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? 'bg-zinc-800/80 border-zinc-700'
                      : 'bg-zinc-900/40 border-zinc-800/40 hover:bg-zinc-900/80'
                  }`}
                >
                  <img
                    src={p.variants[0].image}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                    loading="lazy"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-zinc-100 truncate max-w-[120px]">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">{p.price}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block">
          <ProductSidebar
            products={PRODUCTS}
            activeId={activeProductId}
            onSelect={setActiveProductId}
          />
        </div>

        {/* ── Center: 3D Viewer ── */}
        <ModelViewerPanel
          product={product}
          activeVariant={activeVariant}
          onVariantChange={handleVariantChange}
          productIndex={productIndex}
          totalProducts={PRODUCTS.length}
          onNavigate={handleNavigate}
        />

        {/* ── Right: Details ── */}
        <ProductDetailsPanel product={product} onShare={handleShare} />
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/40 py-6 text-center">
        <div className="flex items-center justify-center gap-2 text-zinc-600 text-xs font-mono">
          <Box className="w-3.5 h-3.5" />
          <span>{t('tpl.product.poweredBy')}</span>
        </div>
      </footer>
    </>
  );
};

export default ProductShowcase;
