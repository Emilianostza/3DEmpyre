import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Asset } from '@/types';
import { AssetsProvider } from '@/services/dataProvider';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Search,
  ShieldCheck,
  Users,
  Zap,
  X,
  ArrowRight,
  Tag,
  Store,
  Eye,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';
import { LoadingState, ErrorState, EmptyState } from '@/components/common/PageState';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useEscapeKey } from '@/hooks/useEscapeKey';

const isForSale = (asset: Asset) => asset.marketplace_listed === true;

const Library: React.FC = () => {
  const { t } = useTranslation();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [purchased, setPurchased] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const modalRef = useFocusTrap<HTMLDivElement>(Boolean(selectedAsset));
  useEscapeKey(() => setSelectedAsset(null), Boolean(selectedAsset));

  useEffect(() => {
    if (selectedAsset) {
      import('@google/model-viewer');
    }
  }, [selectedAsset]);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AssetsProvider.list();
      const published = (data as Asset[]).filter((a) => a.status === 'Published');
      setAssets(published);
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('Failed to load library:', err);
      setError(err instanceof Error ? err.message : 'Failed to load library.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    assets.forEach((a) => {
      const cat = isForSale(a) ? a.marketplace_category : a.type;
      if (cat) cats.add(cat);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      const assetCategory = isForSale(asset) ? asset.marketplace_category : asset.type;
      const matchesFilter = filter === 'All' || assetCategory === filter;
      return matchesSearch && matchesFilter;
    });
  }, [assets, searchTerm, filter]);

  return (
    <div
      className="bg-zinc-950 min-h-screen"
      {...(import.meta.env.DEV && {
        'data-component': 'Model Library',
        'data-file': 'src/pages/Library.tsx',
      })}
    >
      <SEO title={t('library.seo.title')} description={t('library.seo.desc')} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: t('library.seo.title'), path: '/library' },
        ]}
      />

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wider uppercase border border-emerald-500/20 mb-6">
            <Store className="w-3.5 h-3.5" />
            {t('library.badge')}
          </span>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-2 leading-tight">
            {t('library.hero.line1')}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {t('library.hero.line2')}
            </span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mt-5 mb-6 leading-relaxed">
            {t('library.hero.subtitle')}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 text-sm font-medium mb-8">
            <Users className="w-4 h-4" />
            {t('library.hero.splitBadge')}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#collection"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/30"
            >
              {t('library.hero.browse')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
            >
              {t('library.hero.listYours')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ────────────────────────────────── */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-zinc-400">
            {[
              { icon: ShieldCheck, label: t('library.trust.quality') },
              { icon: Box, label: t('library.trust.arReady') },
              { icon: Users, label: t('library.trust.split') },
              { icon: Zap, label: t('library.trust.embed') },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 font-medium">
                <Icon className="w-4 h-4 text-emerald-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collection ─────────────────────────────────── */}
      <section id="collection" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {/* Filter + Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  aria-pressed={filter === cat}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    filter === cat
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-emerald-500 hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder={t('library.search', 'Search models...')}
                aria-label="Search marketplace models"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-600 bg-zinc-800 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <LoadingState message={t('library.loading')} compact />
          ) : error ? (
            <ErrorState
              title={t('library.errorTitle')}
              message={error}
              onRetry={fetchAssets}
              compact
            />
          ) : filteredAssets.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {filteredAssets.map((asset) => (
                <button
                  type="button"
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  aria-label={`View model: ${asset.name}`}
                  className="group break-inside-avoid bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-emerald-700 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] text-left w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-700">
                    <img
                      src={asset.thumb}
                      alt={asset.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                      loading="lazy"
                      width={400}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye className="w-12 h-12 text-white drop-shadow-2xl" />
                      </div>
                    </div>
                    {/* Category badge */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-zinc-900/95 rounded-full text-xs font-bold text-white shadow-md backdrop-blur-sm border border-zinc-700/50">
                      {isForSale(asset) ? asset.marketplace_category : (asset.type || 'Model')}
                    </div>
                    {/* Price / Portfolio badge */}
                    {isForSale(asset) ? (
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-900/90 rounded-full text-xs font-bold text-emerald-300 shadow-md backdrop-blur-sm border border-emerald-700/50 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        &euro;{asset.marketplace_price}
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-brand-900/90 rounded-full text-xs font-bold text-brand-300 shadow-md backdrop-blur-sm border border-brand-700/50">
                        {t('library.card.portfolio')}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-1">
                      {asset.name}
                    </h3>
                    {isForSale(asset) && (
                      <p className="text-xs text-zinc-500 mb-3">
                        {t('library.card.by')} {asset.marketplace_seller}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5" />
                        <span className="font-medium">{asset.size || '3 MB'}</span>
                      </div>
                      <span className="font-medium">
                        {asset.viewCount?.toLocaleString() || 0} {t('library.card.views')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title={t('library.emptyTitle')}
              message={
                searchTerm || filter !== 'All'
                  ? t('library.emptyFiltered')
                  : t('library.emptyDefault')
              }
              action={
                searchTerm || filter !== 'All'
                  ? {
                      label: t('library.clearFilters'),
                      onClick: () => {
                        setFilter('All');
                        setSearchTerm('');
                      },
                    }
                  : { label: t('library.hero.listYours'), to: '/how-it-works' }
              }
              compact
            />
          )}
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────── */}
      <section className="relative py-24 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />

        <div className="relative container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('library.cta.heading')}
          </h2>
          <p className="text-zinc-400 text-lg mb-10">{t('library.cta.desc')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/request"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/30"
            >
              {t('library.cta.quote')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
            >
              {t('library.cta.howItWorks')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Detail Modal ───────────────────────────────── */}
      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`Model details: ${selectedAsset.name}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAsset(null);
          }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-6xl bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[75vh] animate-slide-up"
          >
            <button
              onClick={() => setSelectedAsset(null)}
              className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/30 active:bg-white/40 rounded-full text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Viewer */}
            <div className="flex-1 bg-zinc-800 relative">
              <model-viewer
                src={
                  selectedAsset.file_key?.startsWith('http') ? selectedAsset.file_key : undefined
                }
                poster={selectedAsset.thumb}
                alt={selectedAsset.name}
                auto-rotate
                camera-controls
                shadow-intensity="1"
                ar
                loading="eager"
                reveal="auto"
                style={{ width: '100%', height: '100%' }}
              />
              {!selectedAsset.file_key?.startsWith('http') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={selectedAsset.thumb}
                    alt={selectedAsset.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-96 bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 p-6 md:p-8 flex flex-col overflow-y-auto">
              <div>
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 border ${
                  isForSale(selectedAsset)
                    ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
                    : 'bg-brand-900/30 text-brand-300 border-brand-800'
                }`}>
                  {isForSale(selectedAsset) ? selectedAsset.marketplace_category : (selectedAsset.type || 'Model')}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  {selectedAsset.name}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {t('library.modal.desc', 'Production-ready 3D model optimized for web and AR experiences.')}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6 bg-zinc-800/50 rounded-xl p-4 border border-zinc-800">
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium text-zinc-400">
                    {t('library.modal.fileSize')}
                  </span>
                  <span className="text-sm font-bold text-white">{selectedAsset.size}</span>
                </div>
                <div className="h-px bg-zinc-700" />
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium text-zinc-400">
                    {t('library.modal.format')}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {t('library.modal.formatValue')}
                  </span>
                </div>
                <div className="h-px bg-zinc-700" />
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium text-zinc-400">
                    {t('library.modal.views')}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {selectedAsset.viewCount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Price — marketplace items only */}
              {isForSale(selectedAsset) && (
                <>
                  <div className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-400">
                        {t('library.modal.price')}
                      </span>
                      <span className="text-3xl font-black text-white">
                        &euro;{selectedAsset.marketplace_price}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400/70 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t('library.modal.creatorNote')}
                    </p>
                    <p className="text-xs text-amber-400/70 flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {t('library.modal.charityNote')}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-500 mb-6">
                    {t('library.modal.seller')}{' '}
                    <span className="text-zinc-300 font-semibold">
                      {selectedAsset.marketplace_seller}
                    </span>
                  </p>
                </>
              )}

              {/* Portfolio info — non-marketplace items */}
              {!isForSale(selectedAsset) && (
                <div className="mb-6 p-4 rounded-xl bg-brand-950/30 border border-brand-800/40">
                  <p className="text-sm text-zinc-300">
                    {t('library.modal.portfolioDesc')}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto space-y-3">
                {isForSale(selectedAsset) ? (
                  <>
                    {purchased === selectedAsset.id ? (
                      <div className="w-full py-3.5 bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 rounded-xl font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        {t('library.modal.purchased', 'Purchased')}
                      </div>
                    ) : (
                      <button
                        onClick={() => setPurchased(selectedAsset.id)}
                        className="group w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-100 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t('library.modal.buy', 'Buy Now')} — &euro;{selectedAsset.marketplace_price}
                      </button>
                    )}
                  </>
                ) : (
                  <Link
                    to="/request"
                    className="group w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:scale-105 active:scale-100 flex items-center justify-center gap-2"
                  >
                    {t('library.modal.requestSimilar')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <button
                  onClick={() => window.open(`/view/${selectedAsset.id}`, '_blank')}
                  className="group w-full py-3.5 border-2 border-zinc-700 text-zinc-300 rounded-xl font-bold hover:bg-zinc-800 hover:border-emerald-700 transition-all hover:scale-105 active:scale-100 flex items-center justify-center gap-2"
                >
                  {t('library.modal.viewAR')}
                  <Box className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
