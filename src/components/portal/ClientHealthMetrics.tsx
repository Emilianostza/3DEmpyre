import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, Asset } from '@/types';
import { ProjectStatus } from '@/types/domain';
import { Users, UserCheck, AlertTriangle, Heart, Activity, BarChart3, Crown } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface ClientHealthMetricsProps {
  projects: Project[];
  assets: Asset[];
}

type HealthStatus = 'Healthy' | 'Needs Attention' | 'At Risk';

interface ClientRow {
  name: string;
  healthStatus: HealthStatus;
  totalProjects: number;
  activeProjects: number;
  publishedAssets: number;
  totalViews: number;
  lastActivity: string | null;
  statusDistribution: { status: string; count: number; color: string }[];
}

// ── Helpers ────────────────────────────────────────────────────────

const DAYS_MS = 24 * 60 * 60 * 1000;

/** Return the number of days since a given ISO date string. */
function daysSince(isoDate: string | undefined | null): number {
  if (!isoDate) return Infinity;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / DAYS_MS);
}

/** Check whether a project is active (not archived or rejected). */
function isActiveProject(project: Project): boolean {
  return project.status !== ProjectStatus.Archived && project.status !== ProjectStatus.Rejected;
}

/** Check whether a project counts as delivered or approved for satisfaction. */
function isSatisfactionPositive(project: Project): boolean {
  return project.status === ProjectStatus.Delivered || project.status === ProjectStatus.Approved;
}

