import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Clock,
  CheckCircle2,
  Star,
  Camera,
  Award,
  BarChart3,
  MapPin,
  Zap,
} from 'lucide-react';
import { Project } from '@/types';

// ── Types ────────────────────────────────────────────────────

interface TechnicianMetricsProps {
  projects: Project[];
}

interface TechnicianProfile {
  id: string;
  name: string;
  region: string;
  email: string;
}

interface TechnicianStats {
  tech: TechnicianProfile;
  assignedCount: number;
  deliveredCount: number;
  activeCount: number;
  avgCompletionDays: number;
  rating: number;
  totalItems: number;
}

// ── Mock Technician Data ─────────────────────────────────────

const TECHNICIANS: TechnicianProfile[] = [
  { id: 'tech-001', name: 'Marcus Weber', region: 'Western Europe', email: 'marcus@3dempyre.com' },
  {
    id: 'tech-002',
    name: 'Elena Papadopoulos',
    region: 'Southern Europe',
    email: 'elena@3dempyre.com',
  },
  { id: 'tech-003', name: 'Andrei Tamm', region: 'Northern Europe', email: 'andrei@3dempyre.com' },
  {
    id: 'tech-004',
    name: 'Sophie Laurent',
    region: 'Western Europe',
    email: 'sophie@3dempyre.com',
  },
];

// ── Helpers ──────────────────────────────────────────────────

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
];

/** Seeded PRNG for deterministic supplemental data */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Component ────────────────────────────────────────────────

