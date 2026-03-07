import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { placeholder } from '@/config/site';
import { SEO } from '@/components/common/SEO';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: 'restaurant' | 'retail' | 'hospitality' | 'real_estate';
  image: string;
  modelUrl: string;
  description: string;
  date: string;
  stats: { views: number; arActivations: number; embedLoads: number };
  featured: boolean;
}

interface Testimonial {
  id: string;
  client: string;
  role: string;
  quote: string;
  rating: number;
  projectId: string;
}

type CategoryFilter = PortfolioItem['category'] | 'all';

// ─── Constants ───────────────────────────────────────────────────────────────

const HUES: Record<PortfolioItem['category'], number> = {
  restaurant: 15,
  retail: 210,
  hospitality: 160,
  real_estate: 280,
};

const CAT_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  restaurant: 'Restaurant',
  retail: 'Retail',
  hospitality: 'Hospitality',
  real_estate: 'Real Estate',
};

const GLB = '/models/AdvancedExport/3DModel_Custom.gltf';

const ph = (w: number, h: number, l: string, cat: PortfolioItem['category']) =>
  placeholder(w, h, l, HUES[cat]);

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ITEMS: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Bistro 55 Menu',
    client: 'Bistro 55',
    category: 'restaurant',
    image: ph(400, 500, 'Bistro 55', 'restaurant'),
    modelUrl: GLB,
    description:
      'Full 3D menu capture featuring 24 signature dishes with interactive AR placement for tableside ordering.',
    date: '2025-11-12',
    stats: { views: 12400, arActivations: 3200, embedLoads: 8700 },
    featured: true,
  },
  {
    id: 'p2',
    title: 'Cafe Luna Specials',
    client: 'Cafe Luna',
    category: 'restaurant',
    image: ph(400, 350, 'Cafe Luna', 'restaurant'),
    modelUrl: GLB,
    description:
      'Seasonal specials board brought to life in 3D, updated weekly with new dishes and pairings.',
    date: '2025-10-05',
    stats: { views: 8300, arActivations: 1900, embedLoads: 5100 },
    featured: false,
  },
  {
    id: 'p3',
    title: 'Harbor Restaurant',
    client: 'Harbor Grill',
    category: 'restaurant',
    image: ph(400, 450, 'Harbor Grill', 'restaurant'),
    modelUrl: GLB,
    description: 'Complete venue walkthrough with embedded menu 3D models at each table setting.',
    date: '2025-09-18',
    stats: { views: 15600, arActivations: 4100, embedLoads: 11200 },
    featured: true,
  },
  {
    id: 'p4',
    title: 'Wine Bar Collection',
    client: 'Vino & Co',
    category: 'restaurant',
    image: ph(400, 380, 'Vino & Co', 'restaurant'),
    modelUrl: GLB,
    description:
      'Interactive wine bottle display with tasting notes and food pairing suggestions in AR.',
    date: '2025-08-22',
    stats: { views: 6700, arActivations: 1400, embedLoads: 3900 },
    featured: false,
  },
  {
    id: 'p5',
    title: 'Fashion Boutique',
    client: 'Maison Claire',
    category: 'retail',
    image: ph(400, 500, 'Maison Claire', 'retail'),
    modelUrl: GLB,
    description:
      'Virtual storefront experience letting customers browse racks and try AR placement of key pieces.',
    date: '2025-12-01',
    stats: { views: 22100, arActivations: 7800, embedLoads: 14500 },
    featured: true,
  },
  {
    id: 'p6',
    title: 'Electronics Store',
    client: 'TechVault',
    category: 'retail',
    image: ph(400, 350, 'TechVault', 'retail'),
    modelUrl: GLB,
    description:
      'High-fidelity product captures for 150+ electronics with size-accurate AR preview.',
    date: '2025-07-14',
    stats: { views: 18900, arActivations: 5600, embedLoads: 12300 },
    featured: false,
  },
  {
    id: 'p7',
    title: 'Furniture Showroom',
    client: 'Nordic Living',
    category: 'retail',
    image: ph(400, 450, 'Nordic Living', 'retail'),
    modelUrl: GLB,
    description:
      'Room-scale furniture captures enabling customers to visualize pieces in their own spaces.',
    date: '2025-06-30',
    stats: { views: 31200, arActivations: 11400, embedLoads: 19800 },
    featured: true,
  },
  {
    id: 'p8',
    title: 'Hotel Athena Lobby',
    client: 'Hotel Athena',
    category: 'hospitality',
    image: ph(400, 400, 'Hotel Athena', 'hospitality'),
    modelUrl: GLB,
    description: 'Immersive lobby tour with wayfinding hotspots and room category previews.',
    date: '2025-11-28',
    stats: { views: 9800, arActivations: 2100, embedLoads: 6400 },
    featured: false,
  },
  {
    id: 'p9',
    title: 'Spa Center',
    client: 'Serenity Spa',
    category: 'hospitality',
    image: ph(400, 480, 'Serenity Spa', 'hospitality'),
    modelUrl: GLB,
    description: 'Tranquil spa environment captured in full 3D with treatment room walkthroughs.',
    date: '2025-10-15',
    stats: { views: 7200, arActivations: 1600, embedLoads: 4100 },
    featured: false,
  },
  {
    id: 'p10',
    title: 'Tallinn Penthouse',
    client: 'Baltic Realty',
    category: 'real_estate',
    image: ph(400, 500, 'Baltic Realty', 'real_estate'),
    modelUrl: GLB,
    description: 'Luxury penthouse virtual tour with floor plan overlay and measurement tools.',
    date: '2025-12-10',
    stats: { views: 41500, arActivations: 9200, embedLoads: 27600 },
    featured: true,
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    client: 'Maria Chen',
    role: 'Owner, Bistro 55',
    quote:
      'Our 3D menu increased tableside engagement by 40%. Guests love previewing dishes in AR before ordering.',
    rating: 5,
    projectId: 'p1',
  },
  {
    id: 't2',
    client: 'Erik Nordstrom',
    role: 'Director, Nordic Living',
    quote:
      'The furniture AR preview reduced return rates by 28%. Customers buy with confidence when they can see items in their own space.',
    rating: 5,
    projectId: 'p7',
  },
  {
    id: 't3',
    client: 'Andres Tamm',
    role: 'Agent, Baltic Realty',
    quote:
      'Virtual tours brought in 3x more qualified leads. International buyers can explore properties without traveling.',
    rating: 4,
    projectId: 'p10',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtNum = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

const catAccent = (c: PortfolioItem['category']): string =>
  ({
    restaurant: 'bg-orange-900/60 text-orange-300',
    retail: 'bg-blue-900/60 text-blue-300',
    hospitality: 'bg-emerald-900/60 text-emerald-300',
    real_estate: 'bg-purple-900/60 text-purple-300',
  })[c];

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

// ─── PortfolioCard ───────────────────────────────────────────────────────────

const PortfolioCard: React.FC<{ item: PortfolioItem; onSelect: () => void }> = ({
  item,
  onSelect,
}) => {
  const { t } = useTranslation();
  return (
    <article
      className="group relative bg-zinc-900 rounded-xl overflow-hidden break-inside-avoid mb-4 cursor-pointer border border-transparent hover:border-zinc-700 transition-all duration-300"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`View ${item.title} by ${item.client}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <span
          className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${catAccent(item.category)}`}
        >
          {CAT_LABELS[item.category]}
        </span>

        {item.featured && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-amber-900/70 text-amber-300">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d={STAR_PATH} />
            </svg>
            {t('tpl.portfolio.featured')}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-xs text-zinc-400 font-medium">{item.client}</p>
          <h3 className="text-sm font-bold text-zinc-50 mt-0.5">{item.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-400 font-mono">
            <span>
              {fmtNum(item.stats.views)} {t('tpl.portfolio.views')}
            </span>
            <span>{fmtNum(item.stats.arActivations)} AR</span>
          </div>
        </div>
      </div>
    </article>
  );
};

// ─── Lightbox ────────────────────────────────────────────────────────────────

const Lightbox: React.FC<{
  item: PortfolioItem;
  items: PortfolioItem[];
  onClose: () => void;
  onNavigate: (dir: 1 | -1) => void;
}> = ({ item, items, onClose, onNavigate }) => {
  const { t } = useTranslation();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  const idx = items.findIndex((i) => i.id === item.id);

  useEffect(() => {
    setModelLoaded(false);
    setModelError(false);
  }, [item.id]);

  useEffect(() => {
    try {
      import('@google/model-viewer');
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('[PortfolioGallery] model-viewer import failed:', msg);
      }
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && idx > 0) onNavigate(-1);
      if (e.key === 'ArrowRight' && idx < items.length - 1) onNavigate(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNavigate, idx, items.length]);

  const ArrowIcon: React.FC<{ direction: 'left' | 'right' }> = ({ direction }) => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
      />
    </svg>
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col lg:flex-row"
      role="dialog"
      aria-modal="true"
      aria-label={`3D viewer: ${item.title}`}
    >
      {/* 3D Viewport */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #27272a 0%, #09090b 70%)' }}
      >
        {!modelError ? (
          <model-viewer
            key={item.id}
            src={item.modelUrl}
            alt={`3D model of ${item.title}`}
            auto-rotate
            auto-rotate-delay="600"
            rotation-per-second="18deg"
            camera-controls
            camera-orbit="45deg 75deg 1.5m"
            shadow-intensity="1"
            shadow-softness="0.6"
            exposure="1"
            ar
            ar-modes="webxr scene-viewer quick-look"
            touch-action="pan-y"
            interaction-prompt="none"
            loading="eager"
            style={{ width: '100%', height: '100%' }}
            onLoad={() => setModelLoaded(true)}
            onError={() => setModelError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <img
              src={item.image}
              alt={item.title}
              className="w-40 h-40 rounded-2xl object-cover opacity-40"
            />
            <p className="text-zinc-400 text-sm">3D preview unavailable</p>
          </div>
        )}

        {!modelLoaded && !modelError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/70 pointer-events-none">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm font-mono">Loading model...</p>
          </div>
        )}

        {/* Nav arrows */}
        <button
          onClick={() => onNavigate(-1)}
          disabled={idx === 0}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none"
          aria-label="Previous project"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          onClick={() => onNavigate(1)}
          disabled={idx === items.length - 1}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none"
          aria-label="Next project"
        >
          <ArrowIcon direction="right" />
        </button>

        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-zinc-950/80 to-transparent pointer-events-none" />
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-96 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <span className="text-xs text-zinc-500 font-mono">
            {idx + 1} / {items.length}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close viewer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5">
          <div>
            <span
              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-3 ${catAccent(item.category)}`}
            >
              {CAT_LABELS[item.category]}
            </span>
            <h2 className="text-xl font-bold text-zinc-50">{item.title}</h2>
            <p className="text-sm text-zinc-400 mt-1">{item.client}</p>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>

          <div className="grid grid-cols-3 gap-3">
            {(
              [
                [t('tpl.portfolio.views'), fmtNum(item.stats.views)],
                [t('tpl.portfolio.arActivations'), fmtNum(item.stats.arActivations)],
                [t('tpl.portfolio.embedLoads'), fmtNum(item.stats.embedLoads)],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div
                key={label}
                className="bg-zinc-950 rounded-lg p-3 text-center border border-zinc-800"
              >
                <p className="text-lg font-bold text-zinc-100 font-mono">{value}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm py-3 border-t border-zinc-800">
            <span className="text-zinc-500">Completed</span>
            <span className="text-zinc-300 font-mono">
              {new Date(item.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center gap-3 px-5 py-3 border-t border-zinc-800 text-zinc-600 text-[10px] font-mono">
          <span>
            <kbd className="px-1.5 py-0.5 border border-zinc-800 rounded">ESC</kbd> close
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 border border-zinc-800 rounded">&larr; &rarr;</kbd>{' '}
            navigate
          </span>
        </div>
      </aside>
    </div>
  );
};

// ─── StarRating ──────────────────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-zinc-700'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d={STAR_PATH} />
      </svg>
    ))}
  </div>
);

// ─── TestimonialCard ─────────────────────────────────────────────────────────

const TestimonialCard: React.FC<{ testimonial: Testimonial; onViewProject: () => void }> = ({
  testimonial,
  onViewProject,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border-l-2 border-amber-500/60 flex flex-col justify-between">
      <div>
        <StarRating rating={testimonial.rating} />
        <blockquote className="text-sm text-zinc-300 leading-relaxed mt-3 italic">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{testimonial.client}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{testimonial.role}</p>
        </div>
        <button
          onClick={onViewProject}
          className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2"
        >
          {t('tpl.portfolio.viewProject')}
        </button>
      </div>
    </div>
  );
};

// ─── PortfolioGallery (Main) ─────────────────────────────────────────────────

const PortfolioGallery: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  const totalProjects = ITEMS.length;
  const totalViews = useMemo(() => ITEMS.reduce((s, i) => s + i.stats.views, 0), []);
  const featuredCount = useMemo(() => ITEMS.filter((i) => i.featured).length, []);

  const filteredItems = useMemo(() => {
    let result = ITEMS as PortfolioItem[];
    if (activeCategory !== 'all') result = result.filter((i) => i.category === activeCategory);
    if (featuredOnly) result = result.filter((i) => i.featured);
    return result;
  }, [activeCategory, featuredOnly]);

  const handleLightboxNav = (dir: 1 | -1) => {
    if (!lightboxItem) return;
    const i = filteredItems.findIndex((x) => x.id === lightboxItem.id);
    const next = i + dir;
    if (next >= 0 && next < filteredItems.length) setLightboxItem(filteredItems[next]);
  };

  const openForProject = (projectId: string) => {
    const item = ITEMS.find((i) => i.id === projectId);
    if (item) {
      setActiveCategory('all');
      setFeaturedOnly(false);
      setLightboxItem(item);
    }
  };

  if (import.meta.env.DEV) {
    console.warn('[PortfolioGallery] project id:', id);
  }

  return (
    <>
      <SEO
        title="Our Work"
        description="Explore our portfolio of 3D captures across industries. Interactive AR experiences for restaurants, retail, hospitality, and real estate."
      />

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* ── Hero ── */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-50 tracking-tight">
              {t('tpl.portfolio.heading')}
            </h1>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              {t('tpl.portfolio.subtitle')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-8 sm:gap-12">
              {(
                [
                  [String(totalProjects), 'Projects', 'text-zinc-100'],
                  [fmtNum(totalViews), 'Total Views', 'text-zinc-100'],
                  [String(featuredCount), 'Featured', 'text-amber-400'],
                ] as const
              ).map(([value, label, color], i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div className="w-px h-10 bg-zinc-800" />}
                  <div className="text-center">
                    <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ── Filter Bar ── */}
        <section className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                {(Object.keys(CAT_LABELS) as CategoryFilter[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    {CAT_LABELS[cat]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFeaturedOnly(!featuredOnly)}
                  aria-pressed={featuredOnly}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    featuredOnly ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span
                    className={`relative w-8 h-[18px] rounded-full transition-colors ${
                      featuredOnly ? 'bg-amber-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${
                        featuredOnly ? 'translate-x-[16px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </span>
                  Featured Only
                </button>
                <span className="text-xs text-zinc-500 font-mono">
                  {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Masonry Gallery ── */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-500 text-sm">{t('tpl.portfolio.noProjects')}</p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setFeaturedOnly(false);
                }}
                className="mt-3 text-sm text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filteredItems.map((item) => (
                <PortfolioCard key={item.id} item={item} onSelect={() => setLightboxItem(item)} />
              ))}
            </div>
          )}
        </main>

        {/* ── Testimonials ── */}
        <section className="border-t border-zinc-900 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 text-center mb-10">
              {t('tpl.portfolio.testimonials')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <TestimonialCard
                  key={t.id}
                  testimonial={t}
                  onViewProject={() => openForProject(t.projectId)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="border-t border-zinc-900 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50">
              Ready to showcase your space in 3D?
            </h2>
            <Link
              to="/request"
              className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-amber-500 text-zinc-950 font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 active:scale-95"
            >
              {t('cta.getQuote')}
            </Link>
            <p className="mt-4 text-xs text-zinc-500">{t('cta.reassurance')}</p>
          </div>
        </section>

        <footer className="border-t border-zinc-900 py-8 text-center text-zinc-700 text-xs font-mono">
          {t('tpl.portfolio.poweredBy')}
        </footer>
      </div>

      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          items={filteredItems}
          onClose={() => setLightboxItem(null)}
          onNavigate={handleLightboxNav}
        />
      )}
    </>
  );
};

export default PortfolioGallery;
