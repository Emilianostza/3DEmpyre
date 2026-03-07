import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Camera, LifeBuoy, Box, LayoutDashboard, CreditCard, Settings as SettingsIcon, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Asset, Project } from '@/types';
import type { PortalOutletContext } from '@/types/portal';
import { NewProjectModal } from '@/components/portal/NewProjectModal';
import { ProjectsProvider, AssetsProvider } from '@/services/dataProvider';
import DarkModeToggle from '@/components/DarkModeToggle';
import { PortalLoadingSkeleton } from '@/components/portal/PortalLoadingSkeleton';
import { UpgradePlanModal } from '@/components/portal/UpgradePlanModal';
import { NotificationCenter } from '@/components/portal/NotificationCenter';
import { AssignTechnicianModal } from '@/components/portal/AssignTechnicianModal';
import { useAuth } from '@/contexts/AuthContext';
import { getPortalConfig } from '@/constants/portal-configs';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SEO } from '@/components/common/SEO';
import { pageVariants } from '@/components/motion/presets';
import { announceToScreenReader } from '@/utils/a11y';

const PortalLayout: React.FC<{ role: 'employee' | 'customer' }> = ({ role }) => {
  const { logout, organization } = useAuth();
  const portalConfig = getPortalConfig(organization?.industry);
  const { success } = useToast();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Re-apply portal theme preference when entering the authenticated area
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [assigningProject, setAssigningProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuSettingsMap, setMenuSettingsMap] = useState<
    Record<string, { title: string; brandColor: string; font: string; showPrices: boolean; currency: string }>
  >({});

  const handleCreateProject = useCallback(
    async (data: {
      name: string;
      client: string;
      type?: string;
      address?: string;
      phone?: string;
    }) => {
      try {
        await ProjectsProvider.create({ ...data, type: 'standard' });
        const projData = await ProjectsProvider.list();
        setProjects(projData as Project[]);
        navigate('projects');
      } catch (err) {
        if (import.meta.env.DEV) console.error('Failed to create project', err);
      }
    },
    [navigate]
  );

  const handleUpdateProject = useCallback(async (id: string, data: Partial<Project>) => {
    try {
      await ProjectsProvider.update(id, data);
      const projData = await ProjectsProvider.list();
      setProjects(projData as Project[]);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to update project', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const [projData, assetData] = await Promise.all([
        ProjectsProvider.list(),
        AssetsProvider.list(),
      ]);
      setProjects(projData as Project[]);
      setAssets(assetData as Asset[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load portal data';
      if (import.meta.env.DEV) console.error('Failed to fetch data', err);
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setError(null);
        const [projData, assetData] = await Promise.all([
          ProjectsProvider.list(),
          AssetsProvider.list(),
        ]);
        if (!cancelled) {
          setProjects(projData as Project[]);
          setAssets(assetData as Asset[]);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load portal data';
          if (import.meta.env.DEV) console.error('Failed to fetch data', err);
          setError(errorMessage);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/app/login');
  };

  // Navigation items with route paths
  const navItems = [
    { path: 'dashboard', label: t('portal.tab.dashboard') },
    { path: 'projects', label: t('portal.tab.projects') },
    ...(role === 'employee' ? [{ path: 'pipeline', label: t('portal.tab.pipeline', '3D Pipeline') }] : []),
    ...(role === 'customer' ? [{ path: 'billing', label: t('portal.tab.billing') }] : []),
    { path: 'settings', label: t('portal.tab.settings') },
  ];

  // Derive page title from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentSection = pathSegments[pathSegments.length - 1] ?? 'dashboard';
  const sectionLabel = t(`portal.tab.${currentSection}`, currentSection.charAt(0).toUpperCase() + currentSection.slice(1));
  const pageTitle = `${sectionLabel} | ${t('portal.tab.dashboard')}`;

  // Check if a nav item is active based on current path
  const isNavActive = (navPath: string) => {
    const basePath = role === 'customer' ? '/portal' : '/app';
    const fullNavPath = `${basePath}/${navPath}`;
    return location.pathname === fullNavPath || location.pathname.startsWith(`${fullNavPath}/`);
  };

  // Outlet context for child routes
  const outletContext: PortalOutletContext = {
    role,
    projects,
    assets,
    loading,
    error,
    handleCreateProject,
    handleUpdateProject,
    refreshData,
    setEditingProject,
    setAssigningProject,
    setIsModalOpen,
    setShowUpgradePlanModal,
    announce: announceToScreenReader,
  };

  if (loading) return <PortalLoadingSkeleton />;

  return (
    <div
      className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'Portal Layout',
        'data-file': 'src/pages/portal/PortalLayout.tsx',
      })}
    >
      <SEO title={pageTitle} description="Manage your 3D assets and projects." />
      {/* Skip to content — accessibility */}
      <a
        href="#portal-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-brand-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        {t('nav.skipToContent', 'Skip to content')}
      </a>
      <NewProjectModal
        isOpen={isModalOpen || Boolean(editingProject)}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={async (data) => {
          if (editingProject) {
            await handleUpdateProject(editingProject.id, data);
            setEditingProject(null);
          } else {
            await handleCreateProject(data);
            setIsModalOpen(false);
          }
        }}
        menuSettings={editingProject ? menuSettingsMap[editingProject.id] : undefined}
        onSaveMenuSettings={
          editingProject
            ? (s) => setMenuSettingsMap((prev) => ({ ...prev, [editingProject.id]: s }))
            : undefined
        }
      />
      <AssignTechnicianModal
        isOpen={Boolean(assigningProject)}
        project={assigningProject}
        onClose={() => setAssigningProject(null)}
        onAssign={async (projectId, technicianId, _scheduledDate) => {
          await handleUpdateProject(projectId, {
            assigned_to: technicianId,
            status: 'assigned' as Project['status'],
          });
          success(t('portal.toast.techAssigned', { name: assigningProject?.name ?? 'project' }));
          setAssigningProject(null);
        }}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-sm">
              <Box className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            {role === 'customer' ? (
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-md ${portalConfig.theme.accentBg} ${portalConfig.theme.accentBgDark} flex items-center justify-center`}
                >
                  {React.createElement(portalConfig.theme.iconComponent, {
                    className: `w-3.5 h-3.5 ${portalConfig.theme.accentText} ${portalConfig.theme.accentTextDark}`,
                  })}
                </div>
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white text-sm leading-tight">
                    {t(portalConfig.labels.welcome)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:block">
                <div className="font-bold text-zinc-900 dark:text-white text-base leading-tight">
                  3D <span className="text-brand-600 dark:text-brand-400">Empyre</span>
                </div>
                <div className="text-xs leading-tight">
                  {t('portal.welcomeBack')}{' '}
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">
                    {t('portal.bistroOwner')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Nav Tabs — now use NavLink for URL-based routing */}
          <nav className="hidden sm:flex items-center gap-1 flex-1 justify-center overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === 'dashboard'}
                className={() => {
                  const active = isNavActive(item.path);
                  return `px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 focus:outline-none ${active
                      ? role === 'customer'
                        ? `${portalConfig.theme.accentBg} ${portalConfig.theme.accentBgDark} ${portalConfig.theme.accentText} ${portalConfig.theme.accentTextDark}`
                        : 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`;
                }}
                {...(isNavActive(item.path) ? { 'aria-current': 'page' as const } : {})}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {/* Spacer for mobile when nav is hidden */}
          <div className="flex-1 sm:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {role === 'customer' && (
              <>
                <Link
                  to="/request"
                  className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cta.getQuote')}</span>
                </Link>
                <button
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                  title={t('portal.help')}
                  aria-label={t('portal.help')}
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span>{t('portal.help')}</span>
                </button>
              </>
            )}
            {role === 'employee' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('portal.newMenu')}</span>
              </button>
            )}
            <NotificationCenter projects={projects} assets={assets} />
            <DarkModeToggle />
            <button
              onClick={handleLogout}
              title={t('portal.signOut')}
              aria-label={t('portal.signOut')}
              className="p-2 rounded-lg text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="portal-main-content" className="flex-1 p-6 md:p-8 pb-20 sm:pb-8 max-w-screen-xl mx-auto w-full">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  {t('portal.errorLoading')}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:opacity-70 transition-opacity"
                >
                  {t('portal.reloadPage')}
                </button>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 p-1 rounded-md text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                aria-label={t('portal.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <Suspense fallback={<PortalLoadingSkeleton />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={prefersReducedMotion ? undefined : pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet context={outletContext} />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradePlanModal}
        onClose={() => setShowUpgradePlanModal(false)}
      />

      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 safe-area-pb">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const active = isNavActive(item.path);
            const iconMap: Record<string, React.ElementType> = {
              dashboard: LayoutDashboard,
              billing: CreditCard,
              settings: SettingsIcon,
              customers: Box,
              pipeline: Box,
            };
            const Icon = iconMap[item.path] ?? Box;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === 'dashboard'}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  active
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
                {...(active ? { 'aria-current': 'page' as const } : {})}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Screen reader live region for dynamic announcements */}
      <div id="portal-status-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  );
};

export default PortalLayout;
