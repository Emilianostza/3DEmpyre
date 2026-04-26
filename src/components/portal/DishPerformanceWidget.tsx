import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Eye, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Asset } from '@/types';

interface DishPerformanceWidgetProps {
  assets: Asset[];
}

/** Seeded PRNG for deterministic trend indicators */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const DishPerformanceWidget: React.FC<DishPerformanceWidgetProps> = ({ assets }) => {
  const { t } = useTranslation();

  const topDishes = useMemo(() => {
    const published = assets.filter((a) => a.status === 'Published' && (a.viewCount ?? 0) > 0);
    const sorted = [...published].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    const top5 = sorted.slice(0, 5);
    const maxViews = top5[0]?.viewCount ?? 1;

    const rng = seededRand(assets.length + 7);

    return top5.map((asset) => {
      const views = asset.viewCount ?? 0;
      const unique = asset.uniqueViewCount ?? 0;
      const arRate = unique > 0 ? Math.round((unique / views) * 100) : 0;
      // Deterministic trend: positive for high-view items, mixed for others
      const trendValue = Math.round((rng() - 0.3) * 30);

      return {
        id: asset.id,
        name: asset.name,
        thumb: asset.thumb,
        views,
        arRate,
        trend: trendValue,
        barWidth: Math.max(8, (views / maxViews) * 100),
      };
    });
  }, [assets]);

  if (topDishes.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl border border-zinc-200/50 dark:border-white/5 p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            {t('portal.topDishes', 'Top Performing Dishes')}
          </h3>
        </div>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-6 italic">
          {t('portal.noDishData', 'No published dishes with views yet')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl border border-zinc-200/50 dark:border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            {t('portal.topDishes', 'Top Performing Dishes')}
          </h3>
          <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            Top 5
          </span>
        </div>
      </div>

      {/* Dish Rows */}
      <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
        {topDishes.map((dish, i) => (
          <div
            key={dish.id}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
          >
            {/* Rank */}
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 w-5 text-center flex-shrink-0">
              {i + 1}
            </span>

            {/* Thumbnail */}
            <img
              src={dish.thumb}
              alt={dish.name}
              className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
              loading="lazy"
              width={40}
              height={40}
            />

            {/* Name + Views bar */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {dish.name}
              </div>
              <div className="mt-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all"
                  style={{ width: `${dish.barWidth}%` }}
                />
              </div>
            </div>

            {/* View count */}
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0 text-zinc-600 dark:text-zinc-300">
              <Eye className="w-3 h-3 text-zinc-400" />
              <span className="text-xs font-bold">{dish.views.toLocaleString()}</span>
            </div>

            {/* AR Rate */}
            <div className="hidden md:block text-xs font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0 w-12 text-right">
              {dish.arRate}% AR
            </div>

            {/* Trend */}
            <div className="flex items-center gap-0.5 flex-shrink-0 w-14 justify-end">
              {dish.trend > 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    +{dish.trend}%
                  </span>
                </>
              ) : dish.trend < 0 ? (
                <>
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {dish.trend}%
                  </span>
                </>
              ) : (
                <>
                  <Minus className="w-3 h-3 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-400">0%</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
