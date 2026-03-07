import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Image,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Project, Asset } from '@/types';
import { ProjectStatus } from '@/types/domain';
import { placeholder } from '@/config/site';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QAReviewPanelProps {
  projects: Project[];
  assets: Asset[];
  onApprove: (projectId: string) => void;
  onReject: (projectId: string, reason: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QA_CHECKLIST_KEYS = [
  'modelGeometry',
  'texturesMapped',
  'fileSizeWithinLimits',
  'correctScaleOrientation',
  'noArtifacts',
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeInQA(isoDate: string | undefined): string {
  if (!isoDate) return 'Unknown';
  const diff = Date.now() - new Date(isoDate).getTime();
  if (isNaN(diff) || diff < 0) return 'Just now';
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return 'Just now';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const QAReviewPanel: React.FC<QAReviewPanelProps> = ({
  projects,
  assets,
  onApprove,
  onReject,
}) => {
  const { t } = useTranslation();
  // Track which project card has the rejection form open
  const [rejectingProjectId, setRejectingProjectId] = useState<string | null>(null);
  // Track rejection reason text per project
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  // Filter to only QA-status projects
  const qaProjects = useMemo(
    () => projects.filter((p) => p.status === ProjectStatus.QA),
    [projects]
  );

  // Build a map of project_id -> assets for quick lookup
  const assetsByProject = useMemo(() => {
    const map: Record<string, Asset[]> = {};
    for (const asset of assets) {
      if (asset.project_id) {
        if (!map[asset.project_id]) {
          map[asset.project_id] = [];
        }
        map[asset.project_id].push(asset);
      }
    }
    return map;
  }, [assets]);

  // Handlers
  const handleApprove = (projectId: string) => {
    onApprove(projectId);
  };

  const handleOpenRejectForm = (projectId: string) => {
    setRejectingProjectId((prev) => (prev === projectId ? null : projectId));
  };

  const handleSubmitRejection = (projectId: string) => {
    const reason = (rejectionReasons[projectId] || '').trim();
    if (!reason) return;
    onReject(projectId, reason);
    // Reset state for this card
    setRejectingProjectId(null);
    setRejectionReasons((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
  };

  const handleReasonChange = (projectId: string, value: string) => {
    setRejectionReasons((prev) => ({ ...prev, [projectId]: value }));
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-amber-500" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {t('qaReview.qualityReviewQueue')}
        </h2>
        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
          {qaProjects.length}
        </span>
      </div>

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {qaProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
            {t('qaReview.allClear')}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
            {t('qaReview.emptyDescription')}
          </p>
        </div>
      ) : (
        /* ── QA Project Cards ──────────────────────────────────────── */
        <div className="space-y-4">
          {qaProjects.map((project) => {
            const projectAssets = assetsByProject[project.id] || [];
            const isRejecting = rejectingProjectId === project.id;
            const rejectionReason = rejectionReasons[project.id] || '';

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-shadow hover:shadow-lg"
              >
                {/* Card body */}
                <div className="p-6">
                  {/* Project header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {project.client}
                      </p>
                    </div>

                    {/* Time in QA badge */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {timeInQA(project.updated_at)} {t('qaReview.inQA')}
                    </div>
                  </div>

                  {/* Meta row: asset count, thumbnails, assigned tech */}
                  <div className="flex flex-wrap items-center gap-4 mb-5">
                    {/* Asset count */}
                    <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      <Image className="w-4 h-4" />
                      <span>
                        {projectAssets.length} asset{projectAssets.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Thumbnail strip (first 4) */}
                    {projectAssets.length > 0 && (
                      <div className="flex -space-x-2">
                        {projectAssets.slice(0, 4).map((asset) => (
                          <img
                            key={asset.id}
                            src={asset.thumb || placeholder(40, 40, asset.name.charAt(0))}
                            alt={asset.name}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 object-cover bg-zinc-100 dark:bg-zinc-800"
                            loading="lazy"
                            width={32}
                            height={32}
                          />
                        ))}
                        {projectAssets.length > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                              +{projectAssets.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assigned technician */}
                    {project.assigned_to && (
                      <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                        <User className="w-4 h-4" />
                        <span className="truncate max-w-[140px]">{project.assigned_to}</span>
                      </div>
                    )}
                  </div>

                  {/* ── QA Checklist ──────────────────────────────────────── */}
                  <div className="mb-5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                      {t('qaReview.qaChecklist')}
                    </p>
                    <ul className="space-y-2">
                      {QA_CHECKLIST_KEYS.map((key) => (
                        <li
                          key={key}
                          className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          {t(`qaReview.checklist_${key}`)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ── Action Buttons ────────────────────────────────────── */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(project.id)}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {t('qaReview.approve')}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenRejectForm(project.id)}
                      className={`inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                        isRejecting
                          ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      {isRejecting ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          {t('qaReview.cancel')}
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="w-4 h-4" />
                          {t('qaReview.reject')}
                        </>
                      )}
                    </button>
                  </div>

                  {/* ── Inline Rejection Form ────────────────────────────── */}
                  {isRejecting && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => handleReasonChange(project.id, e.target.value)}
                        placeholder={t('qaReview.rejectionPlaceholder')}
                        rows={3}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmitRejection(project.id)}
                        disabled={!rejectionReason.trim()}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        {t('qaReview.submitRejection')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
