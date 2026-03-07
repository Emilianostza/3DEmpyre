import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '@/types';
import { ProjectStatus } from '@/types/domain';
import { timeAgo } from '@/utils/formatters';
import {
  Clock,
  UserCheck,
  Loader2,
  ClipboardCheck,
  CheckCircle,
  Truck,
  ArrowRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkflowPipelineProps {
  projects: Project[];
  onStatusChange?: (projectId: string, newStatus: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIPELINE_STATUSES = [
  ProjectStatus.Pending,
  ProjectStatus.Assigned,
  ProjectStatus.Processing,
  ProjectStatus.QA,
  ProjectStatus.Approved,
  ProjectStatus.Delivered,
] as const;

type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

interface ColumnConfig {
  status: PipelineStatus;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  color: string; // Tailwind color prefix (e.g. "orange")
  borderClass: string; // Left-border color class
  badgeBg: string; // Badge background classes
  badgeText: string; // Badge text color classes
}

const COLUMNS: ColumnConfig[] = [
  {
    status: ProjectStatus.Pending,
    label: 'Pending',
    icon: Clock,
    color: 'orange',
    borderClass: 'border-l-orange-500',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/30',
    badgeText: 'text-orange-700 dark:text-orange-300',
  },
  {
    status: ProjectStatus.Assigned,
    label: 'Assigned',
    icon: UserCheck,
    color: 'blue',
    borderClass: 'border-l-blue-500',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
  {
    status: ProjectStatus.Processing,
    label: 'Processing',
    icon: Loader2,
    color: 'purple',
    borderClass: 'border-l-purple-500',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/30',
    badgeText: 'text-purple-700 dark:text-purple-300',
  },
  {
    status: ProjectStatus.QA,
    label: 'QA',
    icon: ClipboardCheck,
    color: 'amber',
    borderClass: 'border-l-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  {
    status: ProjectStatus.Approved,
    label: 'Approved',
    icon: CheckCircle,
    color: 'emerald',
    borderClass: 'border-l-emerald-500',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    status: ProjectStatus.Delivered,
    label: 'Delivered',
    icon: Truck,
    color: 'teal',
    borderClass: 'border-l-teal-500',
    badgeBg: 'bg-teal-100 dark:bg-teal-900/30',
    badgeText: 'text-teal-700 dark:text-teal-300',
  },
];

/** Map each status to the next status it can advance to. */
const STATUS_FLOW: Partial<Record<PipelineStatus, PipelineStatus>> = {
  [ProjectStatus.Pending]: ProjectStatus.Assigned,
  [ProjectStatus.Assigned]: ProjectStatus.Processing,
  [ProjectStatus.Processing]: ProjectStatus.QA,
  [ProjectStatus.QA]: ProjectStatus.Approved,
  [ProjectStatus.Approved]: ProjectStatus.Delivered,
};

const PIPELINE_STATUS_SET = new Set<string>(PIPELINE_STATUSES);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({ projects, onStatusChange }) => {
  const { t } = useTranslation();
  const columns = COLUMNS.map((c) => ({ ...c, label: t(`workflow.${c.status}`) }));
  const grouped = useMemo(() => {
    const map: Record<string, Project[]> = {};
    for (const status of PIPELINE_STATUSES) {
      map[status] = [];
    }
    for (const project of projects) {
      if (PIPELINE_STATUS_SET.has(project.status)) {
        map[project.status].push(project);
      }
    }
    return map;
  }, [projects]);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-2">
        {columns.map((col) => {
          const Icon = col.icon;
          const columnProjects = grouped[col.status] || [];
          const nextStatus = STATUS_FLOW[col.status];

          return (
            <div
              key={col.status}
              className="min-w-[200px] flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg p-3"
            >
              {/* Column header */}
              <div
                className={`sticky top-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10 border-l-[3px] ${col.borderClass} rounded px-3 py-2 mb-3 flex items-center gap-2`}
              >
                <Icon className={`w-4 h-4 ${col.badgeText}`} />
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {col.label}
                </span>
                <span
                  className={`ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${col.badgeBg} ${col.badgeText}`}
                >
                  {columnProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {columnProjects.length === 0 ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-6">
                    {t('workflow.noProjects')}
                  </p>
                ) : (
                  columnProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white/90 dark:bg-zinc-800/90 rounded-lg p-3 shadow-sm ring-1 ring-black/5 dark:ring-white/5 hover:ring-black/10 dark:hover:ring-white/10 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                    >
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {project.client}
                      </p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                        {project.name}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                          {project.items}{' '}
                          {project.items !== 1 ? t('workflow.items') : t('workflow.item')}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {timeAgo(project.updated_at ?? '')}
                        </span>
                      </div>

                      {nextStatus && onStatusChange && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(project.id, nextStatus)}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                        >
                          {t('workflow.advance')}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
