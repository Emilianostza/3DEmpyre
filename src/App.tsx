import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Layout from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { LocaleProvider, LOCALE_PREFIXES } from '@/contexts/LocaleContext';
import { ToastContainer } from '@/components/Toast';
import CommandPalette from '@/components/CommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import ScrollToTop from '@/components/ScrollToTop';
import { pageVariants } from '@/components/motion/presets';
import PageLoader from '@/components/PageLoader';
import { PortalRole } from '@/types';
import { queryClient } from '@/lib/queryClient';
import { usePrefetchRoutes } from '@/hooks/usePrefetchRoutes';

// Dev-only inspector — right-click any element to copy its location info
const DevInspector = import.meta.env.DEV
  ? lazy(() => import('@/components/DevInspector'))
  : () => null;

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Industry = lazy(() => import('./pages/Industry'));

const RequestForm = lazy(() => import('./pages/RequestForm'));
const Login = lazy(() => import('./pages/Login'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Pricing = lazy(() => import('./pages/Pricing'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RestaurantMenu = lazy(() => import('./pages/templates/RestaurantMenu'));
const ModelEditor = lazy(() => import('./pages/editor/ModelEditor'));
const SceneDashboard = lazy(() => import('./pages/editor/SceneDashboard'));
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Security = lazy(() => import('./pages/Security'));
const ARViewer = lazy(() => import('./pages/viewer/ARViewer'));
const RestaurantPricing = lazy(() => import('./pages/RestaurantPricing'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const About = lazy(() => import('./pages/About'));
const Compare = lazy(() => import('./pages/Compare'));
const CompareARCode = lazy(() => import('./pages/CompareARCode'));
const CompareMenus = lazy(() => import('./pages/CompareMenus'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ROICalculator = lazy(() => import('./pages/ROICalculator'));
const TemplateGallery = lazy(() => import('./pages/editor/TemplateGallery'));
const DailySpecials = lazy(() => import('./pages/templates/DailySpecials'));
const ProductShowcase = lazy(() => import('./pages/templates/ProductShowcase'));
const CatalogGrid = lazy(() => import('./pages/templates/CatalogGrid'));
const ArtifactViewer = lazy(() => import('./pages/templates/ArtifactViewer'));
const PortfolioGallery = lazy(() => import('./pages/templates/PortfolioGallery'));
const Library = lazy(() => import('./pages/Library'));

// Portal layout + sub-pages (nested routing)
const PortalLayout = lazy(() => import('./pages/portal/PortalLayout'));
const CustomerDashboardPage = lazy(() => import('./pages/portal/CustomerDashboardPage'));
const EmployeeDashboardPage = lazy(() => import('./pages/portal/EmployeeDashboardPage'));
const ProjectsPage = lazy(() => import('./pages/portal/ProjectsPage'));
const AssetsPage = lazy(() => import('./pages/portal/AssetsPage'));

const BillingPage = lazy(() => import('./pages/portal/BillingPage'));
const SettingsLayout = lazy(() => import('./pages/portal/SettingsLayout'));
const SettingsGeneralPage = lazy(() => import('./pages/portal/SettingsGeneralPage'));
const SettingsProfilePage = lazy(() => import('./pages/portal/SettingsProfilePage'));
const SettingsAppearancePage = lazy(() => import('./pages/portal/SettingsAppearancePage'));
const SettingsSecurityPage = lazy(() => import('./pages/portal/SettingsSecurityPage'));
const SettingsNotificationsPage = lazy(() => import('./pages/portal/SettingsNotificationsPage'));
const SettingsIntegrationsPage = lazy(() => import('./pages/portal/SettingsIntegrationsPage'));
const ProjectDetailPage = lazy(() => import('./pages/portal/ProjectDetailPage'));
const PhotoPipelinePage = lazy(() => import('./pages/portal/PhotoPipelinePage'));
const MenuEditorPage = lazy(() => import('./pages/portal/MenuEditorPage'));


/** Wraps a lazy-loaded page in its own ErrorBoundary so one broken page doesn't crash the whole app */
const SafePage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
);

/** Public routes that should exist at root AND under each locale prefix */
function PublicRoutes() {
  return (
    <>
      <Route index element={<SafePage><Home /></SafePage>} />
      <Route path="industries" element={<Navigate to="/" replace />} />
      <Route path="industries/:type" element={<SafePage><Industry /></SafePage>} />
      <Route path="gallery" element={<Navigate to="../library" replace />} />
      <Route path="library" element={<SafePage><Library /></SafePage>} />
      <Route path="how-it-works" element={<SafePage><HowItWorks /></SafePage>} />
      <Route path="pricing" element={<SafePage><RestaurantPricing /></SafePage>} />
      <Route path="pricing/platform" element={<SafePage><Pricing /></SafePage>} />
      <Route path="request" element={<SafePage><RequestForm /></SafePage>} />
      <Route path="security" element={<SafePage><Security /></SafePage>} />
      <Route path="privacy" element={<SafePage><Privacy /></SafePage>} />
      <Route path="terms" element={<SafePage><Terms /></SafePage>} />
      <Route path="roadmap" element={<SafePage><Roadmap /></SafePage>} />
      <Route path="case-studies" element={<SafePage><CaseStudies /></SafePage>} />
      <Route path="about" element={<SafePage><About /></SafePage>} />
      <Route path="compare" element={<SafePage><Compare /></SafePage>} />
      <Route path="compare/ar-code" element={<SafePage><CompareARCode /></SafePage>} />
      <Route path="compare/menus" element={<SafePage><CompareMenus /></SafePage>} />
      <Route path="blog" element={<SafePage><Blog /></SafePage>} />
      <Route path="blog/:slug" element={<SafePage><BlogPost /></SafePage>} />
      <Route path="roi" element={<SafePage><ROICalculator /></SafePage>} />
    </>
  );
}

/**
 * Compute a stable key for AnimatePresence that groups all portal
 * sub-routes under a single key. This prevents the outer page animation
 * from firing when navigating between portal sections (dashboard ↔ settings).
 * The inner PortalLayout handles its own sub-route animations.
 */
function getRouteGroupKey(pathname: string): string {
  if (pathname.startsWith('/portal')) return '/portal';
  if (
    pathname.startsWith('/app/dashboard') ||
    pathname.startsWith('/app/projects') ||
    pathname.startsWith('/app/assets') ||
    pathname.startsWith('/app/customers') ||
    pathname.startsWith('/app/pipeline') ||
    pathname.startsWith('/app/settings')
  ) {
    return '/app-portal';
  }
  return pathname;
}

/** Inner component rendered inside <Router> so it can use useLocation */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const routeKey = getRouteGroupKey(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        variants={prefersReducedMotion ? undefined : pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ willChange: 'transform, opacity' }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {/* ── Locale-prefixed public routes (/de/*, /es/*, /ru/*) ── */}
            {LOCALE_PREFIXES.map((lang) => (
              <Route key={lang} path={`/${lang}`}>
                {PublicRoutes()}
              </Route>
            ))}

            {/* ── Default (English) public routes ── */}
            {PublicRoutes()}

            {/* Auth Routes (public) */}
            <Route path="/app/login" element={<Login />} />

            {/* ── Protected Employee Non-Portal Routes (must come before /app layout) ── */}
            <Route
              path="/app/editor/:assetId"
              element={
                <ProtectedRoute
                  requiredRoles={[
                    PortalRole.Technician,
                    PortalRole.Approver,
                    PortalRole.Admin,
                    PortalRole.SuperAdmin,
                    PortalRole.CustomerOwner,
                  ]}
                >
                  <SceneDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/editor/:assetId/3d"
              element={
                <ProtectedRoute
                  requiredRoles={[
                    PortalRole.Technician,
                    PortalRole.Approver,
                    PortalRole.Admin,
                    PortalRole.SuperAdmin,
                  ]}
                >
                  <ModelEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/super-admin"
              element={
                <ProtectedRoute requiredRoles={[PortalRole.SuperAdmin]}>
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/templates"
              element={
                <ProtectedRoute
                  requiredRoles={[
                    PortalRole.Technician,
                    PortalRole.Approver,
                    PortalRole.Admin,
                    PortalRole.SuperAdmin,
                  ]}
                >
                  <TemplateGallery />
                </ProtectedRoute>
              }
            />

            {/* ── Protected Employee Portal (nested routes) ── */}
            <Route
              path="/app"
              element={
                <ProtectedRoute
                  requiredRoles={[
                    PortalRole.Technician,
                    PortalRole.Approver,
                    PortalRole.SalesLead,
                    PortalRole.Admin,
                  ]}
                >
                  <PortalLayout role="employee" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboardPage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="customers" element={<Navigate to="/app/assets" replace />} />
              <Route path="pipeline" element={<PhotoPipelinePage />} />
              <Route path="settings" element={<SettingsLayout role="employee" />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<SettingsGeneralPage />} />
                <Route path="profile" element={<SettingsProfilePage />} />
                <Route path="appearance" element={<SettingsAppearancePage />} />
                <Route path="notifications" element={<SettingsNotificationsPage />} />
                <Route path="security" element={<SettingsSecurityPage />} />
                <Route path="integrations" element={<SettingsIntegrationsPage />} />
              </Route>
            </Route>

            {/* ── Protected Customer Portal (nested routes) ── */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute
                  requiredRoles={[PortalRole.CustomerOwner, PortalRole.CustomerViewer]}
                >
                  <PortalLayout role="customer" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboardPage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="menu-editor" element={<MenuEditorPage />} />
              <Route path="billing" element={<Navigate to="/portal/settings/billing" replace />} />
              <Route path="settings" element={<SettingsLayout role="customer" />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<SettingsGeneralPage />} />
                <Route path="profile" element={<SettingsProfilePage />} />
                <Route path="appearance" element={<SettingsAppearancePage />} />
                <Route path="notifications" element={<SettingsNotificationsPage />} />
                <Route path="security" element={<SettingsSecurityPage />} />
                <Route path="integrations" element={<SettingsIntegrationsPage />} />
                <Route path="billing" element={<BillingPage />} />
              </Route>
            </Route>

            {/* Templates (public) */}
            <Route path="/project/:id/menu" element={<SafePage><RestaurantMenu /></SafePage>} />
            <Route path="/project/:id/menu/edit" element={<SafePage><RestaurantMenu /></SafePage>} />
            <Route path="/project/:id/specials" element={<SafePage><DailySpecials /></SafePage>} />
            <Route path="/project/:id/showcase" element={<SafePage><ProductShowcase /></SafePage>} />
            <Route path="/project/:id/catalog" element={<SafePage><CatalogGrid /></SafePage>} />
            <Route path="/project/:id/artifacts" element={<SafePage><ArtifactViewer /></SafePage>} />
            <Route path="/project/:id/portfolio" element={<SafePage><PortfolioGallery /></SafePage>} />

            {/* Public WebAR viewer — scanned from QR codes */}
            <Route path="/view/:assetId" element={<SafePage><ARViewer /></SafePage>} />

            {/* 404 Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const AppContent: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { isOpen: isCmdOpen, open: openCmd, close: closeCmd } = useCommandPalette();
  usePrefetchRoutes();

  return (
    <>
      <Router>
        <LocaleProvider>
          <ScrollToTop />
          <DevInspector />

          <Layout onOpenSearch={openCmd}>
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </Layout>

          <CommandPalette isOpen={isCmdOpen} onClose={closeCmd} />
        </LocaleProvider>
      </Router>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
