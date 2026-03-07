import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChefHat,
  ShoppingBag,
  Building2,
  Palette,
  Star,
  ArrowRight,
  Lock,
  Crown,
  Sparkles,
  LayoutGrid,
  Landmark,
} from 'lucide-react';
import { placeholder } from '@/config/site';
import { SEO } from '@/components/common/SEO';

// ── Template Data ───────────────────────────────────────────────

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'restaurant' | 'retail' | 'real_estate' | 'portfolio' | 'museum';
  thumbnail: string;
  features: string[];
  available: boolean;
  popular?: boolean;
  link?: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    description:
      'Interactive 3D menu with categories, dietary filters, AR view, and QR code support. Perfect for fine dining and casual restaurants.',
    category: 'restaurant',
    thumbnail: placeholder(400, 280, 'Restaurant Menu', 270),
    features: [
      'Multi-category menu layout',
      'Dietary tags and allergen filters',
      'QR code per dish for AR',
      'Mobile-first responsive design',
      'Real-time item management',
    ],
    available: true,
    popular: true,
    link: '/project/PRJ-001/menu',
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description:
      'Showcase individual products with 360-degree rotation, zoom, AR try-on, and buy-now integration for e-commerce.',
    category: 'retail',
    thumbnail: placeholder(400, 280, 'Product Showcase', 200),
    features: [
      '360-degree product rotation',
      'Zoom and detail view',
      'AR try-on / place-in-room',
      'Buy-now button integration',
      'Product variant switcher',
    ],
    available: true,
    link: '/project/PRJ-001/showcase',
  },
  {
    id: 'artifact-viewer',
    name: 'Artifact Viewer',
    description:
      'Museum-grade artifact viewer with timeline navigation, collection tabs, curator notes, and interactive 3D inspection.',
    category: 'museum',
    thumbnail: placeholder(400, 280, 'Artifact Viewer', 220),
    features: [
      'Timeline-based navigation',
      'Collection and period tabs',
      'Curator notes and provenance',
      '3D inspection with zoom',
      'Condition grading display',
    ],
    available: true,
    popular: true,
    link: '/project/PRJ-001/artifacts',
  },
  {
    id: 'catalog-grid',
    name: 'Catalog Grid',
    description:
      'Multi-product catalog layout with filtering, search, and comparison view. Ideal for retail collections and seasonal lines.',
    category: 'retail',
    thumbnail: placeholder(400, 280, 'Catalog Grid', 30),
    features: [
      'Filterable product grid',
      'Quick-view 3D preview',
      'Side-by-side comparison',
      'Wishlist and sharing',
      'Batch QR code generation',
    ],
    available: true,
    link: '/project/PRJ-001/catalog',
  },
  {
    id: 'daily-specials',
    name: 'Daily Specials',
    description:
      'Rotating specials board with scheduling, countdown timers, and featured dish spotlight. Update items in seconds.',
    category: 'restaurant',
    thumbnail: placeholder(400, 280, 'Daily Specials', 340),
    features: [
      'Scheduled specials rotation',
      'Featured dish spotlight',
      'Countdown timers',
      'Simple drag-and-drop editor',
      'Auto-archive past specials',
    ],
    available: true,
    popular: true,
    link: '/project/PRJ-001/specials',
  },
  {
    id: 'portfolio-gallery',
    name: 'Portfolio Gallery',
    description:
      'Showcase your best 3D work with a curated gallery view. Filterable by category, client, or project type.',
    category: 'portfolio',
    thumbnail: placeholder(400, 280, 'Portfolio', 50),
    features: [
      'Masonry grid layout',
      'Category and tag filtering',
      'Lightbox 3D viewer',
      'Client testimonial cards',
      'Social sharing buttons',
    ],
    available: true,
    link: '/project/PRJ-001/portfolio',
  },
];

const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  restaurant: { label: 'Restaurant', icon: ChefHat, color: 'text-orange-500' },
  retail: { label: 'Retail', icon: ShoppingBag, color: 'text-blue-500' },
  real_estate: { label: 'Real Estate', icon: Building2, color: 'text-emerald-500' },
  portfolio: { label: 'Portfolio', icon: Palette, color: 'text-purple-500' },
  museum: { label: 'Museum', icon: Landmark, color: 'text-amber-500' },
};

// ── Component ───────────────────────────────────────────────────

const TemplateGallery: React.FC = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...new Set(TEMPLATES.map((t) => t.category))];
  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SEO title={t('templates.seo.title')} description={t('templates.seo.desc')} />

      <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
              <LayoutGrid className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
              {t('templates.hero.heading')}
            </h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 max-w-xl">
            {t('templates.hero.subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const meta = CATEGORY_MAP[cat];
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                {meta && (
                  <meta.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : meta.color}`} />
                )}
                {cat === 'all' ? t('templates.filter.all') : (meta?.label ?? cat)}
              </button>
            );
          })}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((template) => {
            const catMeta = CATEGORY_MAP[template.category];
            const CatIcon = catMeta?.icon ?? Star;

            return (
              <div
                key={template.id}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all group ${
                  template.available
                    ? 'border-zinc-200 dark:border-zinc-800 hover:border-brand-300 dark:hover:border-brand-700'
                    : 'border-zinc-200 dark:border-zinc-800 opacity-80'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[10/7] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    width={400}
                    height={280}
                    loading="lazy"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {template.popular && (
                      <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                        <Star className="w-3 h-3" />
                        {t('templates.badge.popular')}
                      </span>
                    )}
                    {!template.available && (
                      <span className="flex items-center gap-1 bg-zinc-900/80 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm">
                        <Lock className="w-3 h-3" />
                        {t('templates.badge.comingSoon')}
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span
                      className={`flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full ${catMeta?.color ?? 'text-zinc-500'}`}
                    >
                      <CatIcon className="w-3 h-3" />
                      {catMeta?.label ?? template.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1.5">
                    {template.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-5">
                    {template.features.slice(0, 3).map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                      >
                        <Sparkles className="w-3 h-3 text-brand-500 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                    {template.features.length > 3 && (
                      <li className="text-xs text-zinc-400 dark:text-zinc-500 pl-5">
                        {t('templates.moreFeatures', { count: template.features.length - 3 })}
                      </li>
                    )}
                  </ul>

                  {/* Action */}
                  {template.available && template.link ? (
                    <Link
                      to={template.link}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      {t('templates.useTemplate')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 text-sm font-semibold rounded-xl cursor-not-allowed"
                    >
                      <Crown className="w-4 h-4" />
                      {t('templates.badge.comingSoon')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-lg mx-auto">
            <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              {t('templates.customCta.heading')}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
              {t('templates.customCta.desc')}
            </p>
            <Link
              to="/request"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {t('templates.customCta.button')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
