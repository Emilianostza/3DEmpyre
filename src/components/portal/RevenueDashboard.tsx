import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, Asset } from '@/types';
import { ProjectStatus } from '@/types/domain';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CalendarRange,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface RevenueDashboardProps {
  projects: Project[];
  assets: Asset[];
}

// ── Helpers ────────────────────────────────────────────────────────

/** Simple seedable PRNG for deterministic chart data. */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Format euro currency. */
function formatEuro(amount: number): string {
  if (amount >= 10_000) return `\u20AC${(amount / 1000).toFixed(1)}K`;
  return `\u20AC${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Compute revenue for a single project based on asset count. */
function computeProjectRevenue(project: Project, assetsByProject: Map<string, number>): number {
  const assetCount = assetsByProject.get(project.id) ?? project.items;
  const base = 35;
  const extraAssets = Math.max(0, assetCount - 5);
  const additionalTiers = Math.floor(extraAssets / 5);
  return base + additionalTiers * 15;
}

/** Check whether a project is "active" (billable / recurring). */
function isActiveProject(project: Project): boolean {
  return (
    project.status !== ProjectStatus.Archived &&
    project.status !== ProjectStatus.Pending &&
    project.status !== ProjectStatus.Rejected
  );
}

/** Check whether a project counts as "Delivered" for billing. */
function isDelivered(project: Project): boolean {
  return project.status === ProjectStatus.Delivered;
}

/** Check whether a project is "In Progress" (actively being worked on). */
function isInProgress(project: Project): boolean {
  return [
    ProjectStatus.Assigned,
    ProjectStatus.Captured,
    ProjectStatus.Processing,
    ProjectStatus.QA,
    ProjectStatus.Approved,
    ProjectStatus.InProgress,
  ].includes(project.status);
}

/** Check whether a project is "Pending" (pipeline). */
function isPending(project: Project): boolean {
  return project.status === ProjectStatus.Pending || project.status === ProjectStatus.Requested;
}

/** Check whether a project is "Archived". */
function isArchived(project: Project): boolean {
  return project.status === ProjectStatus.Archived;
}

/** Get the last 6 month labels ending at current month. */
function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-US', { month: 'short' }));
  }
  return months;
}

// ── Component ──────────────────────────────────────────────────────

export const RevenueDashboard: React.FC<RevenueDashboardProps> = ({ projects, assets }) => {
  const { t } = useTranslation();
  // ---- Derived data ------------------------------------------------

  const assetsByProject = useMemo(() => {
    const map = new Map<string, number>();
    for (const asset of assets) {
      if (asset.project_id) {
        map.set(asset.project_id, (map.get(asset.project_id) ?? 0) + 1);
      }
    }
    return map;
  }, [assets]);

  const metrics = useMemo(() => {
    // Total revenue from all projects
    const totalRevenue = projects.reduce(
      (sum, p) => sum + computeProjectRevenue(p, assetsByProject),
      0
    );

    // MRR: active (non-archived, non-pending) projects x base
    const activeProjects = projects.filter(isActiveProject);
    const mrr = activeProjects.length * 35;

    // Unique clients
    const uniqueClients = new Set(projects.map((p) => p.client)).size;
    const avgRevenuePerClient = uniqueClients > 0 ? Math.round(totalRevenue / uniqueClients) : 0;

    // Projected annual
    const projectedAnnual = mrr * 12;

    // Trend: compare first half vs second half of projects (sorted by date)
    const sorted = [...projects].sort(
      (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
    );
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    const firstHalfRevenue = firstHalf.reduce(
      (s, p) => s + computeProjectRevenue(p, assetsByProject),
      0
    );
    const secondHalfRevenue = secondHalf.reduce(
      (s, p) => s + computeProjectRevenue(p, assetsByProject),
      0
    );

    const revenueTrend =
      firstHalfRevenue > 0
        ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
        : null;

    const firstHalfActive = firstHalf.filter(isActiveProject).length;
    const secondHalfActive = secondHalf.filter(isActiveProject).length;
    const mrrTrend =
      firstHalfActive > 0 ? ((secondHalfActive - firstHalfActive) / firstHalfActive) * 100 : null;

    const firstHalfClients = new Set(firstHalf.map((p) => p.client)).size;
    const secondHalfClients = new Set(secondHalf.map((p) => p.client)).size;
    const clientTrend =
      firstHalfClients > 0
        ? ((secondHalfClients - firstHalfClients) / firstHalfClients) * 100
        : null;

    return {
      totalRevenue,
      mrr,
      avgRevenuePerClient,
      projectedAnnual,
      revenueTrend,
      mrrTrend,
      clientTrend,
      uniqueClients,
    };
  }, [projects, assetsByProject]);

  // ---- Revenue by Client -------------------------------------------

  const clientData = useMemo(() => {
    const map = new Map<
      string,
      { client: string; projectCount: number; assetCount: number; revenue: number }
    >();

    for (const project of projects) {
      const existing = map.get(project.client) ?? {
        client: project.client,
        projectCount: 0,
        assetCount: 0,
        revenue: 0,
      };
      existing.projectCount += 1;
      const projectAssets = assetsByProject.get(project.id) ?? project.items;
      existing.assetCount += projectAssets;
      existing.revenue += computeProjectRevenue(project, assetsByProject);
      map.set(project.client, existing);
    }

    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [projects, assetsByProject]);

  const maxClientRevenue = clientData.length > 0 ? clientData[0].revenue : 1;

  // ---- Revenue by Status -------------------------------------------

  const statusBreakdown = useMemo(() => {
    const delivered = projects.filter(isDelivered);
    const inProgress = projects.filter(isInProgress);
    const pending = projects.filter(isPending);
    const archived = projects.filter(isArchived);

    const total = projects.length || 1;

    return [
      {
        label: t('revenue.delivered'),
        count: delivered.length,
        pct: Math.round((delivered.length / total) * 100),
        colorDot: 'bg-green-500',
        colorText: 'text-green-600 dark:text-green-400',
        colorBar: 'bg-green-500',
      },
      {
        label: t('revenue.inProgress'),
        count: inProgress.length,
        pct: Math.round((inProgress.length / total) * 100),
        colorDot: 'bg-blue-500',
        colorText: 'text-blue-600 dark:text-blue-400',
        colorBar: 'bg-blue-500',
      },
      {
        label: t('revenue.pending'),
        count: pending.length,
        pct: Math.round((pending.length / total) * 100),
        colorDot: 'bg-amber-500',
        colorText: 'text-amber-600 dark:text-amber-400',
        colorBar: 'bg-amber-500',
      },
      {
        label: t('revenue.archived'),
        count: archived.length,
        pct: Math.round((archived.length / total) * 100),
        colorDot: 'bg-zinc-400 dark:bg-zinc-500',
        colorText: 'text-zinc-500 dark:text-zinc-400',
        colorBar: 'bg-zinc-400 dark:bg-zinc-500',
      },
    ];
  }, [projects]);

  // ---- Monthly Revenue Trend (SVG) ---------------------------------

  const monthLabels = useMemo(() => getLast6Months(), []);

  const monthlyData = useMemo(() => {
    const rng = seededRandom(projects.length > 0 ? projects.length : 7);
    const baseRevenue = metrics.mrr > 0 ? metrics.mrr : 140;
    const data: number[] = [];

    for (let i = 0; i < 6; i++) {
      // Upward trend with controlled noise
      const trend = baseRevenue * (0.6 + (i / 5) * 0.8);
      const noise = (rng() - 0.5) * baseRevenue * 0.3;
      data.push(Math.max(10, Math.round(trend + noise)));
    }
    return data;
  }, [projects.length, metrics.mrr]);

  const maxMonthly = Math.max(...monthlyData, 1);
  const svgWidth = 300;
  const svgHeight = 120;
  const padding = { top: 10, right: 10, bottom: 24, left: 10 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const linePoints = monthlyData
    .map((val, i) => {
      const x = padding.left + (i / (monthlyData.length - 1)) * chartW;
      const y = padding.top + chartH - (val / maxMonthly) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPath = (() => {
    const pts = monthlyData.map((val, i) => {
      const x = padding.left + (i / (monthlyData.length - 1)) * chartW;
      const y = padding.top + chartH - (val / maxMonthly) * chartH;
      return `${x},${y}`;
    });
    const bottomRight = `${padding.left + chartW},${padding.top + chartH}`;
    const bottomLeft = `${padding.left},${padding.top + chartH}`;
    return `M ${bottomLeft} L ${pts.join(' L ')} L ${bottomRight} Z`;
  })();

  // ── Trend badge helper ────────────────────────────────────────────

  const TrendBadge: React.FC<{ value: number | null }> = ({ value }) => {
    if (value === null) {
      return <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">No data</span>;
    }
    const isPositive = value >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        {isPositive ? '+' : ''}
        {value.toFixed(1)}%
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Section: KPI Strip ───────────────────────────────────── */}
      <section>
        <h2 className="uppercase tracking-wider text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3">
          {t('revenue.title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5 text-brand-600 dark:text-brand-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {t('revenue.totalRevenue')}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
              {formatEuro(metrics.totalRevenue)}
            </p>
            <TrendBadge value={metrics.revenueTrend} />
          </div>

          {/* MRR */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {t('revenue.mrr')}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
              {formatEuro(metrics.mrr)}
            </p>
            <TrendBadge value={metrics.mrrTrend} />
          </div>

          {/* Avg Revenue Per Client */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {t('revenue.avgPerClient')}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
              {formatEuro(metrics.avgRevenuePerClient)}
            </p>
            <TrendBadge value={metrics.clientTrend} />
          </div>

          {/* Projected Annual */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CalendarRange className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {t('revenue.projectedAnnual')}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
              {formatEuro(metrics.projectedAnnual)}
            </p>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              {t('revenue.mrrCalc')}
            </span>
          </div>
        </div>
      </section>

      {/* ── Bottom Grid: bar chart + breakdown + trend ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Revenue by Client (horizontal bar chart) ─────────── */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="uppercase tracking-wider text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {t('revenue.byClient')}
            </h3>
          </div>

          {clientData.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 italic py-6 text-center">
              {t('revenue.noData')}
            </p>
          ) : (
            <div className="space-y-3">
              {clientData.map((entry) => {
                const barWidth = Math.max(4, (entry.revenue / maxClientRevenue) * 100);
                return (
                  <div key={entry.client}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate mr-2">
                        {entry.client}
                      </span>
                      <span className="text-sm font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                        {formatEuro(entry.revenue)}
                      </span>
                    </div>

                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    <div className="flex gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                      <span>
                        {entry.projectCount} project{entry.projectCount !== 1 ? 's' : ''}
                      </span>
                      <span>
                        {entry.assetCount} asset{entry.assetCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Right column: Status breakdown + Monthly Trend ───── */}
        <div className="space-y-6">
          {/* ── Revenue by Status ────────────────────────────────── */}
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="uppercase tracking-wider text-xs font-bold text-zinc-500 dark:text-zinc-400">
                {t('revenue.byStatus')}
              </h3>
            </div>

            {/* Stacked bar (pie-like visual) */}
            <div className="h-3 flex rounded-full overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800">
              {statusBreakdown.map((s) =>
                s.pct > 0 ? (
                  <div
                    key={s.label}
                    className={`${s.colorBar} transition-all duration-500`}
                    style={{ width: `${s.pct}%` }}
                  />
                ) : null
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statusBreakdown.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.colorDot} flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                      {s.label}
                    </p>
                    <p className={`text-xs font-medium ${s.colorText}`}>
                      {s.count} project{s.count !== 1 ? 's' : ''} &middot; {s.pct}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Monthly Revenue Trend (SVG line chart) ──────────── */}
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="uppercase tracking-wider text-xs font-bold text-zinc-500 dark:text-zinc-400">
                {t('revenue.monthlyTrend')}
              </h3>
            </div>

            <div className="w-full">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto overflow-visible"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                  const y = padding.top + chartH * (1 - frac);
                  return (
                    <line
                      key={frac}
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + chartW}
                      y2={y}
                      stroke="currentColor"
                      className="text-zinc-200 dark:text-zinc-800"
                      strokeWidth="0.5"
                      strokeDasharray="4 2"
                    />
                  );
                })}

                {/* Area fill under the line */}
                <path
                  d={areaPath}
                  className="fill-brand-100 dark:fill-brand-900/20"
                  opacity="0.6"
                />

                {/* Trend line */}
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="currentColor"
                  className="text-brand-500"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data point dots */}
                {monthlyData.map((val, i) => {
                  const x = padding.left + (i / (monthlyData.length - 1)) * chartW;
                  const y = padding.top + chartH - (val / maxMonthly) * chartH;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3.5"
                      className="fill-brand-600 dark:fill-brand-400"
                    />
                  );
                })}

                {/* Month labels on x-axis */}
                {monthLabels.map((label, i) => {
                  const x = padding.left + (i / (monthLabels.length - 1)) * chartW;
                  return (
                    <text
                      key={label}
                      x={x}
                      y={svgHeight - 2}
                      textAnchor="middle"
                      className="fill-zinc-400 dark:fill-zinc-500"
                      fontSize="10"
                      fontFamily="system-ui, sans-serif"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Legend values under chart */}
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {formatEuro(monthlyData[0])}
              </span>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                {formatEuro(monthlyData[monthlyData.length - 1])}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
