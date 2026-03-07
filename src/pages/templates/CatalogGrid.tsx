import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { placeholder } from '@/config/site';
import { SEO } from '@/components/common/SEO';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  image: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  inStock: boolean;
  modelUrl: string;
  desc: string;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
type ViewMode = 'grid' | 'list';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MODEL_URL = '/models/AdvancedExport/3DModel_Custom.gltf';

const CATEGORIES = ['All', 'Furniture', 'Electronics', 'Fashion', 'Home Decor'] as const;

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: 'featured', labelKey: 'tpl.catalog.sortFeatured' },
  { value: 'price-asc', labelKey: 'tpl.catalog.sortPriceAsc' },
  { value: 'price-desc', labelKey: 'tpl.catalog.sortPriceDesc' },
  { value: 'rating', labelKey: 'tpl.catalog.sortRating' },
  { value: 'newest', labelKey: 'tpl.catalog.sortNewest' },
];

const PRODUCTS: CatalogProduct[] = [
  // Furniture (hue 30)
  {
    id: 'p1',
    name: 'Oaken Lounge Chair',
    brand: 'Nordic Living',
    category: 'Furniture',
    price: 649,
    currency: 'EUR',
    image: placeholder(400, 400, 'Oaken Lounge Chair', 30),
    rating: 4.7,
    reviewCount: 234,
    tags: ['New'],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'Solid oak frame with woven cotton seat. Designed for comfort and durability.',
  },
  {
    id: 'p2',
    name: 'Marble Side Table',
    brand: 'Atelier Casa',
    category: 'Furniture',
    price: 329,
    currency: 'EUR',
    image: placeholder(400, 400, 'Marble Side Table', 30),
    rating: 4.3,
    reviewCount: 89,
    tags: [],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'Calacatta marble top with brushed brass legs. Elegant accent piece.',
  },
  {
    id: 'p3',
    name: 'Modular Bookshelf',
    brand: 'Nordic Living',
    category: 'Furniture',
    price: 1299,
    currency: 'EUR',
    image: placeholder(400, 400, 'Modular Bookshelf', 30),
    rating: 4.9,
    reviewCount: 412,
    tags: ['Sale'],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'Configurable walnut shelving system with steel brackets. Scales to any wall.',
  },
  {
    id: 'p4',
    name: 'Velvet Dining Chair',
    brand: 'Maison Lux',
    category: 'Furniture',
    price: 189,
    currency: 'EUR',
    image: placeholder(400, 400, 'Velvet Dining Chair', 30),
    rating: 4.1,
    reviewCount: 56,
    tags: [],
    inStock: false,
    modelUrl: MODEL_URL,
    desc: 'Deep-tufted velvet upholstery on a powder-coated steel frame.',
  },
  // Electronics (hue 210)
  {
    id: 'p5',
    name: 'Studio Monitor Speaker',
    brand: 'SoundForge',
    category: 'Electronics',
    price: 449,
    currency: 'EUR',
    image: placeholder(400, 400, 'Studio Monitor Speaker', 210),
    rating: 4.8,
    reviewCount: 673,
    tags: ['New'],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'Reference-grade nearfield monitor with 6.5-inch woofer and ribbon tweeter.',
  },
  {
    id: 'p6',
    name: 'Smart Desk Lamp',
    brand: 'LumiTech',
    category: 'Electronics',
    price: 79,
    currency: 'EUR',
    image: placeholder(400, 400, 'Smart Desk Lamp', 210),
    rating: 4.4,
    reviewCount: 321,
    tags: ['Sale'],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'App-controlled LED desk lamp with adjustable color temperature and brightness.',
  },
  {
    id: 'p7',
    name: 'Wireless Charging Pad',
    brand: 'LumiTech',
    category: 'Electronics',
    price: 49,
    currency: 'EUR',
    image: placeholder(400, 400, 'Wireless Charging Pad', 210),
    rating: 3.9,
    reviewCount: 188,
    tags: [],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'Qi2-compatible fast charging pad with alignment magnets and LED indicator.',
  },
  // Fashion (hue 320)
  {
    id: 'p8',
    name: 'Leather Weekender Bag',
    brand: 'Voyager & Co',
    category: 'Fashion',
    price: 299,
    currency: 'EUR',
    image: placeholder(400, 400, 'Leather Weekender Bag', 320),
    rating: 4.6,
    reviewCount: 145,
    tags: [],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'Full-grain vegetable-tanned leather duffle with brass hardware.',
  },
  {
    id: 'p9',
    name: 'Merino Wool Scarf',
    brand: 'Alpina Knits',
    category: 'Fashion',
    price: 59,
    currency: 'EUR',
    image: placeholder(400, 400, 'Merino Wool Scarf', 320),
    rating: 5.0,
    reviewCount: 72,
    tags: ['New'],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'Ultra-soft 100% merino wool in a generous oversized drape.',
  },
  {
    id: 'p10',
    name: 'Canvas Sneakers',
    brand: 'Voyager & Co',
    category: 'Fashion',
    price: 89,
    currency: 'EUR',
    image: placeholder(400, 400, 'Canvas Sneakers', 320),
    rating: 4.2,
    reviewCount: 310,
    tags: ['Sale'],
    inStock: false,
    modelUrl: MODEL_URL,
    desc: 'Organic cotton canvas upper with natural rubber sole. Everyday staple.',
  },
  // Home Decor (hue 150)
  {
    id: 'p11',
    name: 'Ceramic Vase Set',
    brand: 'Terra Studio',
    category: 'Home Decor',
    price: 129,
    currency: 'EUR',
    image: placeholder(400, 400, 'Ceramic Vase Set', 150),
    rating: 4.5,
    reviewCount: 97,
    tags: [],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'Set of three hand-thrown stoneware vases with reactive glaze finish.',
  },
  {
    id: 'p12',
    name: 'Woven Wall Hanging',
    brand: 'Terra Studio',
    category: 'Home Decor',
    price: 29,
    currency: 'EUR',
    image: placeholder(400, 400, 'Woven Wall Hanging', 150),
    rating: 3.5,
    reviewCount: 41,
    tags: ['New'],
    inStock: true,
    modelUrl: MODEL_URL,
    desc: 'Hand-woven macrame wall art on a driftwood dowel. Natural cotton cord.',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(amount: number, currency: string): string {
  const sym = currency === 'EUR' ? '\u20AC' : currency;
  return `${sym}${amount.toLocaleString()}`;
}

function renderStars(rating: number): React.ReactNode {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span
      className="inline-flex items-center gap-0.5 text-amber-400"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: full }, (_, i) => (
        <span key={`f${i}`}>&#9733;</span>
      ))}
      {half && <span key="h">&#9734;</span>}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e${i}`} className="text-zinc-600">
          &#9734;
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/* --- Search icon (inline SVG) --- */
const SearchIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

/* --- Grid/List toggle icons --- */
const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 3h5v5H3V3zm9 0h5v5h-5V3zM3 12h5v5H3v-5zm9 0h5v5h-5v-5z" />
  </svg>
);
const ListIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" />
  </svg>
);

