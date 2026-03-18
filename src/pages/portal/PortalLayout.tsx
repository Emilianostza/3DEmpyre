import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  X,
  LayoutDashboard,
  UtensilsCrossed,
  Paintbrush,
  Settings as SettingsIcon,
  FolderOpen,
  Box,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Asset, Project } from '@/types';
import type { PortalOutletContext } from '@/types/portal';
import { NewProjectModal } from '@/components/portal/NewProjectModal';
import { ProjectsProvider, AssetsProvider } from '@/services/dataProvider';
import { PortalLoadingSkeleton } from '@/components/portal/PortalLoadingSkeleton';
import { UpgradePlanModal } from '@/components/portal/UpgradePlanModal';
import { AssignTechnicianModal } from '@/components/portal/AssignTechnicianModal';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { PortalTopBar } from '@/components/portal/PortalTopBar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SEO } from '@/components/common/SEO';
import { pageVariants } from '@/components/motion/presets';
import { announceToScreenReader } from '@/utils/a11y';
import { useSidebarState } from '@/hooks/useSidebarState';

const PortalLayout: React.FC<{ role: 'employee' | 'customer' }> = ({ role }) => {
  const { logout, organization, user } = useAuth();
  const { success, error: showError } = useToast();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { collapsed, toggle, isMobileOpen, openMobile, closeMobile } = useSidebarState();

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
  const [modalMode, setModalMode] = useState<'project' | 'menu'>('project');
  const [menuSettingsMap, setMenuSettingsMap] = useState<
    Record<string, { title: string; brandColor: string; font: string; showPrices: boolean; currency: string }>
  >({});

  // Customer data isolation: filter by customer_id when logged in as customer
  const customerId = role === 'customer' ? user?.customerId : undefined;

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
        const projData = await ProjectsProvider.list(customerId ? { customer_id: customerId } : {});
        setProjects(projData as Project[]);
        success(t('portal.toast.projectCreated', { defaultValue: 'Project created' }));
        navigate('projects');
      } catch (err) {
        if (import.meta.env.DEV) console.error('Failed to create project', err);
        showError(t('portal.toast.projectCreateFailed', { defaultValue: 'Failed to create project' }));
      }
    },
    [navigate, success, showError, t, customerId]
  );

  const handleUpdateProject = useCallback(async (id: string, data: Partial<Project>) => {
    try {
      await ProjectsProvider.update(id, data);
      const projData = await ProjectsProvider.list(customerId ? { customer_id: customerId } : {});
      setProjects(projData as Project[]);
      success(t('portal.toast.projectUpdated', { defaultValue: 'Project updated' }));
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to update project', err);
      showError(t('portal.toast.projectUpdateFailed', { defaultValue: 'Failed to update project' }));
    }
  }, [success, showError, t, customerId]);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const [projData, assetData] = await Promise.all([
        ProjectsProvider.list(customerId ? { customer_id: customerId } : {}),
        AssetsProvider.list(),
      ]);
      const filteredProjects = projData as Project[];
      setProjects(filteredProjects);
      // Filter assets to only include those belonging to the customer's projects
      const projectIds = new Set(filteredProjects.map((p) => p.id));
      const allAssets = assetData as Asset[];
      setAssets(
        role === 'customer' ? allAssets.filter((a) => a.project_id && projectIds.has(a.project_id)) : allAssets
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load portal data';
      if (import.meta.env.DEV) console.error('Failed to fetch data', err);
      setError(errorMessage);
    }
  }, [customerId, role]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setError(null);
        const [projData, assetData] = await Promise.all([
          ProjectsProvider.list(customerId ? { customer_id: customerId } : {}),
          AssetsProvider.list(),
        ]);
        if (!cancelled) {
          const filteredProjects = projData as Project[];
          setProjects(filteredProjects);
          // Filter assets to only include those belonging to the customer's projects
          const projectIds = new Set(filteredProjects.map((p) => p.id));
          const allAssets = assetData as Asset[];
          setAssets(
            role === 'customer'
              ? allAssets.filter((a) => a.project_id && projectIds.has(a.project_id))
              : allAssets
          );
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
  }, [customerId, role]);

  const handleLogout = async () => {
    await logout();
    navigate('/app/login');
  };

  // Derive page title from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentSection = pathSegments[pathSegments.length - 1] ?? 'dashboard';
  const sectionLabel = t(`portal.tab.${currentSection}`, currentSection.charAt(0).toUpperCase() + currentSection.slice(1));
  const pageTitle = `${sectionLabel} | ${t('portal.tab.dashboard')}`;

  // Mobile bottom tab bar nav items (simplified — 4 key tabs)
  const mobileNavItems = role === 'customer'
    ? [
        { path: 'dashboard', label: t('portal.tab.menus', 'Dashboard'), icon: LayoutDashboard },
        { path: 'assets', label: t('portal.tab.dishes', 'Dishes'), icon: UtensilsCrossed },
        { path: 'menu-editor', label: t('portal.tab.menuEditor', 'Editor'), icon: Paintbrush },
        { path: 'settings', label: t('portal.tab.settings', 'Settings'), icon: SettingsIcon },
      ]
    : [
        { path: 'dashboard', label: t('portal.tab.menus', 'Dashboard'), icon: LayoutDashboard },
        { path: 'projects', label: t('portal.tab.projects', 'Projects'), icon: FolderOpen },
        { path: 'assets', label: t('portal.tab.dishes', 'Assets'), icon: Box },
        { path: 'settings', label: t('portal.tab.settings', 'Settings'), icon: SettingsIcon },
      ];

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
    sidebarCollapsed: collapsed,
    handleCreateProject,
    handleUpdateProject,
    refreshData,
    setEditingProject,
    setAssigningProject,
    setIsModalOpen,
    setModalMode,
    setShowUpgradePlanModal,
    announce: announceToScreenReader,
  };

  const userName = user?.name || organization?.name || t('portal.bistroOwner', 'User');
  const userEmail = user?.email || '';

  if (loading) return <PortalLoadingSkeleton />;

  return (
    <div
      className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950"
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

      {/* Modals */}
      <NewProjectModal
        isOpen={isModalOpen || Boolean(editingProject)}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
          setModalMode('project');
        }}
        project={editingProject}
        mode={editingProject ? 'project' : modalMode}
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
      <UpgradePlanModal
        isOpen={showUpgradePlanModal}
        onClose={() => setShowUpgradePlanModal(false)}
      />

      {/* Sidebar */}
      <PortalSidebar
        role={role}
        collapsed={collapsed}
        onToggleCollapse={toggle}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
        onNewProject={role === 'employee' ? () => setIsModalOpen(true) : undefined}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <PortalTopBar
          role={role}
          onMenuToggle={openMobile}
          projects={projects}
          assets={assets}
          onNewProject={role === 'employee' ? () => setIsModalOpen(true) : undefined}
        />

        {/* Page Content */}
        <main id="portal-main-content" className="flex-1 p-4 lg:p-6 xl:p-8 pb-20 lg:pb-8 overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
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

        {/* Mobile Bottom Tab Bar (simplified — 4 key tabs) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 safe-area-pb">
          <div className="flex items-center justify-around h-14">
            {mobileNavItems.map((item) => {
              const active = isNavActive(item.path);
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
                  <item.icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Screen reader live region for dynamic announcements */}
      <div id="portal-status-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  );
};

export default PortalLayout;
