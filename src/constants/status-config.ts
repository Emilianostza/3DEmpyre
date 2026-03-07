import { type ElementType } from 'react';
import { ProjectStatus } from '@/types/domain';
import {
  Clock,
  AlertCircle,
  UserCheck,
  Eye,
  Loader2,
  FileSearch,
  CheckCircle2,
  Truck,
  Archive,
  XCircle,
} from 'lucide-react';

export interface ProjectStatusConfig {
  /** i18n key for the status label */
  i18nKey: string;
  /** Badge/chip CSS classes (light + dark) */
  cls: string;
  /** Lucide icon component */
  icon: ElementType;
  /** Icon-specific color class */
  iconCls: string;
  /** Dot indicator class (card view) */
  dotCls: string;
  /** Gradient background class (card view) */
  gradient: string;
}

export const PROJECT_STATUS_CONFIG: Record<string, ProjectStatusConfig> = {
  [ProjectStatus.Pending]: {
    i18nKey: 'portal.status.pending',
    cls: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400',
    icon: Clock,
    iconCls: 'text-zinc-500',
    dotCls: 'bg-zinc-400',
    gradient: 'from-zinc-300/20 via-zinc-200/10 to-transparent',
  },
  [ProjectStatus.Requested]: {
    i18nKey: 'portal.status.requested',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: AlertCircle,
    iconCls: 'text-amber-500',
    dotCls: 'bg-amber-500',
    gradient: 'from-amber-400/20 via-orange-300/10 to-transparent',
  },
  [ProjectStatus.Assigned]: {
    i18nKey: 'portal.status.assigned',
    cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    icon: UserCheck,
    iconCls: 'text-indigo-500',
    dotCls: 'bg-indigo-500',
    gradient: 'from-indigo-400/20 via-violet-300/10 to-transparent',
  },
  [ProjectStatus.Captured]: {
    i18nKey: 'portal.status.captured',
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    icon: Eye,
    iconCls: 'text-sky-500',
    dotCls: 'bg-sky-500',
    gradient: 'from-sky-400/20 via-blue-300/10 to-transparent',
  },
  [ProjectStatus.Processing]: {
    i18nKey: 'portal.status.processing',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Loader2,
    iconCls: 'text-blue-500',
    dotCls: 'bg-blue-500',
    gradient: 'from-blue-400/20 via-sky-300/10 to-transparent',
  },
  [ProjectStatus.QA]: {
    i18nKey: 'portal.status.qa',
    cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    icon: FileSearch,
    iconCls: 'text-purple-500',
    dotCls: 'bg-purple-500',
    gradient: 'from-purple-400/20 via-violet-300/10 to-transparent',
  },
  [ProjectStatus.Approved]: {
    i18nKey: 'portal.status.approved',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: CheckCircle2,
    iconCls: 'text-emerald-500',
    dotCls: 'bg-emerald-500',
    gradient: 'from-emerald-400/20 via-teal-300/10 to-transparent',
  },
  [ProjectStatus.InProgress]: {
    i18nKey: 'portal.status.inProgress',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Clock,
    iconCls: 'text-blue-500',
    dotCls: 'bg-amber-500',
    gradient: 'from-amber-400/20 via-orange-300/10 to-transparent',
  },
  [ProjectStatus.Delivered]: {
    i18nKey: 'portal.status.delivered',
    cls: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    icon: Truck,
    iconCls: 'text-teal-500',
    dotCls: 'bg-teal-500',
    gradient: 'from-teal-400/20 via-cyan-300/10 to-transparent',
  },
  [ProjectStatus.Archived]: {
    i18nKey: 'portal.status.archived',
    cls: 'bg-zinc-100 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500',
    icon: Archive,
    iconCls: 'text-zinc-400',
    dotCls: 'bg-zinc-400',
    gradient: 'from-zinc-300/15 via-zinc-200/5 to-transparent',
  },
  [ProjectStatus.Rejected]: {
    i18nKey: 'portal.status.rejected',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
    iconCls: 'text-red-500',
    dotCls: 'bg-red-500',
    gradient: 'from-red-400/20 via-rose-300/10 to-transparent',
  },
};

export const DEFAULT_STATUS_CONFIG: ProjectStatusConfig = {
  i18nKey: 'portal.status.unknown',
  cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400',
  icon: AlertCircle,
  iconCls: 'text-zinc-400',
  dotCls: 'bg-zinc-400',
  gradient: 'from-zinc-300/20 via-zinc-200/10 to-transparent',
};

export function getStatusConfig(status: string): ProjectStatusConfig {
  return PROJECT_STATUS_CONFIG[status] ?? DEFAULT_STATUS_CONFIG;
}
