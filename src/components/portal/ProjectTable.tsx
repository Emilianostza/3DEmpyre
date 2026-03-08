import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, Asset } from '@/types';
import { ProjectStatus } from '@/types/domain';
import {
  Edit,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Eye,
  FileSearch,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
} from 'lucide-react';
import { AssetGrid } from '@/components/portal/AssetGrid';
import { ProjectLifecycleTracker } from '@/components/portal/ProjectLifecycleTracker';
import { AccessBadge } from '@/components/portal/AccessBadge';
import { timeAgo } from '@/utils/formatters';
import { getStatusConfig } from '@/constants/status-config';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

// ── Component ────────────────────────────────────────────────

interface ProjectTableProps {
  projects: Project[];
  assets?: Asset[];
  onEditProject?: (projectId: string) => void;
  onAssignTechnician?: (project: Project) => void;
  /** Controlled expanded row — when provided, the component uses this instead of internal state */
  expandedId?: string | null;
  /** Callback when a row is toggled — required when `expandedId` is controlled */
  onToggleExpand?: (id: string | null) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  assets = [],
  onEditProject,
  onAssignTechnician,
  expandedId: controlledExpandedId,
  onToggleExpand,
}) => {
  const { t } = useTranslation();
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);

  // Use controlled state when provided, otherwise fall back to internal
  const isControlled = controlledExpandedId !== undefined;
  const expandedProjectId = isControlled ? controlledExpandedId : internalExpandedId;

  const toggleExpand = (projectId: string) => {
    const next = expandedProjectId === projectId ? null : projectId;
    if (isControlled && onToggleExpand) {
      onToggleExpand(next);
    } else {
      setInternalExpandedId(next);
    }
  };

  // ── FILTERING STATE ──
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdown when clicking outside or scrolling
  React.useEffect(() => {
    if (!activeDropdown) return;
    const handleClose = () => setActiveDropdown(null);
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, { passive: true });
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose);
    };
  }, [activeDropdown]);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    // Status Filter
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;

    // Search Query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      const matchId = p.id.toLowerCase().includes(query);
      const matchName = p.name.toLowerCase().includes(query);
      const matchClient = p.client.toLowerCase().includes(query);
      if (!matchId && !matchName && !matchClient) return false;
    }
    return true;
  });

  // Extract unique statuses from current projects to populate filter dropdown efficiently
  const availableStatuses = Array.from(new Set(projects.map(p => p.status)));

  return (
    <div className="space-y-4">
      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t('projectTable.searchPlaceholder', 'Search projects...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-shadow"
          />
        </div>

      </div>

      {/* ── TABLE ── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl shadow-black/5 border border-zinc-200 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
              <tr>
                <th className="p-4 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest pl-6 hidden sm:table-cell">
                  {t('projectTable.id')}
                </th>
                <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {t('projectTable.projectName')}
                </th>
                <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {t('projectTable.client')}
                </th>
                <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  <div className="relative inline-flex items-center gap-1.5 cursor-pointer group">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title={t('projectTable.filterByStatus', 'Filter by status')}
                    >
                      <option value="all">{t('projectTable.status')}</option>
                      {availableStatuses.map(status => {
                        const cfg = getStatusConfig(status);
                        return (
                          <option key={status} value={status}>
                            {t(cfg.i18nKey)}
                          </option>
                        );
                      })}
                    </select>
                    <span>{statusFilter === 'all' ? t('projectTable.status') : t(getStatusConfig(statusFilter).i18nKey)}</span>
                    <Filter className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden lg:table-cell">
                  {t('projectTable.technician')}
                </th>
                <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {t('projectTable.assets')}
                </th>
                <th className="p-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden md:table-cell">
                  {t('projectTable.updated')}
                </th>
                <th className="p-4 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest pr-6 text-right">
                  {t('projectTable.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-zinc-500 dark:text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileSearch className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                      <p>{t('projectTable.noProjectsFound', 'No projects found matching your criteria.')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const statusCfg = getStatusConfig(p.status);
                  const StatusIcon = statusCfg.icon;
                  const projectAssets = assets.filter((a) => a.project_id === p.id);

                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer" onClick={() => toggleExpand(p.id)}>
                        <td className="p-4 pl-6 text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium hidden sm:table-cell">
                          {p.id.slice(0, 8)}
                        </td>
                        <td className="p-4 text-sm font-bold text-zinc-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            {expandedProjectId === p.id ? (
                              <ChevronUp className="w-4 h-4 text-brand-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-brand-400 flex-shrink-0 transition-colors" />
                            )}
                            <span className="truncate max-w-[200px] font-sans-premium tracking-tight">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">{p.client}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${statusCfg.iconCls}`} />
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.cls}`}
                            >
                              {t(statusCfg.i18nKey)}
                            </span>
                            <AccessBadge
                              visibility={
                                p.status === ProjectStatus.Delivered ||
                                  p.status === ProjectStatus.Approved
                                  ? 'customer'
                                  : 'team'
                              }
                            />
                          </div>
                          {p.rejection_reason && p.status === ProjectStatus.Rejected && (
                            <p
                              className="text-[10px] text-red-500 dark:text-red-400 mt-1 truncate max-w-[160px]"
                              title={p.rejection_reason}
                            >
                              {p.rejection_reason}
                            </p>
                          )}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          {p.assigned_to ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                              <UserCheck className="w-3 h-3" />
                              {p.assigned_to}
                            </span>
                          ) : onAssignTechnician ? (
                            <button
                              onClick={() => onAssignTechnician(p)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                            >
                              <UserPlus className="w-3 h-3" />
                              {t('projectTable.assign')}
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 text-xs font-semibold">
                            {projectAssets.length} / {p.items}
                          </span>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {timeAgo(p.updated_at ?? '')}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === p.id ? null : p.id);
                              }}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                              aria-label={t('projectTable.actions')}
                              aria-haspopup="menu"
                              aria-expanded={activeDropdown === p.id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeDropdown === p.id && (
                              <div
                                role="menu"
                                aria-label={t('projectTable.actions')}
                                className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-900 shadow-2xl shadow-black/50 border border-zinc-200 dark:border-white/10 overflow-hidden z-[60] origin-top-right animate-in fade-in zoom-in-95 duration-100"
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    setActiveDropdown(null);
                                    return;
                                  }
                                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    const items = (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
                                    const idx = Array.from(items).indexOf(e.target as HTMLButtonElement);
                                    const next = e.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
                                    items[next]?.focus();
                                  }
                                }}
                              >
                                <div className="py-1">
                                  <button
                                    role="menuitem"
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      onEditProject?.(p.id);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-2 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    {t('projectTable.editProject', 'Edit Details')}
                                  </button>

                                  <button
                                    role="menuitem"
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      toggleExpand(p.id);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-2 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                    {expandedProjectId === p.id ? t('projectTable.hideAssets', 'Hide Assets') : t('projectTable.viewAssets', 'View Assets')}
                                  </button>

                                  {onAssignTechnician && !p.assigned_to && [ProjectStatus.Approved, ProjectStatus.Pending].includes(p.status as ProjectStatus) && (
                                    <button
                                      role="menuitem"
                                      onClick={() => {
                                        setActiveDropdown(null);
                                        onAssignTechnician(p);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2 transition-colors border-t border-zinc-100 dark:border-white/5"
                                    >
                                      <UserPlus className="w-4 h-4" />
                                      {t('projectTable.assignTechnician', 'Assign Tech')}
                                    </button>
                                  )}

                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedProjectId === p.id && (
                        <tr className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900">
                          <td colSpan={8} className="p-6">
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                              <ProjectLifecycleTracker currentStatus={p.status} className="mb-4" />
                              {/* Project Details Strip */}
                              <div className="flex flex-wrap items-center gap-4 mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                                    <span className="text-brand-700 dark:text-brand-300 font-bold text-sm">
                                      {projectAssets.length}
                                    </span>
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                                      {t('projectTable.capturedAssets')}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                      {projectAssets.length} {t('projectTable.of')} {p.items}{' '}
                                      {t('projectTable.items')}
                                    </p>
                                  </div>
                                </div>
                                {p.address && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 hover:text-brand-500 dark:hover:text-brand-400 transition-colors cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="font-medium text-zinc-500 dark:text-zinc-400">
                                      {t('projectTable.location')}:
                                    </span>
                                    {p.address}
                                  </a>
                                )}
                                {p.assigned_to && (
                                  <div className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" />
                                    <span className="font-medium">{t('projectTable.technician')}:</span>
                                    {p.assigned_to}
                                  </div>
                                )}
                                {p.created_at && (
                                  <div className="text-xs text-zinc-400 dark:text-zinc-500">
                                    <span className="font-medium text-zinc-500 dark:text-zinc-400">
                                      {t('projectTable.created')}:
                                    </span>{' '}
                                    {new Date(p.created_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              {/* Assets */}
                              {projectAssets.length > 0 ? (
                                <AssetGrid assets={projectAssets} role="employee" projectId={p.id} />
                              ) : (
                                <div className="text-center py-10 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                                    {t('projectTable.noAssetsCapturedYet')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
