import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  ChefHat,
  CheckCircle2,
  XCircle,
  Briefcase,
  Clock,
  Loader2,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';
import { timeAgo, getInitials } from '@/utils/formatters';
import { usePortalContext } from '@/types/portal';
import { Project } from '@/types';
import { WorkflowPipeline } from '@/components/portal/WorkflowPipeline';
import { ActivityFeed } from '@/components/portal/ActivityFeed';
import { StatCard } from '@/components/portal/StatCard';
import { SectionHeader } from '@/components/portal/SectionHeader';
import { ClientHealthMetrics } from '@/components/portal/ClientHealthMetrics';
import { TechnicianMetrics } from '@/components/portal/TechnicianMetrics';
import { AutomatedReporting } from '@/components/portal/AutomatedReporting';
import { getStatusConfig } from '@/constants/status-config';
import { SchedulingCalendar } from '@/components/portal/SchedulingCalendar';
import { DishPerformanceWidget } from '@/components/portal/DishPerformanceWidget';

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
];

const EmployeeDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { projects, assets, handleUpdateProject, setEditingProject } = usePortalContext();
  const [showMore, setShowMore] = useState(false);

  const pendingRequests = projects.filter((p) => p.status === 'pending');

  const kpiValues = {
    total: projects.length,
    pending: pendingRequests.length,
    inProgress: projects.filter((p) => ['approved', 'scheduled', 'in_progress'].includes(p.status))
      .length,
    completed: projects.filter((p) => p.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{t('portal.tab.dashboard')}</h1>

      {/* ── Pending Requests Banner ── */}
      {pendingRequests.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0 basis-48">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {pendingRequests.length}{' '}
              {t('portal.pendingRequests', 'pending request(s)')}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {pendingRequests
                .slice(0, 3)
                .map((r) => r.client)
                .join(', ')}
              {pendingRequests.length > 3 && ` +${pendingRequests.length - 3}`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {/* Inline accept/decline for first request */}
            <button
              onClick={() =>
                handleUpdateProject(pendingRequests[0].id, {
                  status: 'approved' as Project['status'],
                })
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800/50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('portal.accept')}
            </button>
            <button
              onClick={() =>
                handleUpdateProject(pendingRequests[0].id, {
                  status: 'archived' as Project['status'],
                })
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              <XCircle className="w-3.5 h-3.5" />
              {t('portal.decline')}
            </button>
            <Link
              to="../customers"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors ml-1"
            >
              {t('portal.viewAll')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label={t('portal.kpi.totalProjects', 'Total Projects')}
          value={kpiValues.total}
          icon={Briefcase}
          color="brand"
        />
        <StatCard
          label={t('portal.kpi.pending', 'Pending')}
          value={kpiValues.pending}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label={t('portal.kpi.inProgress', 'In Progress')}
          value={kpiValues.inProgress}
          icon={Loader2}
          color="sky"
        />
        <StatCard
          label={t('portal.kpi.completed', 'Completed')}
          value={kpiValues.completed}
          icon={CheckCheck}
          color="emerald"
        />
      </div>

      {/* ── Two Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Workflow Pipeline */}
          <div>
            <SectionHeader title={t('portal.workflowPipeline', 'Workflow Pipeline')} />
            <WorkflowPipeline
              projects={projects}
              onStatusChange={(projectId, newStatus) =>
                handleUpdateProject(projectId, {
                  status: newStatus as Project['status'],
                })
              }
            />
          </div>

          {/* Project Table (compact) */}
          <div>
            <SectionHeader
              title={t('portal.customers', 'Customers')}
              action={
                projects.length > 5 ? (
                  <Link
                    to="../customers"
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
                  >
                    {t('portal.viewAll', 'View All')}
                  </Link>
                ) : undefined
              }
            />
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {projects.slice(0, 5).map((p, i) => {
                  const initials = getInitials(p.client);
                  const st = getStatusConfig(p.status);
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        const proj = projects.find((x) => x.id === p.id);
                        if (proj) setEditingProject(proj);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-zinc-900 dark:text-white text-sm truncate">
                          {p.client}
                        </div>
                        <div className="text-xs text-zinc-400 truncate">{p.name}</div>
                      </div>
                      <span
                        className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${st.cls}`}
                      >
                        {t(st.i18nKey)}
                      </span>
                      <span className="text-xs text-zinc-400 flex-shrink-0 hidden md:block">
                        {timeAgo(p.created_at ?? '')}
                      </span>
                    </div>
                  );
                })}
                {projects.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-400 dark:text-zinc-600">
                    <ChefHat className="w-5 h-5 mb-1.5 opacity-40" />
                    <span className="text-sm">{t('portal.noClientsFound', 'No clients yet')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scheduling Calendar */}
          <div>
            <SectionHeader title={t('portal.schedule', 'Schedule')} />
            <SchedulingCalendar
              projects={projects}
              onSelectProject={(project) => setEditingProject(project)}
            />
          </div>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-4 space-y-6">
          <ActivityFeed projects={projects} assets={assets} />
        </div>
      </div>

      {/* ── Show More (secondary widgets) ── */}
      <div>
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mx-auto"
        >
          {showMore
            ? t('portal.showLess', 'Show less')
            : t('portal.showMore', 'Show more insights')}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`}
          />
        </button>
        {showMore && (
          <div className="space-y-6 mt-6">
            <ClientHealthMetrics projects={projects} assets={assets} />
            <TechnicianMetrics projects={projects} />
            <AutomatedReporting projects={projects} assets={assets} />
            <DishPerformanceWidget assets={assets} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