/** Format a date string to a short human-readable form. */
function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return 'N/A';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format a number compactly. */
function formatCompact(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Map a ProjectStatus to a display-friendly color class for the status bar. */
function statusBarColor(status: ProjectStatus): string {
  switch (status) {
    case ProjectStatus.Delivered:
    case ProjectStatus.Approved:
      return 'bg-green-500';
    case ProjectStatus.Assigned:
    case ProjectStatus.Captured:
    case ProjectStatus.Processing:
    case ProjectStatus.QA:
    case ProjectStatus.InProgress:
      return 'bg-blue-500';
    case ProjectStatus.Pending:
    case ProjectStatus.Requested:
      return 'bg-amber-500';
    case ProjectStatus.Archived:
      return 'bg-zinc-400 dark:bg-zinc-600';
    case ProjectStatus.Rejected:
      return 'bg-red-500';
    default:
      return 'bg-zinc-300 dark:bg-zinc-600';
  }
}

/** Health status badge styling. */
function healthBadgeClasses(status: HealthStatus): string {
  switch (status) {
    case 'Healthy':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'Needs Attention':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'At Risk':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }
}

/** Sort priority: At Risk first, then Needs Attention, then Healthy. */
function healthSortOrder(status: HealthStatus): number {
  switch (status) {
    case 'At Risk':
      return 0;
    case 'Needs Attention':
      return 1;
    case 'Healthy':
      return 2;
  }
}

// ── Component ──────────────────────────────────────────────────────

export const ClientHealthMetrics: React.FC<ClientHealthMetricsProps> = ({ projects, assets }) => {
  const { t } = useTranslation();
  // ---- Build per-client asset lookup ---------------------------------

  const assetsByProject = useMemo(() => {
    const map = new Map<string, Asset[]>();
    for (const asset of assets) {
      if (asset.project_id) {
        const list = map.get(asset.project_id) ?? [];
        list.push(asset);
        map.set(asset.project_id, list);
      }
    }
    return map;
  }, [assets]);

  // ---- Build per-client rows -----------------------------------------

  const clientRows = useMemo<ClientRow[]>(() => {
    // Group projects by client name
    const clientProjects = new Map<string, Project[]>();
    for (const project of projects) {
      const list = clientProjects.get(project.client) ?? [];
      list.push(project);
      clientProjects.set(project.client, list);
    }

    const rows: ClientRow[] = [];

    for (const [clientName, clientProjectList] of clientProjects) {
      // Gather all assets for this client
      const clientAssets: Asset[] = [];
      for (const p of clientProjectList) {
        const pAssets = assetsByProject.get(p.id);
        if (pAssets) clientAssets.push(...pAssets);
      }

      const totalProjects = clientProjectList.length;
      const activeProjects = clientProjectList.filter(isActiveProject).length;
      const publishedAssets = clientAssets.filter((a) => a.status === 'Published').length;
      const totalViews = clientAssets.reduce((sum, a) => sum + (a.viewCount ?? 0), 0);

      // Last activity: most recent updated_at across all projects and assets
      const allDates: string[] = [];
      for (const p of clientProjectList) {
        if (p.updated_at) allDates.push(p.updated_at);
        if (p.created_at) allDates.push(p.created_at);
      }
      for (const a of clientAssets) {
        if (a.updated_at) allDates.push(a.updated_at);
      }
      const lastActivity =
        allDates.length > 0
          ? allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : null;

      // Determine health status
      const daysSinceLastActivity = daysSince(lastActivity);
      const hasPublishedWithViews = publishedAssets > 0 && totalViews > 0;
      const hasRecentActivity = daysSinceLastActivity < 14;
      const hasModerateActivity = daysSinceLastActivity < 30;

      let healthStatus: HealthStatus;
      if (hasPublishedWithViews && hasRecentActivity) {
        healthStatus = 'Healthy';
      } else if (hasModerateActivity) {
        healthStatus = 'Needs Attention';
      } else {
        healthStatus = 'At Risk';
      }

      // Status distribution for the mini bar
      const statusCounts = new Map<ProjectStatus, number>();
      for (const p of clientProjectList) {
        statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1);
      }
      const statusDistribution = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status,
        count,
        color: statusBarColor(status),
      }));

      rows.push({
        name: clientName,
        healthStatus,
        totalProjects,
        activeProjects,
        publishedAssets,
        totalViews,
        lastActivity,
        statusDistribution,
      });
    }

    // Sort: At Risk first, then Needs Attention, then Healthy
    rows.sort((a, b) => healthSortOrder(a.healthStatus) - healthSortOrder(b.healthStatus));

    return rows;
  }, [projects, assetsByProject]);

  // ---- KPI summary metrics ------------------------------------------

  const kpis = useMemo(() => {
    const uniqueClients = new Set(projects.map((p) => p.client));
    const totalClients = uniqueClients.size;

    // Active clients: at least one non-archived, non-rejected project
    const activeClientSet = new Set<string>();
    for (const p of projects) {
      if (isActiveProject(p)) {
        activeClientSet.add(p.client);
      }
    }
    const activeClients = activeClientSet.size;

    // At-risk clients: ALL projects have no activity in 30+ days
    const atRiskClients = clientRows.filter((r) => r.healthStatus === 'At Risk').length;

    // Client satisfaction: (delivered + approved) / total projects percentage
    const satisfiedCount = projects.filter(isSatisfactionPositive).length;
    const totalCount = projects.length;
    const satisfaction = totalCount > 0 ? Math.round((satisfiedCount / totalCount) * 100) : 0;

    return { totalClients, activeClients, atRiskClients, satisfaction };
  }, [projects, clientRows]);

  // ---- Engagement breakdown -----------------------------------------

  const engagementBreakdown = useMemo(() => {
    const counts = { Healthy: 0, 'Needs Attention': 0, 'At Risk': 0 };
    for (const row of clientRows) {
      counts[row.healthStatus]++;
    }
    const total = clientRows.length || 1;
    return [
      {
        label: t('clientHealth.healthy'),
        count: counts.Healthy,
        pct: Math.round((counts.Healthy / total) * 100),
        colorBar: 'bg-green-500',
        colorDot: 'bg-green-500',
        colorText: 'text-green-600 dark:text-green-400',
      },
      {
        label: t('clientHealth.needsAttention'),
        count: counts['Needs Attention'],
        pct: Math.round((counts['Needs Attention'] / total) * 100),
        colorBar: 'bg-amber-500',
        colorDot: 'bg-amber-500',
        colorText: 'text-amber-600 dark:text-amber-400',
      },
      {
        label: t('clientHealth.atRiskLabel'),
        count: counts['At Risk'],
        pct: Math.round((counts['At Risk'] / total) * 100),
        colorBar: 'bg-red-500',
        colorDot: 'bg-red-500',
        colorText: 'text-red-600 dark:text-red-400',
      },
    ];
  }, [clientRows]);

  // ---- Revenue concentration (top 3 by project count) ---------------

  const topClients = useMemo(() => {
    const sorted = [...clientRows].sort((a, b) => b.totalProjects - a.totalProjects);
    const totalProjectCount = projects.length || 1;
    return sorted.slice(0, 3).map((row) => ({
      name: row.name,
      projectCount: row.totalProjects,
      pct: Math.round((row.totalProjects / totalProjectCount) * 100),
    }));
  }, [clientRows, projects.length]);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Section: KPI Strip ───────────────────────────────────── */}
      <section>
        <h2 className="uppercase tracking-wider text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3">
          {t('clientHealth.title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Clients */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {t('clientHealth.totalClients')}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{kpis.totalClients}</p>
          </div>

          {/* Active Clients */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {t('clientHealth.activeClients')}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{kpis.activeClients}</p>
          </div>

          {/* At-Risk Clients */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {t('clientHealth.atRisk')}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{kpis.atRiskClients}</p>
          </div>

          {/* Client Satisfaction */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Heart className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {t('clientHealth.satisfaction')}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{kpis.satisfaction}%</p>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              {t('clientHealth.satisfactionCalc')}
            </span>
          </div>
        </div>
      </section>

      {/* ── Section: Client Health Table ─────────────────────────── */}
      <section>
        <h2 className="uppercase tracking-wider text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3">
          {t('clientHealth.statusTitle')}
        </h2>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-5 py-3">
                    {t('clientHealth.client')}
                  </th>
                  <th className="text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">
                    {t('clientHealth.health')}
                  </th>
                  <th className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">
                    {t('clientHealth.projects')}
                  </th>
                  <th className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">
                    {t('clientHealth.active')}
                  </th>
                  <th className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">
                    {t('clientHealth.published')}
                  </th>
                  <th className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">
                    {t('clientHealth.views')}
                  </th>
                  <th className="text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">
                    {t('clientHealth.lastActivity')}
                  </th>
                  <th className="text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3 min-w-[140px]">
                    {t('clientHealth.statusDist')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center text-sm text-zinc-400 dark:text-zinc-500 italic py-10"
                    >
                      {t('clientHealth.noData')}
                    </td>
                  </tr>
                ) : (
                  clientRows.map((row) => {
                    const totalForBar = row.totalProjects || 1;
                    return (
                      <tr
                        key={row.name}
                        className="border-b border-zinc-50 dark:border-zinc-800/60 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        {/* Client Name */}
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            {row.name}
                          </span>
                        </td>

                        {/* Health Badge */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${healthBadgeClasses(row.healthStatus)}`}
                          >
                            {row.healthStatus}
                          </span>
                        </td>

                        {/* Total Projects */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                            {row.totalProjects}
                          </span>
                        </td>

                        {/* Active Projects */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                            {row.activeProjects}
                          </span>
                        </td>

                        {/* Published Assets */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                            {row.publishedAssets}
                          </span>
                        </td>

                        {/* Total Views */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                            {formatCompact(row.totalViews)}
                          </span>
                        </td>

                        {/* Last Activity */}
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                            {formatDate(row.lastActivity)}
                          </span>
                        </td>

                        {/* Status Distribution Mini Bar */}
                        <td className="px-4 py-3.5">
                          <div className="h-2.5 flex rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 min-w-[100px]">
                            {row.statusDistribution.map((segment, idx) => {
                              const widthPct = Math.max(4, (segment.count / totalForBar) * 100);
                              return (
                                <div
                                  key={`${segment.status}-${idx}`}
                                  className={`${segment.color} transition-all duration-500`}
                                  style={{ width: `${widthPct}%` }}
                                  title={`${segment.status}: ${segment.count}`}
                                />
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Section: Engagement Breakdown ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Engagement Distribution ─────────────────────────── */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="uppercase tracking-wider text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {t('clientHealth.engagement')}
            </h3>
          </div>

          {/* Stacked bar */}
          <div className="h-3 flex rounded-full overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800">
            {engagementBreakdown.map((s) =>
              s.pct > 0 ? (
                <div
                  key={s.label}
                  className={`${s.colorBar} transition-all duration-500`}
                  style={{ width: `${s.pct}%` }}
                />
              ) : null
            )}
          </div>

          <div className="space-y-3">
            {engagementBreakdown.map((entry) => {
              const barWidth =
                clientRows.length > 0 ? Math.max(4, (entry.count / clientRows.length) * 100) : 0;
              return (
                <div key={entry.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${entry.colorDot} flex-shrink-0`}
                      />
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {entry.label}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${entry.colorText}`}>
                      {entry.count} client{entry.count !== 1 ? 's' : ''}{' '}
                      <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                        ({entry.pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${entry.colorBar} rounded-full transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Revenue Concentration ───────────────────────────── */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="uppercase tracking-wider text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {t('clientHealth.revenueConc')}
            </h3>
          </div>

          {topClients.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 italic py-6 text-center">
              {t('clientHealth.noData')}
            </p>
          ) : (
            <div className="space-y-4">
              {topClients.map((client, idx) => {
                const barWidth = Math.max(
                  6,
                  (client.projectCount / (topClients[0]?.projectCount || 1)) * 100
                );
                const medals = [
                  {
                    icon: Crown,
                    bg: 'bg-amber-100 dark:bg-amber-900/30',
                    text: 'text-amber-700 dark:text-amber-400',
                  },
                  {
                    icon: null,
                    bg: 'bg-zinc-200 dark:bg-zinc-700',
                    text: 'text-zinc-600 dark:text-zinc-300',
                  },
                  {
                    icon: null,
                    bg: 'bg-orange-100 dark:bg-orange-900/30',
                    text: 'text-orange-700 dark:text-orange-400',
                  },
                ];
                const medal = medals[idx] ?? medals[2];

                return (
                  <div key={client.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${medal.bg} ${medal.text}`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {client.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-sm font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                          {client.projectCount} project
                          {client.projectCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap">
                          {client.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Summary line */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Top {topClients.length} client
                  {topClients.length !== 1 ? 's' : ''} account for{' '}
                  <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                    {topClients.reduce((sum, c) => sum + c.pct, 0)}%
                  </span>{' '}
                  of all projects
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
