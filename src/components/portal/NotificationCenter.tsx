import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Package,
  FileUp,
  Truck,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { Asset, Project } from '@/types';
import { timeAgo } from '@/utils/formatters';

// ── Types ───────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'action';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

interface NotificationCenterProps {
  projects: Project[];
  assets: Asset[];
}

// ── Component ───────────────────────────────────────────────────

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ projects, assets }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];

    // Generate notifications from projects
    projects.forEach((project) => {
      if (project.status === 'delivered' && project.updated_at) {
        items.push({
          id: `notif-del-${project.id}`,
          type: 'success',
          title: t('notifications.projectDelivered'),
          message: t('notifications.deliveredMessage', { name: project.name, client: project.client }),
          time: project.updated_at,
          read: false,
          icon: Truck,
          iconBg: 'bg-teal-100 dark:bg-teal-900/30',
          iconColor: 'text-teal-600 dark:text-teal-400',
        });
      } else if (project.status === 'pending' && project.created_at) {
        items.push({
          id: `notif-new-${project.id}`,
          type: 'action',
          title: t('notifications.newProjectRequest'),
          message: t('notifications.newRequestMessage', { client: project.client, name: project.name, count: project.items }),
          time: project.created_at,
          read: false,
          icon: Package,
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          iconColor: 'text-orange-600 dark:text-orange-400',
        });
      } else if (project.status === 'rejected' && project.updated_at) {
        items.push({
          id: `notif-rej-${project.id}`,
          type: 'warning',
          title: t('notifications.projectRejected'),
          message: t('notifications.rejectedMessage', { name: project.name, reason: project.rejection_reason || t('notifications.noReason', 'No reason given') }),
          time: project.updated_at,
          read: false,
          icon: AlertCircle,
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
        });
      } else if (project.status === 'qa' && project.updated_at) {
        items.push({
          id: `notif-qa-${project.id}`,
          type: 'info',
          title: t('notifications.qaReviewReady'),
          message: t('notifications.qaMessage', { name: project.name }),
          time: project.updated_at,
          read: false,
          icon: MessageSquare,
          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
          iconColor: 'text-amber-600 dark:text-amber-400',
        });
      }
    });

    // Generate notifications from assets
    assets.forEach((asset) => {
      const project = projects.find((p) => p.id === asset.project_id);
      if (asset.status === 'Published' && asset.updated_at) {
        items.push({
          id: `notif-pub-${asset.id}`,
          type: 'success',
          title: t('notifications.assetPublished'),
          message: project
            ? t('notifications.publishedInProject', { asset: asset.name, project: project.name })
            : t('notifications.publishedMessage', { asset: asset.name }),
          time: asset.updated_at,
          read: false,
          icon: CheckCircle,
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          iconColor: 'text-green-600 dark:text-green-400',
        });
      } else if (asset.status === 'In Review' && asset.updated_at) {
        items.push({
          id: `notif-rev-${asset.id}`,
          type: 'action',
          title: t('notifications.reviewRequired'),
          message: t('notifications.reviewMessage', { asset: asset.name }),
          time: asset.updated_at,
          read: false,
          icon: FileUp,
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
        });
      }
    });

    // Add system notifications
    items.push({
      id: 'notif-sys-welcome',
      type: 'info',
      title: t('notifications.systemUpdate'),
      message: t('notifications.dashboardUpgraded'),
      time: new Date(Date.now() - 2 * 86400000).toISOString(),
      read: false,
      icon: Settings,
      iconBg: 'bg-zinc-100 dark:bg-zinc-800',
      iconColor: 'text-zinc-500 dark:text-zinc-400',
    });

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 12);
  }, [projects, assets]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const markRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label={unreadCount > 0 ? t('notifications.bellUnread', { count: unreadCount }) : t('notifications.title')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {t('notifications.title')}
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                  {unreadCount} {t('notifications.new')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 px-2 py-1 rounded transition-colors"
                >
                  {t('notifications.markAllRead')}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label={t('notifications.close', 'Close notifications')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {t('notifications.noNotifications')}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  {t('notifications.allCaughtUp')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                {notifications.map((notif) => {
                  const isRead = readIds.has(notif.id);
                  const Icon = notif.icon;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`w-full text-left flex gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                        isRead ? 'opacity-60' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.iconBg}`}
                      >
                        <Icon className={`w-4 h-4 ${notif.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm font-medium truncate ${
                              isRead
                                ? 'text-zinc-500 dark:text-zinc-400'
                                : 'text-zinc-900 dark:text-white'
                            }`}
                          >
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                            {timeAgo(notif.time)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      {!isRead && (
                        <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
            <button className="w-full text-center text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 py-1 rounded transition-colors">
              {t('notifications.viewAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
