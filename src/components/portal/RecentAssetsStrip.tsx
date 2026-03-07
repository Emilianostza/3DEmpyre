import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Asset } from '@/types';
import { Box, ArrowRight, Eye } from 'lucide-react';

interface RecentAssetsStripProps {
  assets: Asset[];
}

export const RecentAssetsStrip: React.FC<RecentAssetsStripProps> = ({ assets }) => {
  const { t } = useTranslation();
  // Show up to 8 most recent assets
  const recentAssets = [...assets]
    .sort((a, b) => new Date(b.updated || 0).getTime() - new Date(a.updated || 0).getTime())
    .slice(0, 8);

  if (recentAssets.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-serif-premium text-zinc-900 dark:text-white tracking-wide">
            {t('recentAssets.title')}
          </h3>
        </div>
        <div className="flex items-center justify-center py-8 text-zinc-400 dark:text-zinc-600">
          <Box className="w-6 h-6 mr-2" />
          <span className="text-sm">{t('recentAssets.noAssetsYet')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-serif-premium text-zinc-900 dark:text-white tracking-wide">
          {t('recentAssets.title')}
        </h3>
        <Link
          to="/portal/dashboard"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
        >
          {t('recentAssets.viewAll')} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {recentAssets.map((asset) => (
          <Link
            key={asset.id}
            to={asset.project_id ? `/project/${asset.project_id}/menu` : `/app/editor/${asset.id}`}
            className="group flex-shrink-0 w-36"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2 border border-zinc-200 dark:border-zinc-700 group-hover:border-brand-400 dark:group-hover:border-brand-600 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-0.5">
              <img
                src={asset.thumb}
                alt={asset.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                width={144}
                height={144}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Status dot */}
              <div className="absolute top-2 right-2">
                <span
                  className={`block w-2 h-2 rounded-full shadow-sm ${asset.status === 'Published'
                      ? 'bg-emerald-400'
                      : asset.status === 'In Review'
                        ? 'bg-orange-400'
                        : 'bg-zinc-400'
                    }`}
                />
              </div>

              {/* 3D badge */}
              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-xs font-bold px-2 py-0.5 rounded-md text-zinc-900 dark:text-white flex items-center gap-1">
                  <Box className="w-3 h-3" /> 3D
                </div>
              </div>

              {/* Views on hover */}
              {asset.viewCount !== undefined && asset.viewCount > 0 && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/70 backdrop-blur-sm text-xs font-medium px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {asset.viewCount}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {asset.name}
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
              {asset.type || t('recentAssets.3dModel')} · {t(`assetGrid.status.${asset.status.toLowerCase()}`, asset.status)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};