/* --- Close icon --- */
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Product Card (Grid)                                                */
/* ------------------------------------------------------------------ */

interface CardProps {
  product: CatalogProduct;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
  onQuickView: (product: CatalogProduct) => void;
}

const ProductCardGrid: React.FC<CardProps> = ({
  product,
  isCompared,
  onToggleCompare,
  onQuickView,
}) => {
  const { t } = useTranslation();
  const dimmed = !product.inStock;
  return (
    <div
      className={`group relative rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-300 hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-950/60 ${dimmed ? 'opacity-60' : ''}`}
    >
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.modelUrl && (
            <span className="rounded bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-50">
              3D
            </span>
          )}
          {product.tags.includes('Sale') && (
            <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-50">
              Sale
            </span>
          )}
          {product.tags.includes('New') && (
            <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-50">
              New
            </span>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50">
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
              {t('tpl.catalog.outOfStock')}
            </span>
          </div>
        )}
        {/* Quick View overlay */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-zinc-950/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-zinc-50 transition-colors hover:bg-violet-500"
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          {product.brand}
        </p>
        <h3 className="text-sm font-bold text-zinc-50 leading-snug line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          {renderStars(product.rating)}
          <span className="text-[11px] text-zinc-400">({product.reviewCount})</span>
        </div>
        <p className="text-base font-semibold text-zinc-100">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>

      {/* Compare checkbox */}
      <div className="absolute top-2 right-2">
        <label className="flex items-center gap-1 rounded bg-zinc-900/80 px-2 py-1 backdrop-blur-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isCompared}
            onChange={() => onToggleCompare(product.id)}
            className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
          />
          <span className="text-[10px] text-zinc-300">Compare</span>
        </label>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Product Card (List)                                                */
/* ------------------------------------------------------------------ */

const ProductCardList: React.FC<CardProps> = ({
  product,
  isCompared,
  onToggleCompare,
  onQuickView,
}) => {
  const { t } = useTranslation();
  const dimmed = !product.inStock;
  return (
    <div
      className={`group flex gap-5 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-300 hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-950/60 ${dimmed ? 'opacity-60' : ''}`}
    >
      {/* Image */}
      <div
        className="relative w-48 shrink-0 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.modelUrl && (
            <span className="rounded bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-50">
              3D
            </span>
          )}
          {product.tags.includes('Sale') && (
            <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-50">
              Sale
            </span>
          )}
          {product.tags.includes('New') && (
            <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-50">
              New
            </span>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50">
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
              {t('tpl.catalog.outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-center gap-2 py-4 pr-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          {product.brand}
        </p>
        <h3 className="text-base font-bold text-zinc-50">{product.name}</h3>
        <p className="text-sm text-zinc-400 line-clamp-2">{product.desc}</p>
        <div className="flex items-center gap-2">
          {renderStars(product.rating)}
          <span className="text-xs text-zinc-400">({product.reviewCount} reviews)</span>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-lg font-semibold text-zinc-100">
            {formatPrice(product.price, product.currency)}
          </span>
          <button
            onClick={() => onQuickView(product)}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-zinc-50 transition-colors hover:bg-violet-500"
          >
            Quick View
          </button>
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => onToggleCompare(product.id)}
              className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
            />
            <span className="text-xs text-zinc-300">Compare</span>
          </label>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Quick View Modal                                                   */
/* ------------------------------------------------------------------ */

interface ModalProps {
  product: CatalogProduct;
  onClose: () => void;
}

const QuickViewModal: React.FC<ModalProps> = ({ product, onClose }) => {
  const { t } = useTranslation();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await import('@google/model-viewer');
        if (import.meta.env.DEV && !cancelled) {
          console.warn('[CatalogGrid] model-viewer loaded');
        }
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          console.error(
            '[CatalogGrid] model-viewer load failed:',
            err instanceof Error ? err.message : err
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-zinc-800 p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* 3D Viewer */}
        <div className="aspect-square w-full rounded-t-2xl bg-zinc-950">
          <model-viewer
            src={product.modelUrl}
            alt={product.name}
            auto-rotate
            camera-controls
            ar
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Info */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {product.brand}
          </p>
          <h2 className="text-xl font-bold text-zinc-50">{product.name}</h2>
          <p className="text-sm text-zinc-400">{product.desc}</p>
          <div className="flex items-center gap-3">
            {renderStars(product.rating)}
            <span className="text-sm text-zinc-400">({product.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-zinc-50">
              {formatPrice(product.price, product.currency)}
            </span>
            <button className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-zinc-50 transition-colors hover:bg-violet-500">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t('tpl.catalog.viewIn3D')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Comparison Drawer                                                  */
/* ------------------------------------------------------------------ */

interface DrawerProps {
  products: CatalogProduct[];
  onClear: () => void;
}

const ComparisonDrawer: React.FC<DrawerProps> = ({ products, onClear }) => {
  if (products.length < 2) return null;
  const visible = products.slice(0, 3);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">
            Comparing {visible.length} product{visible.length > 1 ? 's' : ''}
          </h3>
          <button
            onClick={onClear}
            className="rounded-lg border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {visible.map((p) => (
            <div
              key={p.id}
              className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
            >
              <img
                src={p.image}
                alt={p.name}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-semibold text-zinc-100">{p.name}</p>
                <p className="text-xs text-zinc-400">{p.category}</p>
                <div className="flex items-center gap-2">{renderStars(p.rating)}</div>
                <p className="text-sm font-bold text-zinc-50">{formatPrice(p.price, p.currency)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

function CatalogGrid() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sort, setSort] = useState<SortOption>('featured');
  const [view, setView] = useState<ViewMode>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<CatalogProduct | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.warn(`[CatalogGrid] Mounted for project ${id ?? 'unknown'}`);
    }
  }, [id]);

  /* --- Filtering & Sorting --- */
  const filtered = useMemo(() => {
    let result = [...PRODUCTS];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (category !== 'All') {
      result = result.filter((p) => p.category === category);
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.tags.includes('New') ? 1 : 0) - (a.tags.includes('New') ? 1 : 0));
        break;
      default:
        break;
    }

    return result;
  }, [search, category, sort]);

  /* --- Compare logic --- */
  const toggleCompare = (productId: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else if (next.size < 3) {
        next.add(productId);
      }
      return next;
    });
  };

  const clearCompare = () => setCompareIds(new Set());

  const comparedProducts = useMemo(
    () => PRODUCTS.filter((p) => compareIds.has(p.id)),
    [compareIds]
  );

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('featured');
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      <SEO
        title="Product Catalog"
        description="Browse and compare 3D-scanned retail products in an interactive catalog."
      />

      <div className="min-h-screen bg-zinc-950">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <nav className="mb-2 text-xs text-zinc-400">
              <span className="hover:text-zinc-200 cursor-pointer transition-colors">Home</span>
              <span className="mx-2 text-zinc-600">/</span>
              <span className="text-zinc-100">Catalog</span>
            </nav>
            <div className="flex items-end justify-between">
              <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">
                {t('tpl.catalog.heading')}
              </h1>
              <p className="text-sm text-zinc-400">{PRODUCTS.length} products</p>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 space-y-3">
            {/* Top row: search + sort + view toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder={t('tpl.catalog.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-500"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>

              {/* View toggle */}
              <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 transition-colors ${view === 'grid' ? 'bg-violet-600 text-zinc-50' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                  aria-label={t('tpl.catalog.gridView')}
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 transition-colors ${view === 'list' ? 'bg-violet-600 text-zinc-50' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                  aria-label={t('tpl.catalog.listView')}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom row: categories + count */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      category === cat
                        ? 'bg-violet-600 text-zinc-50'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400">
                {t('tpl.catalog.showing', { count: filtered.length })}
              </p>
            </div>
          </div>
        </div>

        {/* Product Grid / List */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg
                className="mb-4 h-16 w-16 text-zinc-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <h2 className="text-lg font-semibold text-zinc-100">{t('tpl.catalog.noResults')}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-zinc-50 transition-colors hover:bg-violet-500"
              >
                Clear Filters
              </button>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
              {filtered.map((p) => (
                <ProductCardGrid
                  key={p.id}
                  product={p}
                  isCompared={compareIds.has(p.id)}
                  onToggleCompare={toggleCompare}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((p) => (
                <ProductCardList
                  key={p.id}
                  product={p}
                  isCompared={compareIds.has(p.id)}
                  onToggleCompare={toggleCompare}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}
        </main>

        {/* Spacer for comparison drawer */}
        {comparedProducts.length >= 2 && <div className="h-48" />}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}

      {/* Comparison Drawer */}
      <ComparisonDrawer products={comparedProducts} onClear={clearCompare} />
    </>
  );
}

export default CatalogGrid;
