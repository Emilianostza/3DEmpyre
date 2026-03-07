import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileUp,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  PlayCircle,
  Truck,
} from 'lucide-react';
import { Asset, Project } from '@/types';
import { timeAgo } from '@/utils/formatters';

// ── Types ───────────────────────────────────────────────────────

interface Activity {
  id: string;
  type: 'upload' | 'status' | 'published' | 'processing' | 'delivered' | 'alert';
  actor: { name: string; initials: string };
  message: string;
  detail: string;
  time: string;
  icon: React.ElementType;
  bgColor: string;
  accentColor: string;
  badge: string;
  actionable: boolean;
}

interface ActivityFeedProps {
  projects?: Project[];
  assets?: Asset[];
}

// ── Helpers ─────────────────────────────────────────────────────

/** Format file size in human-readable format */
function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

/** Get initials from project client name */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ── Component ───────────────────────────────────────────────────

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ projects = [], assets = [] }) => {
  const { t } = useTranslation();
  const activities = useMemo<Activity[]>(() => {
    const items: Activity[] = [];

    // Generate activities from assets
    assets.forEach((asset) => {
      const project = projects.find((p) => p.id === asset.project_id);
      const clientName = project?.client || 'Unknown Client';

      if (asset.status === 'Published' && asset.updated_at) {
        items.push({
          id: `pub-${asset.id}`,
          type: 'published',
          actor: { name: clientName, initials: getInitials(clientName) },
          message: `"${asset.name}" ${t('activityFeed.publishedAndLive')}`,
          detail: project ? `${t('activityFeed.project')}: ${project.name}` : '',
          time: asset.updated_at,
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          accentColor: 'text-green-600 dark:text-green-400',
          badge: t('activityFeed.badgePublished'),
          actionable: false,
        });
      } else if (asset.status === 'In Review' && asset.updated_at) {
        items.push({
          id: `rev-${asset.id}`,
          type: 'upload',
          actor: { name: clientName, initials: getInitials(clientName) },
          message: `"${asset.name}" ${t('activityFeed.submittedForReview')}`,
          detail: asset.file_size ? formatSize(asset.file_size) : '',
          time: asset.updated_at,
          icon: FileUp,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          accentColor: 'text-blue-600 dark:text-blue-400',
          badge: t('activityFeed.badgeReview'),
          actionable: true,
        });
      } else if (asset.status === 'Processing' && asset.updated_at) {
        items.push({
          id: `proc-${asset.id}`,
          type: 'processing',
          actor: { name: 'System', initials: 'SY' },
          message: `${t('activityFeed.processing')} "${asset.name}"`,
          detail: asset.file_size
            ? `${formatSize(asset.file_size)} ${t('activityFeed.uploaded')}`
            : t('activityFeed.inProgress'),
          time: asset.updated_at,
          icon: PlayCircle,
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          accentColor: 'text-purple-600 dark:text-purple-400',
          badge: t('activityFeed.badgeProcessing'),
          actionable: false,
        });
      }
    });

    // Generate activities from project status changes
    projects.forEach((project) => {
      if (project.status === 'delivered' && project.updated_at) {
        items.push({
          id: `del-${project.id}`,
          type: 'delivered',
          actor: { name: project.client, initials: getInitials(project.client) },
          message: `"${project.name}" ${t('activityFeed.deliveredTo')} ${project.client}`,
          detail: `${project.items} ${t('activityFeed.items')}`,
          time: project.updated_at,
          icon: Truck,
          bgColor: 'bg-teal-50 dark:bg-teal-900/20',
          accentColor: 'text-teal-600 dark:text-teal-400',
          badge: t('activityFeed.badgeDelivered'),
          actionable: false,
        });
      } else if (project.status === 'pending' && project.created_at) {
        items.push({
          id: `new-${project.id}`,
          type: 'status',
          actor: { name: project.client, initials: getInitials(project.client) },
          message: `${t('activityFeed.newProjectRequest')}: "${project.name}"`,
          detail: `${project.items} ${t('activityFeed.itemsRequested')}`,
          time: project.created_at,
          icon: Package,
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          accentColor: 'text-orange-600 dark:text-orange-400',
          badge: t('activityFeed.badgeNewRequest'),
          actionable: true,
        });
      } else if (project.status === 'rejected' && project.updated_at) {
        items.push({
          id: `rej-${project.id}`,
          type: 'alert',
          actor: { name: 'System', initials: 'SY' },
          message: `"${project.name}" ${t('activityFeed.rejected')}`,
          detail: project.rejection_reason || t('activityFeed.needsRevision'),
          time: project.updated_at,
          icon: AlertCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          accentColor: 'text-red-600 dark:text-red-400',
          badge: t('activityFeed.badgeAttention'),
          actionable: true,
        });
      } else if (project.status === 'qa' && project.updated_at) {
        items.push({
          id: `qa-${project.id}`,
          type: 'status',
          actor: { name: project.client, initials: getInitials(project.client) },
          message: `"${project.name}" ${t('activityFeed.movedToQA')}`,
          detail: t('activityFeed.awaitingApproval'),
          time: project.updated_at,
          icon: MessageSquare,
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          accentColor: 'text-amber-600 dark:text-amber-400',
          badge: t('activityFeed.badgeQAReview'),
          actionable: true,
        });
      }
    });

    // Sort by time descending and take top 8
    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [projects, assets]);

  return (
    <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-2xl p-6 rounded-xl shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 ring-1 ring-white/50 dark:ring-white/10 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-serif-premium font-bold text-zinc-900 dark:text-white">
            {t('activityFeed.recentActivity')}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('activityFeed.subtitle')}
          </p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          {activities.length} {t('activityFeed.updates')}
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {t('activityFeed.noRecentActivity')}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {t('activityFeed.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4 rounded-lg border transition-colors ${activity.bgColor} border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 ${activity.actionable ? 'ring-1 ring-yellow-400/50' : ''
                }`}
            >
              {/* Actor Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${activity.accentColor} ${activity.bgColor} md:order-none order-2`}
              >
                {activity.actor.initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 md:order-none order-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-2 mb-1">
                  <div className="flex flex-wrap items-center gap-1 md:gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                      {activity.actor.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${activity.accentColor} ${activity.bgColor}`}
                    >
                      {activity.badge}
                    </span>
                  </div>
                  {activity.actionable && (
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
                      <Clock className="w-3 h-3" /> {t('activityFeed.actionNeeded')}
                    </div>
                  )}
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-300 leading-snug">
                  {activity.message}
                </p>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 md:gap-2 mt-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{activity.detail}</p>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 md:whitespace-nowrap">
                    {timeAgo(activity.time)}
                  </span>
                </div>
              </div>

              {/* Action Icon */}
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${activity.accentColor} md:order-none order-3`}
              >
                <activity.icon className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="mt-6 w-full py-2 px-3 text-center text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-800">
        {t('activityFeed.viewFullLog')}
      </button>
    </div>
  );
};
