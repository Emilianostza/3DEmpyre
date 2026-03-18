import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  QrCode,
  Share2,
  Pencil,
  Plus,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  Clock,
  Eye,
} from 'lucide-react';
import { usePortalContext } from '@/types/portal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ProjectCards } from '@/components/portal/ProjectCards';
import { QRCodeModal } from '@/components/portal/QRCodeModal';
import { StatCard } from '@/components/portal/StatCard';
import { SectionHeader } from '@/components/portal/SectionHeader';

const CustomerDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projects, assets, setEditingProject, setIsModalOpen, setModalMode } = usePortalContext();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [qrAsset, setQrAsset] = useState<(typeof assets)[0] | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const kpiValues = {
    activeProjects: projects.filter((p) => !['archived', 'delivered'].includes(p.status)).length,
    inReview: assets.filter((a) => a.status === 'In Review').length,
    published: assets.filter((a) => a.status === 'Published').length,
  };

  const primaryProject = projects[0];
  const menuUrl = primaryProject
    ? `${window.location.origin}/project/${primaryProject.id}/menu`
    : null;

  const handleCopyMenuUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      addToast(t('portal.menuUrlCopied', 'Menu link copied!'), 'success');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      addToast(t('portal.copyFailed', 'Copy failed'), 'error');
    }
  };

  const handleShareMenu = async () => {
    if (!menuUrl || !primaryProject) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: primaryProject.name, url: menuUrl });
      } catch {
        // User cancelled
      }
    } else {
      await handleCopyMenuUrl(menuUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Welcome ── */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          {t('portal.welcomeBack', 'Welcome back,')}{' '}
          <span className="text-brand-600 dark:text-brand-400">
            {user?.name || t('portal.bistroOwner', 'there')}
          </span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {t('portal.dashboardSubtitle', "Here's an overview of your menu and projects.")}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label={t('portal.industry.restaurant.kpi.active', 'Active Projects')}
          value={kpiValues.activeProjects}
          icon={BookOpen}
          color="brand"
        />
        <StatCard
          label={t('portal.industry.restaurant.kpi.inReview', 'In Review')}
          value={kpiValues.inReview}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label={t('portal.industry.restaurant.kpi.live', 'Published')}
          value={kpiValues.published}
          icon={Eye}
          color="emerald"
        />
      </div>

      {/* ── Two Column Layout ── */}
      <div className="space-y-6">
          {/* Quick Actions */}
          {primaryProject && (
            <div>
              <SectionHeader title={t('portal.quickActions', 'Quick Actions')} />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const firstPublished = assets.find(
                      (a) => a.project_id === primaryProject.id && a.status === 'Published'
                    );
                    if (firstPublished) {
                      setQrAsset(firstPublished);
                    } else {
                      addToast(t('portal.noPublishedAssets', 'No published assets for QR code'), 'info');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-brand-500/30 hover:shadow-sm transition-all"
                >
                  <QrCode className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  {t('portal.quickAction.qr', 'Generate QR')}
                </button>
                <button
                  onClick={handleShareMenu}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-emerald-500/30 hover:shadow-sm transition-all"
                >
                  <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t('portal.quickAction.share', 'Share Menu')}
                </button>
                <button
                  onClick={() => navigate(`/project/${primaryProject.id}/menu/edit`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-sky-500/30 hover:shadow-sm transition-all"
                >
                  <Pencil className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  {t('portal.quickAction.edit', 'Edit Menu')}
                </button>
                <Link
                  to="/request"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-amber-500/30 hover:shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  {t('portal.quickAction.newCapture', 'Get a Free Quote')}
                </Link>
              </div>
            </div>
          )}

          {/* Menu Preview Card */}
          {menuUrl && primaryProject && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
                    {t('portal.liveMenu', 'Live Menu')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={menuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline truncate max-w-[300px]"
                    >
                      {menuUrl}
                    </a>
                    <ExternalLink className="w-3 h-3 text-brand-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                    {assets.filter((a) => a.project_id === primaryProject.id && a.status === 'Published').length}{' '}
                    {t('portal.liveMenuItems', 'live menu items')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleCopyMenuUrl(menuUrl)}
                    className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title={t('portal.copyLink', 'Copy link')}
                  >
                    {copiedUrl === menuUrl ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors"
                  >
                    {t('portal.viewMenu', 'View Menu')}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Project Cards */}
          <div>
            <SectionHeader
              title={t('portal.projects', 'Projects')}
              action={
                projects.length > 4 ? (
                  <Link to="projects" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">
                    {t('portal.viewAll', 'View All')}
                  </Link>
                ) : undefined
              }
            />
            <ProjectCards
              projects={projects.slice(0, 2)}
              assets={assets}
              onEditProject={(projectId) => {
                const project = projects.find((p) => p.id === projectId);
                if (project) setEditingProject(project);
              }}
              onCreateMenu={() => { setModalMode('menu'); setIsModalOpen(true); }}
            />
          </div>
      </div>

      {/* QR Code Modal */}
      {qrAsset && (
        <QRCodeModal isOpen={Boolean(qrAsset)} onClose={() => setQrAsset(null)} asset={qrAsset} />
      )}
    </div>
  );
};

export default CustomerDashboardPage;
