import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, Crown, Layers, Eye, FolderOpen } from 'lucide-react';
import { usePortalContext } from '@/types/portal';
import { ProjectCards } from '@/components/portal/ProjectCards';
const CustomerDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { projects, assets, setEditingProject } = usePortalContext();
  const [showCustomerAnalytics, setShowCustomerAnalytics] = useState(false);

  const totalAssets = assets.length;
  const totalViews = assets.reduce((sum, a) => sum + (a.viewCount ?? 0), 0);
  const activeProjects = projects.filter((p) => !['archived', 'delivered'].includes(p.status)).length;

  return (
    <div className="space-y-8">
      {/* Welcome strip with quick stats */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          {t('portal.tab.dashboard')}
        </h1>
        <div className="flex items-center gap-6 mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{activeProjects}</span>{' '}
            {t('portal.activeProjects', 'active')}
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalAssets}</span>{' '}
            {t('portal.totalAssets', 'assets')}
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalViews.toLocaleString()}</span>{' '}
            {t('portal.totalViews', 'views')}
          </div>
        </div>
      </div>

      {/* Analytics Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowCustomerAnalytics(!showCustomerAnalytics)}
          className="w-full flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-200/50 dark:border-white/5 hover:border-brand-500/30 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-brand-500/5 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center shadow-inner border border-brand-200/50 dark:border-brand-700/30 group-hover:scale-105 transition-transform duration-300">
              <BarChart3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {t('portal.analytics.title', 'Analytics Dashboard')}
                <Crown className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {t('portal.analytics.subtitle', 'Premium feature - Upgrade to unlock')}
              </p>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 ${
              showCustomerAnalytics ? 'rotate-180 bg-brand-50 dark:bg-brand-900/30' : ''
            }`}
          >
            <svg
              className={`w-5 h-5 transition-colors ${showCustomerAnalytics ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-400 group-hover:text-brand-600 dark:group-hover:text-brand-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showCustomerAnalytics && (
          <div className="mt-4 rounded-3xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 relative border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl shadow-zinc-900/10 dark:shadow-black/40">
            {/* Deep Glassmorphic Panel Background */}
            <div className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl" />

            {/* Subtle Gradient Glows */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative px-8 py-12 flex flex-col items-center text-center">
              {/* Decorative chart bars (Refined) */}
              <div className="flex items-end gap-2 mb-8 opacity-60 dark:opacity-40">
                {[28, 44, 36, 56, 48, 64, 52, 72, 60].map((h, i) => (
                  <div key={i} className="w-3.5 rounded-t-sm bg-gradient-to-t from-zinc-200 to-zinc-400 dark:from-zinc-800 dark:to-zinc-600" style={{ height: h }} />
                ))}
              </div>

              {/* Icon Container with Gold Accents */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/10 border border-amber-200/50 dark:border-amber-700/30 flex items-center justify-center shadow-inner">
                  <BarChart3 className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>

              <h2 className="text-2xl font-serif-premium font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
                {t('portal.analytics.locked', 'Analytics Locked')}
              </h2>
              <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 font-sans-premium">
                {t(
                  'portal.analytics.lockedDesc',
                  'Upgrade your plan to unlock detailed analytics and gain deeper insights into your 3D asset performance.'
                )}
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8">
                 <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {t('portal.analytics.price', '€10')}
                 </span>
                 <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                  / {t('portal.billing.perMonth', 'month')}
                 </span>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to="/pricing"
                  className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 active:scale-100"
                >
                  <Crown className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
                  {t('portal.analytics.upgrade', 'Upgrade Plan')}
                </Link>
                <button
                  onClick={() => setShowCustomerAnalytics(false)}
                  className="px-8 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition-all"
                >
                  {t('portal.analytics.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProjectCards
        projects={projects.slice(0, 4)}
        assets={assets}
        onEditProject={(projectId) => {
          const project = projects.find((p) => p.id === projectId);
          if (project) setEditingProject(project);
        }}
      />
    </div>
  );
};

export default CustomerDashboardPage;
