import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Asset } from '@/types';
import {
  Eye,
  TrendingUp,
  Users,
  Clock,
  MousePointer,
  Smartphone,
  Globe,
  ChevronDown,
  ChevronUp,
  Lock,
  X,
  Zap,
  Star,
  Crown,
  Check,
  ArrowRight,
} from 'lucide-react';

const PRIORITY_SUPPORT_ADDON = { label: 'Priority support', price: 10 };

// Subscription tiers shown in the upgrade modal
const UPGRADE_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    baseMonthly: 0,
    addonMonthly: 0,
    icon: Zap,
    color: 'zinc',
    description: 'Basic portal access with asset library',
    features: ['Asset library', 'Hosted viewer links', 'QR codes', '2 projects'],
    current: true,
  },
  {
    id: 'business',
    name: 'Business',
    baseMonthly: 20,
    addonMonthly: 20,
    icon: Star,
    color: 'brand',
    description: 'Full analytics + priority support',
    features: [
      'Everything in Starter',
      'Performance Analytics',
      'Detailed viewer metrics',
      'Export reports',
      'Unlimited projects',
    ],
    highlighted: true,
    current: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    baseMonthly: 49,
    addonMonthly: 20,
    icon: Crown,
    color: 'purple',
    description: 'API access & dedicated SLA',
    features: ['Everything in Business', 'API access', 'Dedicated SLA', 'Custom integrations'],
    current: false,
  },
];

// ── Helpers ─────────────────────────────────────────────────────

