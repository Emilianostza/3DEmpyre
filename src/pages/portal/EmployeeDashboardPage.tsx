import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  ChefHat,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  MapPin,
  Mail,
} from 'lucide-react';
import { timeAgo, getInitials } from '@/utils/formatters';
import { usePortalContext } from '@/types/portal';
import { Project } from '@/types';
import { useUrlSearchParam } from '@/hooks/useUrlSearchParam';
import { WorkflowPipeline } from '@/components/portal/WorkflowPipeline';
import { SchedulingCalendar } from '@/components/portal/SchedulingCalendar';
import { AssetAnalyticsBoard } from '@/components/portal/AssetAnalyticsBoard';
import { RecentAssetsStrip } from '@/components/portal/RecentAssetsStrip';
import { getStatusConfig } from '@/constants/status-config';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
];


const EmployeeDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projects, assets, handleUpdateProject, setEditingProject } = usePortalContext();
  const [projectSearchTerm, setProjectSearchTerm] = useUrlSearchParam('search');
  const debouncedProjectSearch = useDebouncedValue(projectSearchTerm);
  const [calendarMonth, setCalendarMonth] = useUrlSearchParam('month');
  const [calendarDate, setCalendarDate] = useUrlSearchParam('date');
  const [dateRange, setDateRange] = useUrlSearchParam('dateRange', 'last30days');
  const pendingRequests = projects.filter((p) => p.status === 'pending');

  return (
    <div className="space-y-8">
      <h1 className="sr-only">{t('portal.tab.dashboard')}</h1>
      {/* New Customer Requests */}
      {pendingRequests.length > 0 && (
        <div className="mt-6">
          <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl ring-1 ring-amber-500/20 dark:ring-amber-500/20 overflow-hidden shadow-sm shadow-amber-100 dark:shadow-amber-900/10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-900/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-sm font-bold font-serif-premium text-zinc-900 dark:text-white uppercase tracking-wider">
                  {t('portal.newMenuRequests')}
                </h2>
                <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              </div>
              <button
                onClick={() => navigate('../customers')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors"
              >
                {t('portal.viewAll')} <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* Request rows */}
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
              {pendingRequests.map((req, i) => {
                const initials = getInitials(req.client);
                return (
                  <div
                    key={req.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group"
                  >
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                    >
                      {initials}
                    </div>

                    {/* Client + project name */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-zinc-900 dark:text-white text-sm truncate">
                        {req.client}
                      </div>
                      <div className="text-xs text-zinc-400 truncate mt-0.5">{req.name}</div>
                    </div>

                    {/* Address */}
                    {req.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer min-w-0 max-w-[180px]"
                      >
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs truncate">{req.address}</span>
                      </a>
                    )}

                    {/* Dishes */}
                    <div className="hidden lg:flex items-center gap-1 flex-shrink-0 text-zinc-400">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {t('portal.dishes', { count: req.items })}
                      </span>
                    </div>

                    {/* Time */}
                    <span className="hidden sm:block text-xs text-zinc-400 flex-shrink-0">
                      {timeAgo(req.created_at ?? '')}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={`mailto:${encodeURIComponent(req.client.replace(/\s+/g, '.').toLowerCase())}@example.com?subject=${encodeURIComponent(`Re: ${req.name}`)}&body=${encodeURIComponent(`Hi ${req.client},\n\nRegarding your menu request "${req.name}":\n\n`)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800/50"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {t('portal.email', 'Email')}
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateProject(req.id, {
                            status: 'approved' as Project['status'],
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800/50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('portal.accept')}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateProject(req.id, {
                            status: 'archived' as Project['status'],
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-zinc-200 dark:border-zinc-700"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {t('portal.decline')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Workflow Pipeline */}
      <div className="mt-6">
        <WorkflowPipeline
          projects={projects}
          onStatusChange={(projectId, newStatus) =>
            handleUpdateProject(projectId, {
              status: newStatus as Project['status'],
            })
          }
        />
      </div>

      {/* Scheduling Calendar */}
      <div className="mt-6">
        <SchedulingCalendar
          projects={projects}
          onSelectProject={(project) => setEditingProject(project)}
          month={calendarMonth || undefined}
          selectedDateParam={calendarDate || undefined}
          onMonthChange={setCalendarMonth}
          onDateChange={(d) => setCalendarDate(d)}
        />
      </div>

      {/* Performance Analytics */}
      <div className="mt-6">
        <AssetAnalyticsBoard
          assets={assets}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Recent Assets Strip */}
      <div className="mt-6">
        <RecentAssetsStrip assets={assets} />
      </div>

      {/* Customers List */}
      <div className="mt-6">
        <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold font-serif-premium text-zinc-900 dark:text-white tracking-wide">
                {t('portal.customers')}
              </h2>
              <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {projects.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder={t('portal.search')}
                  className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 w-36 text-zinc-900 dark:text-zinc-100"
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => navigate('../customers')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                {t('portal.viewAll')} <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
            {(() => {
              const filtered = projects
                .filter(
                  (p) =>
                    !debouncedProjectSearch ||
                    p.name.toLowerCase().includes(debouncedProjectSearch.toLowerCase()) ||
                    p.client.toLowerCase().includes(debouncedProjectSearch.toLowerCase())
                )
                .slice(0, 5);

              if (filtered.length === 0)
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-600">
                    <ChefHat className="w-6 h-6 mb-2 opacity-40" />
                    <span className="text-sm">{t('portal.noClientsFound')}</span>
                  </div>
                );

              return filtered.map((p, i) => {
                const projectAssets = assets.filter((a) => a.project_id === p.id);
                const initials = getInitials(p.client);
                const colorCls = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const st = getStatusConfig(p.status);

                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group"
                  >
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm ${colorCls}`}
                    >
                      {initials}
                    </div>

                    {/* Client + project */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-zinc-900 dark:text-white text-sm truncate">
                        {p.client}
                      </div>
                      <div className="text-xs text-zinc-400 truncate mt-0.5">{p.name}</div>
                    </div>

                    {/* Status */}
                    <span
                      className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${st.cls}`}
                    >
                      {t(st.i18nKey)}
                    </span>

                    {/* Asset thumbs */}
                    <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                      {projectAssets.length === 0 ? (
                        <span className="text-[11px] text-zinc-300 dark:text-zinc-600 italic">
                          {t('portal.noAssets')}
                        </span>
                      ) : (
                        <>
                          <div className="flex -space-x-1.5">
                            {projectAssets.slice(0, 4).map((a) => (
                              <img
                                key={a.id}
                                src={a.thumb}
                                alt={a.name}
                                className="w-7 h-7 rounded-lg object-cover border-2 border-white dark:border-zinc-900 shadow-sm"
                                loading="lazy"
                              />
                            ))}
                          </div>
                          {projectAssets.length > 4 && (
                            <span className="text-[11px] font-medium text-zinc-400">
                              +{projectAssets.length - 4}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Dishes */}
                    <div className="hidden lg:flex items-center gap-1 flex-shrink-0 text-zinc-400">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {t('portal.dishes', { count: p.items })}
                      </span>
                    </div>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        const proj = projects.find((x) => x.id === p.id);
                        if (proj) setEditingProject(proj);
                      }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-zinc-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                      title={t('projectTable.edit')}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                        />
                      </svg>
                    </button>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
