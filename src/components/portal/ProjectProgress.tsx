import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, Asset } from '@/types';
import {
  Clock,
  CheckCircle2,
  UserCheck,
  Camera,
  Loader2,
  FileSearch,
  Truck,
  GitBranch,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
  Check,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Pipeline stage definitions
// ---------------------------------------------------------------------------

const PIPELINE_STAGES = [
  { id: 'pending', labelKey: 'projectProgress.requested', icon: Clock, color: 'zinc' },
  { id: 'approved', labelKey: 'projectProgress.approved', icon: CheckCircle2, color: 'blue' },
  { id: 'assigned', labelKey: 'projectProgress.assigned', icon: UserCheck, color: 'indigo' },
  { id: 'captured', labelKey: 'projectProgress.captured', icon: Camera, color: 'violet' },
  { id: 'processing', labelKey: 'projectProgress.processing', icon: Loader2, color: 'amber' },
  { id: 'qa', labelKey: 'projectProgress.qa', icon: FileSearch, color: 'purple' },
  { id: 'delivered', labelKey: 'projectProgress.delivered', icon: Truck, color: 'emerald' },
] as const;

type _StageId = (typeof PIPELINE_STAGES)[number]['id'];

// ---------------------------------------------------------------------------
// Color mappings for Tailwind classes (avoids dynamic class generation)
// ---------------------------------------------------------------------------

const STAGE_BG: Record<string, string> = {
  zinc: 'bg-zinc-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  emerald: 'bg-emerald-500',
};

const STAGE_BG_LIGHT: Record<string, string> = {
  zinc: 'bg-zinc-100 dark:bg-zinc-800',
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
  violet: 'bg-violet-100 dark:bg-violet-900/30',
  amber: 'bg-amber-100 dark:bg-amber-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
};

const STAGE_TEXT: Record<string, string> = {
  zinc: 'text-zinc-600 dark:text-zinc-400',
  blue: 'text-blue-600 dark:text-blue-400',
  indigo: 'text-indigo-600 dark:text-indigo-400',
  violet: 'text-violet-600 dark:text-violet-400',
  amber: 'text-amber-600 dark:text-amber-400',
  purple: 'text-purple-600 dark:text-purple-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
};

const STAGE_RING: Record<string, string> = {
  zinc: 'ring-zinc-400',
  blue: 'ring-blue-400',
  indigo: 'ring-indigo-400',
  violet: 'ring-violet-400',
  amber: 'ring-amber-400',
  purple: 'ring-purple-400',
  emerald: 'ring-emerald-400',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the index of a project status within PIPELINE_STAGES, or -1. */
function stageIndex(status: string): number {
  return PIPELINE_STAGES.findIndex((s) => s.id === status);
}

/** Human-readable elapsed duration from an ISO timestamp to now. */
function formatElapsed(isoTimestamp: string | undefined): string {
  if (!isoTimestamp) return '--';
  try {
    const diffMs = Date.now() - new Date(isoTimestamp).getTime();
    if (diffMs < 0) return '--';
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(diffMs / (1000 * 60));
    return minutes > 0 ? `${minutes}m` : '<1m';
  } catch (err: unknown) {
    if (import.meta.env.DEV) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[ProjectProgress] formatElapsed error:', message);
    }
    return '--';
  }
}

/** Check whether a project has been stuck (>3 days) in its current stage. */
function isDelayed(updatedAt: string | undefined): boolean {
  if (!updatedAt) return false;
  try {
    const diffMs = Date.now() - new Date(updatedAt).getTime();
    return diffMs > 3 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/** Compute days between two ISO timestamps. */
function daysBetween(start: string, end: string): number {
  try {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProjectProgressProps {
  projects: Project[];
  assets: Asset[];
  onAdvanceStage?: (projectId: string, newStatus: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ProjectProgress: React.FC<ProjectProgressProps> = ({
  projects,
  assets,
  onAdvanceStage,
}) => {
  const { t } = useTranslation();
  const [completedExpanded, setCompletedExpanded] = useState(false);

  // ---- Derived data ----

  const activeProjects = useMemo(
    () =>
      projects.filter((p) => {
        const status = p.status as string;
        return status !== 'archived' && status !== 'delivered';
      }),
    [projects]
  );

  const deliveredProjects = useMemo(
    () =>
      projects
        .filter((p) => (p.status as string) === 'delivered')
        .sort((a, b) => {
          const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 5),
    [projects]
  );

  // ---- KPIs ----

  const kpis = useMemo(() => {
    const totalActive = activeProjects.length;

    // Average completion time (days) among delivered projects
    const deliveredWithTimes = projects.filter(
      (p) => (p.status as string) === 'delivered' && p.created_at && p.updated_at
    );
    const avgCompletionDays =
      deliveredWithTimes.length > 0
        ? Math.round(
            deliveredWithTimes.reduce(
              (sum, p) => sum + daysBetween(p.created_at ?? '', p.updated_at ?? ''),
              0
            ) / deliveredWithTimes.length
          )
        : null;

    // On-track vs delayed
    const delayed = activeProjects.filter((p) => isDelayed(p.updated_at)).length;
    const onTrack = totalActive - delayed;

    // Completion rate
    const allNonArchived = projects.filter((p) => (p.status as string) !== 'archived');
    const completionRate =
      allNonArchived.length > 0
        ? Math.round(
            (projects.filter((p) => (p.status as string) === 'delivered').length /
              allNonArchived.length) *
              100
          )
        : 0;

    return { totalActive, avgCompletionDays, onTrack, delayed, completionRate };
  }, [projects, activeProjects]);

  // ---- Stage distribution ----

  const stageDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const stage of PIPELINE_STAGES) {
      counts[stage.id] = 0;
    }
    for (const p of projects) {
      const status = p.status as string;
      if (status in counts) {
        counts[status] += 1;
      }
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { counts, total };
  }, [projects]);

  // ---- Helpers for rendering ----

  function getProjectAssetCount(projectId: string): number {
    return assets.filter((a) => a.project_id === projectId).length;
  }

  function getNextStage(currentStatus: string): (typeof PIPELINE_STAGES)[number] | null {
    const idx = stageIndex(currentStatus);
    if (idx < 0 || idx >= PIPELINE_STAGES.length - 1) return null;
    return PIPELINE_STAGES[idx + 1];
  }

  function estimatedCompletion(currentStatus: string): string {
    const idx = stageIndex(currentStatus);
    if (idx < 0) return '--';
    const remaining = PIPELINE_STAGES.length - 1 - idx; // stages left to delivered
    if (remaining <= 0) return '--';
    const daysLeft = remaining * 2; // mock: 2 days per stage
    return `~${daysLeft}d`;
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      {/* ---- Header ---- */}
      <div className="p-5 md:p-6 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t('projectProgress.title')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('projectProgress.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* ---- KPI Strip ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
        {/* Total Active */}
        <div className="bg-white dark:bg-zinc-900 p-4 md:p-5">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
            {t('projectProgress.activeProjects')}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{kpis.totalActive}</p>
        </div>

        {/* Avg Completion */}
        <div className="bg-white dark:bg-zinc-900 p-4 md:p-5">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
            {t('projectProgress.avgCompletion')}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {kpis.avgCompletionDays !== null ? `${kpis.avgCompletionDays}d` : '\u2014'}
          </p>
        </div>

        {/* On-Track / Delayed */}
        <div className="bg-white dark:bg-zinc-900 p-4 md:p-5">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
            {t('projectProgress.onTrack')} / {t('projectProgress.delayed')}
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            <span className="text-emerald-600 dark:text-emerald-400">{kpis.onTrack}</span>
            <span className="text-zinc-400 dark:text-zinc-600 mx-1">/</span>
            <span className={kpis.delayed > 0 ? 'text-amber-600 dark:text-amber-400' : ''}>
              {kpis.delayed}
            </span>
          </p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-zinc-900 p-4 md:p-5">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
            {t('projectProgress.completionRate')}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {kpis.completionRate}%
            </p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* ---- Stage Distribution Bar ---- */}
      {stageDistribution.total > 0 && (
        <div className="px-5 md:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            {t('projectProgress.stageDistribution')}
          </p>
          {/* Stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {PIPELINE_STAGES.map((stage) => {
              const count = stageDistribution.counts[stage.id] ?? 0;
              if (count === 0) return null;
              const pct = (count / stageDistribution.total) * 100;
              return (
                <div
                  key={stage.id}
                  className={`${STAGE_BG[stage.color]} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${t(stage.labelKey)}: ${count}`}
                />
              );
            })}
          </div>
          {/* Labels */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {PIPELINE_STAGES.map((stage) => {
              const count = stageDistribution.counts[stage.id] ?? 0;
              if (count === 0) return null;
              return (
                <div key={stage.id} className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${STAGE_BG[stage.color]}`}
                  />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {t(stage.labelKey)}:{' '}
                    <span className="font-semibold text-zinc-900 dark:text-white">{count}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Active Project Cards ---- */}
      <div className="p-5 md:p-6 space-y-4">
        {activeProjects.length === 0 && (
          <div className="text-center py-12 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {t('projectProgress.noActive')}
            </p>
          </div>
        )}

        {activeProjects.map((project) => {
          const currentIdx = stageIndex(project.status as string);
          const nextStage = getNextStage(project.status as string);
          const delayed = isDelayed(project.updated_at);
          const assetCount = getProjectAssetCount(project.id);
          const elapsed = formatElapsed(project.updated_at);
          const estCompletion = estimatedCompletion(project.status as string);

          return (
            <div
              key={project.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 overflow-hidden"
            >
              {/* Card header */}
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{project.client}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Asset count badge */}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    {assetCount} asset{assetCount !== 1 ? 's' : ''}
                  </span>

                  {/* Time in stage */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <Clock className="w-3 h-3" />
                    {elapsed}
                  </span>

                  {/* Delayed badge */}
                  {delayed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      {t('projectProgress.delayed')}
                    </span>
                  )}

                  {/* Est completion */}
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Est: {estCompletion}
                  </span>
                </div>
              </div>

              {/* Stage timeline */}
              <div className="px-4 py-4 overflow-x-auto">
                <div className="flex items-center min-w-[540px]">
                  {PIPELINE_STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isFuture = idx > currentIdx;
                    const StageIcon = stage.icon;

                    return (
                      <React.Fragment key={stage.id}>
                        {/* Connector line (before dot, except first) */}
                        {idx > 0 && (
                          <div
                            className={`flex-1 h-0.5 ${
                              idx <= currentIdx
                                ? STAGE_BG[stage.color]
                                : 'bg-zinc-200 dark:bg-zinc-700'
                            }`}
                          />
                        )}

                        {/* Stage dot */}
                        <div className="flex flex-col items-center relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
                              isCompleted
                                ? `${STAGE_BG[stage.color]} text-white`
                                : isCurrent
                                  ? `${STAGE_BG_LIGHT[stage.color]} ${STAGE_TEXT[stage.color]} ring-2 ${STAGE_RING[stage.color]}`
                                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <StageIcon
                                className={`w-4 h-4 ${isCurrent && stage.id === 'processing' ? 'animate-spin' : ''}`}
                              />
                            )}

                            {/* Pulse ring for current stage */}
                            {isCurrent && (
                              <span
                                className={`absolute inset-0 rounded-full ${STAGE_RING[stage.color]} ring-2 animate-ping opacity-30`}
                              />
                            )}
                          </div>

                          {/* Label below dot */}
                          <span
                            className={`mt-1.5 text-[10px] font-medium whitespace-nowrap ${
                              isCurrent
                                ? 'text-zinc-900 dark:text-white font-semibold'
                                : isFuture
                                  ? 'text-zinc-400 dark:text-zinc-600'
                                  : 'text-zinc-500 dark:text-zinc-400'
                            }`}
                          >
                            {t(stage.labelKey)}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Advance button */}
              {nextStage && onAdvanceStage && (
                <div className="px-4 pb-3 flex justify-end">
                  <button
                    onClick={() => onAdvanceStage(project.id, nextStage.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm hover:shadow-md"
                  >
                    {t('projectProgress.advance')} {t(nextStage.labelKey)}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Completed Projects (collapsible) ---- */}
      {deliveredProjects.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setCompletedExpanded((prev) => !prev)}
            className="w-full px-5 md:px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                {t('projectProgress.completed')}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                ({deliveredProjects.length})
              </span>
            </div>
            {completedExpanded ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {completedExpanded && (
            <div className="px-5 md:px-6 pb-5 space-y-2">
              {deliveredProjects.map((project) => {
                const totalDays =
                  project.created_at && project.updated_at
                    ? daysBetween(project.created_at, project.updated_at)
                    : null;

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {project.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{project.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {project.updated_at && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                      )}
                      {totalDays !== null && (
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {totalDays}
                          {t('projectProgress.days')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
