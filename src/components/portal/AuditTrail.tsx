import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, UserCheck, RefreshCw, FileUp, Eye, Truck, Shield, Clock } from 'lucide-react';
import { timeAgo, getInitials } from '@/utils/formatters';

// ── Types ───────────────────────────────────────────────────────

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
}

interface AuditTrailProps {
  projectId: string;
  className?: string;
}

// ── Mock Data Generator ─────────────────────────────────────────

function generateMockAudit(projectId: string): AuditEntry[] {
  const now = Date.now();
  const hour = 3_600_000;
  const day = 86_400_000;

  return [
    {
      id: `${projectId}-1`,
      action: 'Project created',
      actor: 'Admin User',
      timestamp: new Date(now - 14 * day).toISOString(),
      icon: Plus,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: `${projectId}-2`,
      action: 'Technician assigned',
      actor: 'Admin User',
      timestamp: new Date(now - 12 * day).toISOString(),
      icon: UserCheck,
      color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20',
    },
    {
      id: `${projectId}-3`,
      action: 'Status changed to Processing',
      actor: 'System',
      timestamp: new Date(now - 8 * day).toISOString(),
      icon: RefreshCw,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    },
    {
      id: `${projectId}-4`,
      action: 'Asset uploaded',
      actor: 'Tech User',
      timestamp: new Date(now - 5 * day - 4 * hour).toISOString(),
      icon: FileUp,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20',
    },
    {
      id: `${projectId}-5`,
      action: 'Moved to QA review',
      actor: 'Tech User',
      timestamp: new Date(now - 3 * day).toISOString(),
      icon: Shield,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    },
    {
      id: `${projectId}-6`,
      action: 'Customer viewed project',
      actor: 'Client',
      timestamp: new Date(now - day - 6 * hour).toISOString(),
      icon: Eye,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      id: `${projectId}-7`,
      action: 'Delivered to customer',
      actor: 'Admin User',
      timestamp: new Date(now - 8 * hour).toISOString(),
      icon: Truck,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20',
    },
  ];
}

// ── Component ───────────────────────────────────────────────────

export const AuditTrail: React.FC<AuditTrailProps> = ({ projectId, className = '' }) => {
  const { t } = useTranslation();
  const entries = useMemo(() => generateMockAudit(projectId), [projectId]);

  return (
    <section
      aria-label={t('audit.label', 'Activity history')}
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          </div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            {t('audit.title', 'Activity & History')}
          </h2>
          <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            {entries.length}
          </span>
        </div>
      </div>

      {/* Timeline */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-600">
          <Clock className="w-6 h-6 mb-2 opacity-40" />
          <span className="text-sm">{t('audit.noActivity', 'No activity recorded yet')}</span>
        </div>
      ) : (
        <div className="relative px-5 py-4">
          {/* Vertical timeline line */}
          <div
            className="absolute left-9 top-4 bottom-4 w-px bg-zinc-200 dark:bg-zinc-700"
            aria-hidden="true"
          />

          <div className="space-y-4">
            {entries.map((entry) => {
              const Icon = entry.icon;
              const initials = getInitials(entry.actor);

              return (
                <div key={entry.id} className="flex items-start gap-3 relative">
                  {/* Timeline dot */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${entry.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-zinc-900 dark:text-white font-medium">
                      {entry.action}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {entry.actor}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-600" aria-hidden="true">
                        &middot;
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {timeAgo(entry.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Actor avatar */}
                  <div className="hidden md:flex w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                      {initials}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
