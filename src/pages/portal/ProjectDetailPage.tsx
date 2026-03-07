import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ExternalLink,
  QrCode,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  UtensilsCrossed,
  UserCheck,
} from 'lucide-react';
import { usePortalContext } from '@/types/portal';
import { AssetGrid } from '@/components/portal/AssetGrid';
import { Breadcrumb } from '@/components/portal/Breadcrumb';
import { ProjectLifecycleTracker } from '@/components/portal/ProjectLifecycleTracker';
import { AccessBadge } from '@/components/portal/AccessBadge';
import { AuditTrail } from '@/components/portal/AuditTrail';
import { timeAgo } from '@/utils/formatters';
import { getStatusConfig } from '@/constants/status-config';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { projects, assets, role, setEditingProject } = usePortalContext();

  const project = projects.find((p) => p.id === id);
  const projectAssets = assets.filter((a) => a.project_id === id);

  if (!project) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
          {t('portal.projectNotFound', 'Project not found')}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {t('portal.projectNotFoundDesc', 'The project you are looking for does not exist.')}
        </p>
        <Link
          to="../"
          className="text-brand-600 dark:text-brand-400 font-semibold text-sm hover:underline"
        >
          {t('portal.backToProjects', '← Back to projects')}
        </Link>
      </div>
    );
  }

  const statusCfg = getStatusConfig(project.status);
  const StatusIcon = statusCfg.icon;

  return (
    <div className="space-y-6">
      <Breadcrumb overrides={id ? { [id]: project.name } : undefined} />

      {/* Back link + header */}
      <div className="flex items-center gap-4">
        <Link
          to="../"
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          title={t('portal.backToProjects', 'Back to projects')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
            {project.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{project.client}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.cls}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {t(statusCfg.i18nKey)}
          </span>
          <AccessBadge
            visibility={
              project.status === 'delivered' || project.status === 'approved' ? 'customer' : 'team'
            }
            className="ml-2"
          />
        </div>
      </div>

      <ProjectLifecycleTracker currentStatus={project.status} className="mt-6" />

      {/* Project info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Details */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {t('portal.projectDetails', 'Project Details')}
          </h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <UtensilsCrossed className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-700 dark:text-zinc-300">
                {t('portal.dishes', { count: project.items })}
              </span>
            </div>
            {project.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-brand-600 transition-colors"
              >
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span className="truncate">{project.address}</span>
              </a>
            )}
            {project.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">{project.phone}</span>
              </div>
            )}
            {project.assigned_to && (
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">{project.assigned_to}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {t('portal.timeline', 'Timeline')}
          </h2>
          <div className="space-y-2.5">
            {project.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500 dark:text-zinc-400">
                  {t('portal.created', 'Created')}:
                </span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {timeAgo(project.created_at)}
                </span>
              </div>
            )}
            {project.updated_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500 dark:text-zinc-400">
                  {t('portal.updated', 'Updated')}:
                </span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {timeAgo(project.updated_at)}
                </span>
              </div>
            )}
            {project.tier && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-500 dark:text-zinc-400">
                  {t('portal.tier', 'Tier')}:
                </span>
                <span className="text-zinc-700 dark:text-zinc-300 capitalize">{project.tier}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {t('portal.actions', 'Actions')}
          </h2>
          <div className="space-y-2">
            <Link
              to={`/project/${project.id}/menu`}
              className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t('portal.viewMenu', 'View Live Menu')}
            </Link>
            <Link
              to={`/project/${project.id}/menu/edit`}
              className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              {t('portal.editMenu', 'Edit Menu')}
            </Link>
            {role === 'employee' && (
              <button
                onClick={() => setEditingProject(project)}
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <Eye className="w-4 h-4" />
                {t('portal.editProject', 'Edit Project Details')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              {t('portal.assets', 'Assets')}
            </h2>
            <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {projectAssets.length}
            </span>
          </div>
          {projectAssets.length > 0 && role === 'employee' && (
            <Link
              to={`/app/editor/${projectAssets[0].id}`}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors"
            >
              {t('portal.openEditor', 'Open in Editor')}
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
        {projectAssets.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
            {t('portal.noAssetsYet', 'No assets have been added to this project yet.')}
          </div>
        ) : (
          <div className="p-4">
            <AssetGrid assets={projectAssets} role={role} projectId={id} />
          </div>
        )}
      </div>

      <AuditTrail projectId={project.id} className="mt-8" />
    </div>
  );
};

export default ProjectDetailPage;
