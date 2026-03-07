import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, Asset } from '@/types';
import { ProjectStatus } from '@/types/domain';
import {
  Globe,
  TrendingUp,
  Users,
  Box,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  ChevronDown,
  ChevronUp,
  Clock,
  Activity,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Seeded PRNG for deterministic mock data
// ---------------------------------------------------------------------------
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// ---------------------------------------------------------------------------
// Market definitions
// ---------------------------------------------------------------------------
const MARKETS = [
  {
    id: 'ee',
    name: 'Estonia',
    flag: '\u{1F1EA}\u{1F1EA}',
    currency: 'EUR',
    region: 'Baltics',
    clients: ['Tallinn Market Hall'],
  },
  {
    id: 'gr',
    name: 'Greece',
    flag: '\u{1F1EC}\u{1F1F7}',
    currency: 'EUR',
    region: 'Southern EU',
    clients: ['Hotel Athena'],
  },
  {
    id: 'fr',
    name: 'France',
    flag: '\u{1F1EB}\u{1F1F7}',
    currency: 'EUR',
    region: 'Western EU',
    clients: ['Bistro 55', 'Caf\u00e9 Luna'],
  },
] as const;

type MarketId = (typeof MARKETS)[number]['id'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get the market a project belongs to based on its client field */
function _marketForProject(project: Project): (typeof MARKETS)[number] | undefined {
  return MARKETS.find((m) => m.clients.some((c) => c === project.client));
}

/** Projects in a given market */
function projectsInMarket(projects: Project[], marketId: MarketId): Project[] {
  const market = MARKETS.find((m) => m.id === marketId);
  if (!market) return [];
  return projects.filter((p) => market.clients.some((c) => c === p.client));
}

/** Assets linked to a set of projects */
function assetsForProjects(assets: Asset[], projects: Project[]): Asset[] {
  const projectIds = new Set(projects.map((p) => p.id));
  return assets.filter((a) => a.project_id && projectIds.has(a.project_id));
}

/** Count published assets */
function countPublished(assets: Asset[]): number {
  return assets.filter((a) => a.status === 'Published').length;
}

/** Unique client names from project list */
function uniqueClients(projects: Project[]): string[] {
  return [...new Set(projects.map((p) => p.client))];
}

/** Determine health: green (has active), amber (only pending), red (no recent) */
function marketHealth(projects: Project[]): 'green' | 'amber' | 'red' {
  if (projects.length === 0) return 'red';

  const activeStatuses: ProjectStatus[] = [
    ProjectStatus.InProgress,
    ProjectStatus.Captured,
    ProjectStatus.Processing,
    ProjectStatus.QA,
    ProjectStatus.Assigned,
  ];
  const pendingStatuses: ProjectStatus[] = [ProjectStatus.Pending, ProjectStatus.Requested];

  if (projects.some((p) => activeStatuses.includes(p.status))) return 'green';
  if (projects.some((p) => pendingStatuses.includes(p.status))) return 'amber';
  return 'red';
}

const HEALTH_COLORS: Record<'green' | 'amber' | 'red', string> = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const _HEALTH_LABELS: Record<'green' | 'amber' | 'red', string> = {
  green: 'Active',
  amber: 'Pending',
  red: 'Inactive',
};

// ---------------------------------------------------------------------------
// Sparkline SVG component (seeded deterministic data)
// ---------------------------------------------------------------------------
const Sparkline: React.FC<{ seed: number; className?: string }> = ({ seed, className }) => {
  const points = useMemo(() => {
    const rand = seededRand(seed);
    const pts: number[] = [];
    for (let i = 0; i < 6; i++) {
      pts.push(20 + rand() * 60);
    }
    return pts;
  }, [seed]);

  const polyline = points.map((y, i) => `${(i / (points.length - 1)) * 100},${100 - y}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className ?? 'w-24 h-8'}>
      <polyline
        points={polyline}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Sort key type for comparison table
// ---------------------------------------------------------------------------
type SortKey = 'market' | 'clients' | 'projects' | 'assets' | 'views' | 'revenue';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MultiMarketViewProps {
  projects: Project[];
  assets: Asset[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const MultiMarketView: React.FC<MultiMarketViewProps> = ({ projects, assets }) => {
  const { t } = useTranslation();
  const [selectedMarket, setSelectedMarket] = useState<MarketId | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('market');
  const [sortAsc, setSortAsc] = useState(true);

  // ----- Derived data per market -----
  const marketData = useMemo(() => {
    return MARKETS.map((market) => {
      const mProjects = projectsInMarket(projects, market.id);
      const mAssets = assetsForProjects(assets, mProjects);
      const published = countPublished(mAssets);
      const clients = uniqueClients(mProjects);
      const health = marketHealth(mProjects);
      const revenue = mProjects.length * published * 150;

      // Mock views using seeded random
      const rand = seededRand(market.id.charCodeAt(0) * 1000 + market.id.charCodeAt(1));
      const totalViews = Math.floor(rand() * 5000) + 500;
      const uniqueVisitors = Math.floor(totalViews * (0.4 + rand() * 0.3));

      return {
        ...market,
        projects: mProjects,
        assets: mAssets,
        publishedCount: published,
        clients,
        health,
        revenue,
        totalViews,
        uniqueVisitors,
      };
    });
  }, [projects, assets]);

  // ----- Aggregate KPIs -----
  const kpis = useMemo(() => {
    const totalClients = new Set(marketData.flatMap((m) => m.clients)).size;
    const totalProjects = marketData.reduce((s, m) => s + m.projects.length, 0);
    const totalPublished = marketData.reduce((s, m) => s + m.publishedCount, 0);
    return { totalClients, totalProjects, totalPublished };
  }, [marketData]);

  // ----- Currently selected market detail data -----
  const selectedDetail = useMemo(() => {
    if (selectedMarket === 'all') return null;
    return marketData.find((m) => m.id === selectedMarket) ?? null;
  }, [selectedMarket, marketData]);

  // ----- Sorted comparison table rows -----
  const sortedMarketData = useMemo(() => {
    const rows = [...marketData];
    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'market':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'clients':
          cmp = a.clients.length - b.clients.length;
          break;
        case 'projects':
          cmp = a.projects.length - b.projects.length;
          break;
        case 'assets':
          cmp = a.publishedCount - b.publishedCount;
          break;
        case 'views':
          cmp = a.totalViews - b.totalViews;
          break;
        case 'revenue':
          cmp = a.revenue - b.revenue;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return rows;
  }, [marketData, sortKey, sortAsc]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortAsc((prev) => !prev);
      } else {
        setSortKey(key);
        setSortAsc(true);
      }
    },
    [sortKey]
  );

  // ----- Status distribution for a set of projects -----
  const statusDistribution = useCallback((prjs: Project[]) => {
    const groups: Record<string, number> = {};
    for (const p of prjs) {
      groups[p.status] = (groups[p.status] || 0) + 1;
    }
    const total = prjs.length || 1;
    const STATUS_COLORS: Record<string, string> = {
      [ProjectStatus.Delivered]: 'bg-green-500',
      [ProjectStatus.Approved]: 'bg-emerald-500',
      [ProjectStatus.InProgress]: 'bg-blue-500',
      [ProjectStatus.Processing]: 'bg-indigo-500',
      [ProjectStatus.QA]: 'bg-purple-500',
      [ProjectStatus.Captured]: 'bg-cyan-500',
      [ProjectStatus.Assigned]: 'bg-sky-500',
      [ProjectStatus.Requested]: 'bg-amber-500',
      [ProjectStatus.Pending]: 'bg-yellow-500',
      [ProjectStatus.Archived]: 'bg-zinc-400',
      [ProjectStatus.Rejected]: 'bg-red-500',
    };
    return Object.entries(groups).map(([status, count]) => ({
      status,
      count,
      pct: (count / total) * 100,
      color: STATUS_COLORS[status] ?? 'bg-zinc-400',
    }));
  }, []);

  // ----- Recent activity mock (last 5 status changes) -----
  const recentActivity = useCallback((prjs: Project[]) => {
    const rand = seededRand(42);
    const sorted = [...prjs]
      .sort((a, b) => {
        const da = a.updated_at ?? a.created_at ?? '';
        const db = b.updated_at ?? b.created_at ?? '';
        return db.localeCompare(da);
      })
      .slice(0, 5);

    const actions = [
      'Status changed',
      'Asset uploaded',
      'QA reviewed',
      'Capture completed',
      'Project updated',
    ];
    return sorted.map((p, i) => ({
      projectName: p.name,
      action: actions[i % actions.length],
      time: `${Math.floor(rand() * 48) + 1}h ago`,
      status: p.status,
    }));
  }, []);

  // ----- Render helpers -----
  const SortHeader: React.FC<{ label: string; colKey: SortKey }> = ({ label, colKey }) => (
    <th
      className="p-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
      onClick={() => handleSort(colKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === colKey ? (
          sortAsc ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        ) : null}
      </span>
    </th>
  );

  // ====================================================================
  // RENDER
  // ====================================================================
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      {/* ---- Header ---- */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {t('portal.markets.title')}
          </h2>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-9">
          {t('portal.markets.subtitle')}
        </p>
      </div>

      {/* ---- KPI strip ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-zinc-200 dark:border-zinc-800">
        {/* Total Markets */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{MARKETS.length}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('portal.markets.markets')}
            </p>
          </div>
        </div>

        {/* Total Clients */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{kpis.totalClients}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('portal.markets.clients')}
            </p>
          </div>
        </div>

        {/* Total Projects */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{kpis.totalProjects}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('portal.markets.projects')}
            </p>
          </div>
        </div>

        {/* Total Published */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Box className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {kpis.totalPublished}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('portal.markets.publishedAssets')}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Market Selector Tabs ---- */}
      <div className="flex items-center gap-2 p-6 pb-4 overflow-x-auto">
        <button
          onClick={() => setSelectedMarket('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            selectedMarket === 'all'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {t('portal.markets.allMarkets')}
        </button>
        {MARKETS.map((market) => (
          <button
            key={market.id}
            onClick={() => setSelectedMarket(market.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              selectedMarket === market.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {market.flag} {market.name}
          </button>
        ))}
      </div>

      {/* ---- Content area ---- */}
      <div className="p-6 pt-2 space-y-6">
        {/* ============================================================
            ALL MARKETS VIEW
            ============================================================ */}
        {selectedMarket === 'all' && (
          <>
            {/* Per-Market Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData.map((market) => (
                <button
                  key={market.id}
                  onClick={() => setSelectedMarket(market.id)}
                  className="text-left p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition-all group"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{market.flag}</span>
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                          {market.name}
                        </h3>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                          {market.region}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${HEALTH_COLORS[market.health]}`}
                      />
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        {t(`portal.markets.health.${market.health}`)}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                        {t('portal.markets.clients')}
                      </p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {market.clients.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                        {t('portal.markets.projects')}
                      </p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {market.projects.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                        {t('portal.markets.published')}
                      </p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {market.publishedCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                        {t('portal.markets.estRevenue')}
                      </p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                        {market.revenue > 0 ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                            <span>
                              {market.currency} {market.revenue.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                            <span>{market.currency} 0</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="flex items-center justify-between">
                    <Sparkline
                      seed={market.id.charCodeAt(0) * 100 + market.id.charCodeAt(1)}
                      className="w-full h-8 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Market Comparison Table */}
            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  {t('portal.markets.marketComparison')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <SortHeader label={t('portal.markets.market')} colKey="market" />
                      <SortHeader label={t('portal.markets.clients')} colKey="clients" />
                      <SortHeader label={t('portal.markets.projects')} colKey="projects" />
                      <SortHeader label={t('portal.markets.assets')} colKey="assets" />
                      <SortHeader label={t('portal.markets.views')} colKey="views" />
                      <SortHeader label={t('portal.markets.estRevenue')} colKey="revenue" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {sortedMarketData.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedMarket(m.id)}
                      >
                        <td className="p-3 text-sm font-semibold text-zinc-900 dark:text-white">
                          {m.flag} {m.name}
                        </td>
                        <td className="p-3 text-sm text-zinc-600 dark:text-zinc-300">
                          {m.clients.length}
                        </td>
                        <td className="p-3 text-sm text-zinc-600 dark:text-zinc-300">
                          {m.projects.length}
                        </td>
                        <td className="p-3 text-sm text-zinc-600 dark:text-zinc-300">
                          {m.publishedCount}
                        </td>
                        <td className="p-3 text-sm text-zinc-600 dark:text-zinc-300">
                          {m.totalViews.toLocaleString()}
                        </td>
                        <td className="p-3 text-sm font-semibold text-zinc-900 dark:text-white">
                          {m.currency} {m.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="bg-zinc-100 dark:bg-zinc-800/60 font-bold">
                      <td className="p-3 text-sm text-zinc-900 dark:text-white">
                        {t('portal.markets.total')}
                      </td>
                      <td className="p-3 text-sm text-zinc-900 dark:text-white">
                        {kpis.totalClients}
                      </td>
                      <td className="p-3 text-sm text-zinc-900 dark:text-white">
                        {kpis.totalProjects}
                      </td>
                      <td className="p-3 text-sm text-zinc-900 dark:text-white">
                        {kpis.totalPublished}
                      </td>
                      <td className="p-3 text-sm text-zinc-900 dark:text-white">
                        {marketData.reduce((s, m) => s + m.totalViews, 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-sm text-zinc-900 dark:text-white">
                        EUR {marketData.reduce((s, m) => s + m.revenue, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ============================================================
            SINGLE MARKET DETAIL VIEW
            ============================================================ */}
        {selectedDetail && (
          <div className="space-y-6">
            {/* Market header */}
            <div className="flex items-center gap-4">
              <span className="text-4xl">{selectedDetail.flag}</span>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {selectedDetail.name}
                </h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                  {selectedDetail.region}
                </span>
              </div>
            </div>

            {/* Client list */}
            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <h4 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                {t('portal.markets.clientsIn', { name: selectedDetail.name })}
              </h4>
              <div className="space-y-3">
                {selectedDetail.clients.map((clientName) => {
                  const clientProjects = selectedDetail.projects.filter(
                    (p) => p.client === clientName
                  );
                  const clientAssets = assetsForProjects(assets, clientProjects);
                  return (
                    <div
                      key={clientName}
                      className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-zinc-900 dark:text-white">
                          {clientName}
                        </h5>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-semibold">
                          {clientProjects.length} project{clientProjects.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {clientProjects.length > 0 ? (
                        <div className="space-y-1.5">
                          {clientProjects.map((proj) => {
                            const projAssetCount = clientAssets.filter(
                              (a) => a.project_id === proj.id
                            ).length;
                            return (
                              <div
                                key={proj.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-zinc-700 dark:text-zinc-300">
                                  {proj.name}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {projAssetCount} asset{projAssetCount !== 1 ? 's' : ''}
                                  </span>
                                  <span
                                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                      proj.status === ProjectStatus.Delivered
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : proj.status === ProjectStatus.InProgress
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    }`}
                                  >
                                    {proj.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-400 dark:text-zinc-500">
                          {t('portal.markets.noProjectsYet')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project status distribution */}
            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <h4 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {t('portal.markets.projectStatusDistribution')}
              </h4>
              {selectedDetail.projects.length > 0 ? (
                <>
                  {/* Stacked horizontal bar */}
                  <div className="h-6 flex rounded-full overflow-hidden mb-3">
                    {statusDistribution(selectedDetail.projects).map((seg) => (
                      <div
                        key={seg.status}
                        className={`${seg.color} transition-all`}
                        style={{ width: `${seg.pct}%` }}
                        title={`${seg.status}: ${seg.count}`}
                      />
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3">
                    {statusDistribution(selectedDetail.projects).map((seg) => (
                      <div key={seg.status} className="flex items-center gap-1.5 text-xs">
                        <span className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                          {seg.status}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500">({seg.count})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  {t('portal.markets.noProjectsInMarket')}
                </p>
              )}
            </div>

            {/* Asset performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/5 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  {t('portal.markets.totalViews')}
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {selectedDetail.totalViews.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t('portal.markets.acrossAllAssetsIn', { name: selectedDetail.name })}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-900/5 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2 text-sm font-semibold">
                  <Users className="w-4 h-4" />
                  {t('portal.markets.uniqueVisitors')}
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {selectedDetail.uniqueVisitors.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t('portal.markets.distinctViewersIn', { name: selectedDetail.name })}
                </p>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <h4 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {t('portal.markets.recentActivity')}
              </h4>
              {selectedDetail.projects.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity(selectedDetail.projects).map((event, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {event.projectName}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{event.action}</p>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {event.time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  {t('portal.markets.noRecentActivity')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