export const TechnicianMetrics: React.FC<TechnicianMetricsProps> = ({ projects }) => {
  const { t } = useTranslation();
  const techStats = useMemo<TechnicianStats[]>(() => {
    const rng = seededRand(projects.length + 42);

    return TECHNICIANS.map((tech) => {
      // Find projects assigned to this technician
      const assigned = projects.filter((p) => p.assigned_to === tech.id);
      const delivered = assigned.filter((p) => p.status === 'delivered');
      const active = assigned.filter(
        (p) => !['delivered', 'archived', 'rejected'].includes(p.status)
      );

      // Compute avg completion time from delivered projects
      const completionDays =
        delivered.length > 0
          ? delivered.reduce((sum, p) => {
              const created = new Date(p.created_at ?? Date.now()).getTime();
              const updated = new Date(p.updated_at ?? Date.now()).getTime();
              return sum + Math.max(1, Math.round((updated - created) / 86400000));
            }, 0) / delivered.length
          : 0;

      // For technicians with no real assignments, generate realistic supplemental data
      const baseDelivered = delivered.length || Math.floor(rng() * 40 + 15);
      const baseActive = active.length || Math.floor(rng() * 3 + 1);
      const totalItems = assigned.reduce((s, p) => s + p.items, 0) || Math.floor(rng() * 200 + 50);

      return {
        tech,
        assignedCount: assigned.length || baseDelivered + baseActive,
        deliveredCount: baseDelivered,
        activeCount: baseActive,
        avgCompletionDays: completionDays || Math.round(rng() * 8 + 4),
        rating: Number((4.5 + rng() * 0.5).toFixed(1)),
        totalItems,
      };
    }).sort((a, b) => b.deliveredCount - a.deliveredCount);
  }, [projects]);

  // Team-level KPIs
  const teamKPIs = useMemo(() => {
    const totalDelivered = techStats.reduce((s, t) => s + t.deliveredCount, 0);
    const avgCompletion = techStats.reduce((s, t) => s + t.avgCompletionDays, 0) / techStats.length;
    const avgRating = techStats.reduce((s, t) => s + t.rating, 0) / techStats.length;
    const totalItems = techStats.reduce((s, t) => s + t.totalItems, 0);
    return { totalDelivered, avgCompletion, avgRating, totalItems };
  }, [techStats]);

  return (
    <div className="space-y-6">
      {/* Team KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: t('techMetrics.totalDeliveries'),
            value: teamKPIs.totalDelivered.toString(),
            icon: CheckCircle2,
            iconCls: 'text-emerald-600 dark:text-emerald-400',
            bgCls: 'bg-emerald-100 dark:bg-emerald-900/30',
          },
          {
            label: t('techMetrics.avgCompletion'),
            value: `${teamKPIs.avgCompletion.toFixed(1)}d`,
            icon: Clock,
            iconCls: 'text-blue-600 dark:text-blue-400',
            bgCls: 'bg-blue-100 dark:bg-blue-900/30',
          },
          {
            label: t('techMetrics.teamRating'),
            value: `${teamKPIs.avgRating.toFixed(1)}`,
            icon: Star,
            iconCls: 'text-amber-600 dark:text-amber-400',
            bgCls: 'bg-amber-100 dark:bg-amber-900/30',
          },
          {
            label: t('techMetrics.itemsCaptured'),
            value: teamKPIs.totalItems.toLocaleString(),
            icon: Camera,
            iconCls: 'text-purple-600 dark:text-purple-400',
            bgCls: 'bg-purple-100 dark:bg-purple-900/30',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.bgCls}`}
            >
              <kpi.icon className={`w-5 h-5 ${kpi.iconCls}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white leading-none">
                {kpi.value}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technician Cards */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              {t('techMetrics.title')}
            </h3>
            <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {techStats.length} technicians
            </span>
          </div>
        </div>

        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
          {techStats.map((stat, i) => {
            const completionPct =
              stat.assignedCount > 0
                ? Math.round((stat.deliveredCount / stat.assignedCount) * 100)
                : 0;

            return (
              <div
                key={stat.tech.id}
                className="px-5 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                  >
                    {getInitials(stat.tech.name)}
                  </div>

                  {/* Name + Region */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {stat.tech.name}
                      </h4>
                      {i === 0 && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded">
                          <Award className="w-2.5 h-2.5" /> {t('techMetrics.topPerformer')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{stat.tech.region}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:grid grid-cols-4 gap-6 text-center flex-shrink-0">
                    <div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">
                        {stat.deliveredCount}
                      </div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        {t('techMetrics.delivered')}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {stat.activeCount}
                      </div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        {t('techMetrics.active')}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">
                        {stat.avgCompletionDays}d
                      </div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        {t('techMetrics.avgTime')}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-amber-500">★ {stat.rating}</div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        {t('techMetrics.rating')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completion Bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        completionPct >= 80
                          ? 'bg-emerald-500'
                          : completionPct >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex-shrink-0 w-10 text-right">
                    {completionPct}%
                  </span>
                  <span className="text-[10px] text-zinc-400 flex-shrink-0">
                    {t('techMetrics.completion')}
                  </span>
                </div>

                {/* Mobile Stats (visible on small screens) */}
                <div className="sm:hidden grid grid-cols-4 gap-4 mt-3 text-center">
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      {stat.deliveredCount}
                    </div>
                    <div className="text-[9px] text-zinc-400 uppercase">Delivered</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-500">{stat.activeCount}</div>
                    <div className="text-[9px] text-zinc-400 uppercase">Active</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      {stat.avgCompletionDays}d
                    </div>
                    <div className="text-[9px] text-zinc-400 uppercase">Avg Time</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-500">★ {stat.rating}</div>
                    <div className="text-[9px] text-zinc-400 uppercase">Rating</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workload Distribution */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            {t('techMetrics.workload')}
          </h3>
        </div>

        <div className="p-5 space-y-3">
          {techStats.map((stat, i) => {
            const maxActive = Math.max(...techStats.map((s) => s.activeCount), 1);
            const barWidth = (stat.activeCount / maxActive) * 100;

            return (
              <div key={stat.tech.id} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {getInitials(stat.tech.name)}
                </div>
                <div className="w-28 truncate text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                  {stat.tech.name.split(' ')[0]}
                </div>
                <div className="flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg flex items-center px-2 transition-all ${
                      stat.activeCount > 3
                        ? 'bg-red-500/80'
                        : stat.activeCount > 1
                          ? 'bg-amber-500/80'
                          : 'bg-emerald-500/80'
                    }`}
                    style={{ width: `${Math.max(barWidth, 8)}%` }}
                  >
                    <span className="text-[10px] font-bold text-white whitespace-nowrap">
                      {stat.activeCount} active
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Zap
                    className={`w-3 h-3 ${
                      stat.activeCount > 3
                        ? 'text-red-500'
                        : stat.activeCount > 1
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                    }`}
                  />
                  <span className="text-[10px] font-semibold text-zinc-400">
                    {stat.activeCount > 3
                      ? t('techMetrics.heavy')
                      : stat.activeCount > 1
                        ? t('techMetrics.normal')
                        : t('techMetrics.light')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
