import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Link } from 'react-router-dom';
import {
  Share2,
  QrCode,
  Pencil,
  Box,
  Edit,
  PackageOpen,
  LayoutGrid,
  List,
  Eye,
  Clock,
  Upload,
  Search,
} from 'lucide-react';
import { Asset } from '@/types';

import { QRCodeModal } from '@/components/portal/QRCodeModal';
import { FilterChips } from '@/components/portal/FilterChips';
import { PhotoUploadWizard } from '@/components/portal/PhotoUploadWizard';
import type { PhotogrammetryJobDTO } from '@/types/photogrammetry';

interface AssetGridProps {
  assets: Asset[];
  role: 'employee' | 'customer';
  onUploadComplete?: (fileCount: number) => void;
  projectId?: string;
}

type SortOption = 'newest' | 'oldest' | 'views' | 'name';

export const AssetGrid: React.FC<AssetGridProps> = ({ assets, role, onUploadComplete, projectId }) => {
  const { t } = useTranslation();
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [showWizard, setShowWizard] = useState(false);

  // Derive projectId from assets if not explicitly provided
  const effectiveProjectId = projectId ?? assets[0]?.project_id ?? '';

  const handleJobCreated = useCallback((job: PhotogrammetryJobDTO) => {
    setShowWizard(false);
    onUploadComplete?.(job.total_photos);
  }, [onUploadComplete]);

  // Derive unique categories from assets
  const categories = useMemo(() => {
    const uniqueTypes = Array.from(new Set(assets.map((a) => a.type || 'Uncategorized')));
    return ['All', ...uniqueTypes.sort()];
  }, [assets]);

  // Filter and sort assets
  const processedAssets = useMemo(() => {
    // Search filtering first
    const searched = debouncedSearch
      ? assets.filter((a) => a.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      : assets;

    // Then category filtering
    const filtered =
      activeCategory === 'All'
        ? [...searched]
        : searched.filter((a) => (a.type || 'Uncategorized') === activeCategory);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updated || 0).getTime() - new Date(a.updated || 0).getTime();
        case 'oldest':
          return new Date(a.updated || 0).getTime() - new Date(b.updated || 0).getTime();
        case 'views':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [assets, activeCategory, sortBy, searchTerm]);

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 shadow-sm">
          <PackageOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          {t('assetGrid.noAssetsFound')}
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-sm leading-relaxed">
          {t('assetGrid.emptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QRCodeModal
        isOpen={Boolean(selectedAssetForQR)}
        onClose={() => setSelectedAssetForQR(null)}
        asset={selectedAssetForQR}
      />

      {/* Upload Wizard Modal */}
      {showWizard && effectiveProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <PhotoUploadWizard
              projectId={effectiveProjectId}
              onJobCreated={handleJobCreated}
              onCancel={() => setShowWizard(false)}
            />
          </div>
        </div>
      )}

      {/* Controls Header — only for employee role */}
      {role === 'employee' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          {/* Search Input */}
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={t('assetGrid.searchAssets', 'Search assets')}
              aria-label={t('assetGrid.searchAssets', 'Search assets')}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 w-40 text-zinc-900 dark:text-zinc-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none w-full md:w-auto p-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* View & Sort Controls + Upload Button */}
          <div className="flex items-center gap-2 w-full md:w-auto px-1">
            <button
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30"
            >
              <Upload className="w-4 h-4" />
              {t('techUpload.title', 'Upload Photos')}
            </button>

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1" role="group" aria-label={t('assetGrid.viewMode', 'View mode')}>
              <button
                onClick={() => setViewMode('grid')}
                aria-label={t('assetGrid.gridView', 'Grid view')}
                aria-pressed={viewMode === 'grid'}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label={t('assetGrid.listView', 'List view')}
                aria-pressed={viewMode === 'list'}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label={t('assetGrid.sortBy', 'Sort by')}
              className="bg-transparent text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <option value="newest">{t('assetGrid.newestFirst')}</option>
              <option value="oldest">{t('assetGrid.oldestFirst')}</option>
              <option value="views">{t('assetGrid.mostViewed')}</option>
              <option value="name">{t('assetGrid.nameAZ')}</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      <FilterChips
        filters={[
          ...(activeCategory !== 'All'
            ? [{ key: 'category', label: t('filterChips.category', 'Category'), value: activeCategory }]
            : []),
          ...(sortBy !== 'newest' ? [{ key: 'sort', label: t('filterChips.sort', 'Sort'), value: sortBy }] : []),
          ...(searchTerm ? [{ key: 'search', label: t('filterChips.search', 'Search'), value: searchTerm }] : []),
        ]}
        onRemove={(key) => {
          if (key === 'category') setActiveCategory('All');
          if (key === 'sort') setSortBy('newest');
          if (key === 'search') setSearchTerm('');
        }}
        onClearAll={() => {
          setActiveCategory('All');
          setSortBy('newest');
          setSearchTerm('');
        }}
        className="mb-4"
      />

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {processedAssets.map((asset) => {
            const statusCls =
              asset.status === 'Published'
                ? {
                    badge:
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                    dot: 'bg-emerald-500',
                    gradient: 'from-emerald-400/20 via-teal-300/10 to-transparent',
                  }
                : asset.status === 'In Review'
                  ? {
                      badge:
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                      dot: 'bg-orange-500',
                      gradient: 'from-orange-400/20 via-amber-300/10 to-transparent',
                    }
                  : {
                      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      dot: 'bg-blue-500',
                      gradient: 'from-blue-400/20 via-sky-300/10 to-transparent',
                    };
            const views = asset.viewCount || 0;

            return (
              <div
                key={asset.id}
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Hero section */}
                <div
                  className={`relative h-36 bg-gradient-to-br ${statusCls.gradient} dark:opacity-80 overflow-hidden`}
                >
                  <div
                    className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {asset.thumb ? (
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={asset.thumb}
                        alt={asset.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Box className="w-10 h-10 text-zinc-300 dark:text-zinc-700 opacity-50" />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 backdrop-blur-sm shadow-sm ${statusCls.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCls.dot}`} />
                      {t(`assetGrid.status.${asset.status.toLowerCase()}`, asset.status)}
                    </span>
                  </div>

                  {/* View count badge */}
                  {views > 0 && (
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-full px-2.5 py-1 backdrop-blur-sm shadow-sm">
                        <Eye className="w-3 h-3" />
                        {views.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="px-5 pb-5 pt-4">
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white leading-snug tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {asset.name}
                  </h3>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                    {asset.type || t('assetGrid.3dModel')}
                  </p>

                  {/* Stats strip */}
                  <div className="flex items-center gap-4 mt-4 text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {asset.file_size
                          ? (asset.file_size / 1024 / 1024).toFixed(1) + ' MB'
                          : t('assetGrid.3dModel')}
                      </span>
                    </div>
                    <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-700" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {new Date(asset.updated || Date.now()).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center gap-3">
                    <Link
                      to={`/project/${asset.project_id}/menu`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-sm font-bold text-zinc-700 dark:text-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 hover:-translate-y-0.5 transition-all group/btn whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover/btn:text-brand-500 transition-colors" />
                      {t('portal.openProject', 'Open')}
                    </Link>
                    <Link
                      to={`/project/${asset.project_id}/menu/edit`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 border border-transparent text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all group/btn whitespace-nowrap"
                    >
                      <Pencil className="w-4 h-4 text-brand-100 group-hover/btn:-rotate-12 transition-transform duration-300" />
                      {t('portal.editMenu', 'Edit Menu')}
                    </Link>
                    <button
                      onClick={() => setSelectedAssetForQR(asset)}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/30 shadow-sm hover:shadow-md transition-all group/btn flex-shrink-0"
                      title={t('portal.qrCode', 'QR Code')}
                      aria-label={t('portal.qrCode', 'QR Code')}
                    >
                      <QrCode className="w-4 h-4 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-4 font-medium">{t('assetGrid.thAsset')}</th>
                <th className="px-6 py-4 font-medium">{t('assetGrid.thStatus')}</th>
                <th className="px-6 py-4 font-medium">{t('assetGrid.thType')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('assetGrid.thViews')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('assetGrid.thLastUpdated')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('assetGrid.thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {processedAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={asset.thumb}
                        alt={asset.name}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800"
                        loading="lazy"
                        width={48}
                        height={48}
                      />
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white">{asset.name}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">
                          {asset.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        asset.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          asset.status === 'Published' ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}
                      />
                      {t(`assetGrid.status.${asset.status.toLowerCase()}`, asset.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {asset.type || t('assetGrid.standard')}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-600 dark:text-zinc-400">
                    {(asset.viewCount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-600 dark:text-zinc-400">
                    {new Date(asset.updated || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/project/${asset.project_id}/menu/edit`}>
                        <button
                          className="p-2 text-zinc-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                          aria-label={`Edit ${asset.name}`}
                        >
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setSelectedAssetForQR(asset)}
                        aria-label={`Share ${asset.name}`}
                        className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