/** Simple seedable PRNG for deterministic chart data */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Format a number with K suffix for thousands */
function formatCompact(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Generate date labels for the last N days */
function getDateLabels(count: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  const step = Math.floor(count / 4);
  for (let i = 0; i < 5; i++) {
    const d = new Date(now.getTime() - (count - 1 - i * step) * 86400000);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
}

// ── Component ───────────────────────────────────────────────────

interface AssetAnalyticsBoardProps {
  assets: Asset[];
  locked?: boolean;
  /** Controlled date range — syncs with URL search params */
  dateRange?: string;
  /** Called when date range changes (for URL sync) */
  onDateRangeChange?: (range: string) => void;
}

export const AssetAnalyticsBoard: React.FC<AssetAnalyticsBoardProps> = ({
  assets,
  locked = false,
  dateRange: controlledDateRange,
  onDateRangeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'starter' | 'business' | 'enterprise'>(
    'business'
  );
  const [addPrioritySupport, setAddPrioritySupport] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalViews = assets.reduce((sum, asset) => sum + (asset.viewCount || 0), 0);
    const uniqueViews = assets.reduce((sum, asset) => sum + (asset.uniqueViewCount || 0), 0);

    // Interaction rate: unique / total (capped at 100%)
    const interactionRate = totalViews > 0 ? Math.min(100, (uniqueViews / totalViews) * 100) : 0;

    // Sort assets by view count descending
    const topAssets = [...assets]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5);

    // Compute period-over-period change using first/second half of assets
    const sorted = [...assets].sort(
      (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);
    const firstHalfViews = firstHalf.reduce((s, a) => s + (a.viewCount || 0), 0);
    const secondHalfViews = secondHalf.reduce((s, a) => s + (a.viewCount || 0), 0);
    const viewsChange =
      firstHalfViews > 0
        ? (((secondHalfViews - firstHalfViews) / firstHalfViews) * 100).toFixed(1)
        : null;

    const firstHalfUnique = firstHalf.reduce((s, a) => s + (a.uniqueViewCount || 0), 0);
    const secondHalfUnique = secondHalf.reduce((s, a) => s + (a.uniqueViewCount || 0), 0);
    const uniqueChange =
      firstHalfUnique > 0
        ? (((secondHalfUnique - firstHalfUnique) / firstHalfUnique) * 100).toFixed(1)
        : null;

    return { totalViews, uniqueViews, interactionRate, topAssets, viewsChange, uniqueChange };
  }, [assets]);

  // Deterministic chart data seeded from total views (stable across renders)
  const chartData = useMemo(() => {
    const seed = stats.totalViews > 0 ? stats.totalViews : 42;
    const rng = seededRandom(seed);
    const data = [];
    const avgDaily = assets.length > 0 ? Math.max(5, Math.round(stats.totalViews / 30)) : 30;
    for (let i = 1; i <= 30; i++) {
      // Upward trend with controlled noise
      const trend = avgDaily * (0.7 + (i / 30) * 0.6);
      const noise = (rng() - 0.5) * avgDaily * 0.4;
      data.push({ day: i, views: Math.max(1, Math.round(trend + noise)) });
    }
    return data;
  }, [assets.length, stats.totalViews]);

  const dateLabels = useMemo(() => getDateLabels(30), []);

  const maxChartViews = Math.max(...chartData.map((d) => d.views));
  const chartPoints = chartData
    .map((d, i) => {
      const x = (i / (chartData.length - 1)) * 100;
      const y = 100 - (d.views / maxChartViews) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-2xl p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-zinc-900/5 dark:ring-white/10">
          <div
            className={`flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0 ${locked ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={() => !locked && setIsExpanded(!isExpanded)}
          >
            <div>
              <h3 className="font-serif-premium font-bold text-xl md:text-2xl text-zinc-900 dark:text-white flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-brand-600" />
                {t('analytics.performanceAnalytics')}
                {locked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-500 dark:text-zinc-400 ml-1">
                    <Lock className="w-3 h-3" /> {t('analytics.business')}
                  </span>
                ) : isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {locked ? t('analytics.lockedDescription') : t('analytics.unlockedDescription')}
              </p>
            </div>
            {locked ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUpgradeModal(true);
                }}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-lg hover:scale-105 active:scale-100"
              >
                <Zap className="w-4 h-4" />
                {t('analytics.upgradeToUnlock')}
              </button>
            ) : (
              isExpanded && (
                <select
                  className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700 rounded-lg text-sm font-medium px-3 py-2 text-zinc-800 dark:text-zinc-300 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors w-full md:w-auto"
                  onClick={(e) => e.stopPropagation()}
                  value={controlledDateRange ?? 'last30days'}
                  onChange={(e) => {
                    e.stopPropagation();
                    onDateRangeChange?.(e.target.value);
                  }}
                >
                  <option value="last30days">{t('analytics.last30Days')}</option>
                  <option value="last7days">{t('analytics.last7Days')}</option>
                  <option value="thisYear">{t('analytics.thisYear')}</option>
                </select>
              )
            )}
          </div>

          {/* Blurred preview when locked — shows what analytics look like */}
          {locked && (
            <div className="relative mt-6 overflow-hidden rounded-xl max-h-48" aria-hidden="true">
              <div className="opacity-40 blur-[2px] pointer-events-none select-none">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4">
                  {[
                    { label: t('analytics.views'), value: '2.4K', color: 'from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/5 border-blue-200 dark:border-blue-800' },
                    { label: t('analytics.visitors'), value: '1.8K', color: 'from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-900/5 border-purple-200 dark:border-purple-800' },
                    { label: t('analytics.avgTime'), value: '2:34', color: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/10 dark:to-emerald-900/5 border-emerald-200 dark:border-emerald-800' },
                    { label: t('analytics.interactions'), value: '68%', color: 'from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-900/5 border-amber-200 dark:border-amber-800' },
                  ].map((card) => (
                    <div key={card.label} className={`bg-gradient-to-br ${card.color} p-3 md:p-5 rounded-xl border`}>
                      <div className="text-xs md:text-sm font-semibold text-zinc-500 mb-1">{card.label}</div>
                      <div className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">{card.value}</div>
                      <div className="text-xs text-zinc-400 mt-1">↑ 12.5%</div>
                    </div>
                  ))}
                </div>
                {/* Fake chart area */}
                <div className="h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl" />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent" />
            </div>
          )}

          {/* Top Cards Row - Responsive grid */}
          {isExpanded && (
            <>
              <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
                {/* Total Views Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/5 p-3 md:p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-1 md:gap-2 text-blue-700 dark:text-blue-300 mb-1 md:mb-2 text-xs md:text-sm font-semibold">
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">{t('analytics.totalViews')}</span>
                    <span className="md:hidden">{t('analytics.views')}</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-serif-premium font-bold text-zinc-900 dark:text-white mb-1 md:mb-2">
                    {formatCompact(stats.totalViews)}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center">
                    {stats.viewsChange !== null ? (
                      <>
                        {Number(stats.viewsChange) >= 0 ? '↑' : '↓'} {stats.viewsChange}%{' '}
                        <span className="text-zinc-500 dark:text-zinc-400 ml-1 font-normal hidden sm:inline">
                          {t('analytics.vsPrevPeriod')}
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-400 font-normal">
                        {t('analytics.noComparisonData')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Unique Visitors Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-900/5 p-3 md:p-5 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-1 md:gap-2 text-purple-700 dark:text-purple-300 mb-1 md:mb-2 text-xs md:text-sm font-semibold">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">{t('analytics.uniqueVisitors')}</span>
                    <span className="md:hidden">{t('analytics.visitors')}</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-serif-premium font-bold text-zinc-900 dark:text-white mb-1 md:mb-2">
                    {formatCompact(stats.uniqueViews)}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center">
                    {stats.uniqueChange !== null ? (
                      <>
                        {Number(stats.uniqueChange) >= 0 ? '↑' : '↓'} {stats.uniqueChange}%{' '}
                        <span className="text-zinc-500 dark:text-zinc-400 ml-1 font-normal hidden sm:inline">
                          {t('analytics.vsPrevPeriod')}
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-400 font-normal">
                        {t('analytics.noComparisonData')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Avg. Time on Scene Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/10 dark:to-orange-900/5 p-3 md:p-5 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-1 md:gap-2 text-orange-700 dark:text-orange-300 mb-1 md:mb-2 text-xs md:text-sm font-semibold">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">{t('analytics.avgTimeViewing')}</span>
                    <span className="md:hidden">{t('analytics.avgTime')}</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-serif-premium font-bold text-zinc-900 dark:text-white mb-1 md:mb-2">
                    {assets.length > 0 ? '1m 42s' : 'N/A'}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center">
                    {assets.length > 0
                      ? `— ${t('analytics.steadyEngagement')}`
                      : `— ${t('analytics.noDataYet')}`}
                  </div>
                </div>

                {/* Interaction Rate Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/10 dark:to-green-900/5 p-3 md:p-5 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-1 md:gap-2 text-green-700 dark:text-green-300 mb-1 md:mb-2 text-xs md:text-sm font-semibold">
                    <MousePointer className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">{t('analytics.interactionRate')}</span>
                    <span className="md:hidden">{t('analytics.interaction')}</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-serif-premium font-bold text-zinc-900 dark:text-white mb-1 md:mb-2">
                    {stats.interactionRate > 0 ? `${stats.interactionRate.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center">
                    {stats.interactionRate > 60 ? (
                      <>
                        ↑ {t('analytics.aboveAverage')}{' '}
                        <span className="text-zinc-500 dark:text-zinc-400 ml-1 font-normal hidden sm:inline">
                          ({t('analytics.benchmark55')})
                        </span>
                      </>
                    ) : stats.interactionRate > 0 ? (
                      <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                        {t('analytics.industryAvg55')}
                      </span>
                    ) : (
                      <span className="text-zinc-400 font-normal">{t('analytics.noDataYet')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Chart Area */}
              <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4 md:mb-6">
                  <div>
                    <h4 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white mb-1">
                      {t('analytics.viewsTrend')}
                    </h4>
                    <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
                      {t('analytics.dailyEngagementMetrics')}
                    </p>
                  </div>
                </div>
                <div className="h-48 md:h-64 w-full relative">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                  >
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="100"
                        y2={y}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800"
                        strokeWidth="0.5"
                        strokeDasharray="2"
                      />
                    ))}

                    {/* Area Fill */}
                    <path
                      d={`M 0,100 ${chartPoints} 100,100 Z`}
                      className="fill-brand-100 dark:fill-brand-900/20 opacity-50"
                    />

                    {/* Line */}
                    <polyline
                      points={chartPoints}
                      fill="none"
                      stroke="currentColor"
                      className="text-brand-500"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />

                    {/* Tooltip dot (simulated at last point) */}
                    <circle
                      cx="100"
                      cy={100 - (chartData[chartData.length - 1].views / maxChartViews) * 100}
                      r="1.5"
                      className="fill-brand-600"
                    />
                  </svg>

                  <div className="flex justify-between mt-2 text-xs text-zinc-400">
                    {dateLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Split: Top Models & Demographics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* Top Models List */}
                <div className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/30 dark:to-zinc-900 p-4 md:p-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white mb-1">
                    {t('analytics.topPerformingModels')}
                  </h4>
                  <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mb-4 md:mb-5">
                    {t('analytics.mostViewed3DAssets')}
                  </p>
                  <div className="space-y-3">
                    {stats.topAssets.length === 0 && (
                      <p className="text-sm text-zinc-400 dark:text-zinc-500 italic py-4 text-center">
                        {t('analytics.noAssetsWithViewData')}
                      </p>
                    )}
                    {stats.topAssets.map((asset, index) => {
                      const views = asset.viewCount || 0;
                      const maxViews = stats.topAssets[0]?.viewCount || 1;
                      const percentage = (views / maxViews) * 100;

                      const medals = ['1st', '2nd', '3rd', '4th', '5th'];
                      const medal = medals[index] || `${index + 1}.`;

                      return (
                        <div
                          key={asset.id}
                          className="group p-3 rounded-lg hover:bg-white dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3 flex-1">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${index === 0
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    : index === 1
                                      ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                                      : index === 2
                                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                  }`}
                              >
                                {medal}
                              </span>
                              <span className="font-semibold text-zinc-900 dark:text-white truncate">
                                {asset.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-brand-600 dark:text-brand-400 ml-2">
                              {formatCompact(views)}
                            </span>
                          </div>
                          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Device & Location Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Device Type Stats */}
                  <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/10 dark:to-zinc-900 p-4 md:p-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />{' '}
                      {t('analytics.viewingDevices')}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 md:mb-5">
                      {t('analytics.whereViewersAccess')}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {t('analytics.mobile')}
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            65%{' '}
                            <span className="text-[10px] text-zinc-400 font-normal">
                              ({t('analytics.estimated')})
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full"
                            style={{ width: '65%' }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {t('analytics.desktop')}
                          </span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            35%{' '}
                            <span className="text-[10px] text-zinc-400 font-normal">
                              ({t('analytics.estimated')})
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-400 h-full rounded-full"
                            style={{ width: '35%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Locations Stats */}
                  <div className="bg-gradient-to-b from-green-50 to-white dark:from-green-900/10 dark:to-zinc-900 p-4 md:p-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                      <Globe className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />{' '}
                      {t('analytics.topLocations')}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 md:mb-5">
                      {t('analytics.whereTrafficComesFrom')}{' '}
                      <span className="text-zinc-400">({t('analytics.estimated')})</span>
                    </p>
                    <div className="space-y-3">
                      {[
                        { flag: 'FR', label: 'France', pct: '38%' },
                        { flag: 'GR', label: 'Greece', pct: '22%' },
                        { flag: 'EE', label: 'Estonia', pct: '18%' },
                        { flag: 'EU', label: 'Other EU', pct: '22%' },
                      ].map((loc) => (
                        <div
                          key={loc.flag}
                          className="flex justify-between items-center p-2.5 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg"
                        >
                          <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm">
                            {loc.label}
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-white text-sm">
                            {loc.pct}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {t('analytics.upgradeSubscription')}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {t('analytics.eachTierAdds')}{' '}
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    +€20/month
                  </span>{' '}
                  on top of the previous plan.
                </p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tier cards */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {UPGRADE_TIERS.map((tier) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;
                const isHighlighted = tier.highlighted;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as typeof selectedTier)}
                    className={`relative text-left p-5 rounded-xl border-2 transition-all focus:outline-none ${isSelected
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                  >
                    {isHighlighted && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-brand-600 text-white whitespace-nowrap">
                        {t('analytics.recommended')}
                      </span>
                    )}

                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <p className="font-bold text-zinc-900 dark:text-white text-sm mb-0.5">
                      {tier.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-snug">
                      {tier.description}
                    </p>

                    {/* Price display */}
                    <div className="mb-3">
                      {tier.baseMonthly === 0 ? (
                        <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                          {t('analytics.free')}
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            +
                          </span>
                          <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                            €{tier.baseMonthly}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">/mo</span>
                        </div>
                      )}
                      {tier.addonMonthly > 0 && tier.baseMonthly > 0 && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          +€{tier.addonMonthly} per tier step
                        </p>
                      )}
                    </div>

                    <ul className="space-y-1.5">
                      {tier.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {tier.current && (
                      <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        {t('analytics.currentPlan')}
                      </span>
                    )}

                    {isSelected && !tier.current && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Summary + CTA */}
            {(() => {
              const tier = UPGRADE_TIERS.find((t) => t.id === selectedTier);
              if (!tier) return null;
              const perVisit = 100;
              const perItem = 20;
              const addonCost =
                !tier.current && addPrioritySupport ? PRIORITY_SUPPORT_ADDON.price : 0;
              const exampleTotal = perVisit + 15 * perItem + tier.baseMonthly + addonCost;
              return (
                <div className="px-6 pb-6">
                  <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-4 space-y-3">
                    {/* Plan summary line */}
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {tier.name} plan summary
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>€{perVisit} on-site visit</span>
                        <span>+€{perItem}/item captured</span>
                        {tier.baseMonthly > 0 && (
                          <span className="text-brand-600 dark:text-brand-400 font-semibold">
                            +€{tier.baseMonthly}/month subscription
                          </span>
                        )}
                      </div>
                      {tier.baseMonthly > 0 && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          Example: 15 items → €{exampleTotal}/first month
                        </p>
                      )}
                    </div>

                    {/* Add-on toggle — only for paid tiers */}
                    {!tier.current && tier.baseMonthly > 0 && (
                      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 flex items-center justify-between gap-3">
                        <label
                          htmlFor="addon-priority-support"
                          className="flex items-center gap-2.5 cursor-pointer select-none"
                        >
                          <input
                            id="addon-priority-support"
                            type="checkbox"
                            checked={addPrioritySupport}
                            onChange={(e) => setAddPrioritySupport(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {PRIORITY_SUPPORT_ADDON.label}
                          </span>
                        </label>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${addPrioritySupport
                              ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                              : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                            }`}
                        >
                          +€{PRIORITY_SUPPORT_ADDON.price}/mo
                        </span>
                      </div>
                    )}

                    {/* CTA buttons */}
                    <div className="flex gap-2 justify-end pt-1">
                      {tier.current ? (
                        <span className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 bg-zinc-200 dark:bg-zinc-700 cursor-not-allowed">
                          {t('analytics.currentPlan')}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setShowUpgradeModal(false);
                              navigate('/pricing');
                            }}
                            className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            {t('analytics.seeFullPricing')}
                          </button>
                          <button
                            onClick={() => {
                              setShowUpgradeModal(false);
                              navigate('/request');
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                          >
                            {t('analytics.upgradeTo', { tier: tier.name })}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
};
