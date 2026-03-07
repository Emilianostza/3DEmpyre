import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Prefetch portal route chunks after successful login.
 *
 * Once the user is authenticated, we know they'll navigate to
 * the portal dashboard. Prefetching these chunks in the background
 * makes the first navigation instant instead of showing a loader.
 *
 * Uses requestIdleCallback to avoid blocking the main thread.
 */
export function usePrefetchRoutes() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const prefetch = () => {
      // Portal layout + dashboard — always needed after login
      import('@/pages/portal/PortalLayout');
      import('@/pages/portal/ProjectsPage');

      // Role-specific dashboard
      const roleType = user.role?.type;
      if (roleType === 'customer_owner' || roleType === 'customer_viewer') {
        import('@/pages/portal/CustomerDashboardPage');
      } else {
        import('@/pages/portal/EmployeeDashboardPage');
      }
    };

    // Use idle callback to avoid blocking paint
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetch, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(prefetch, 1000);
      return () => clearTimeout(id);
    }
  }, [user]);
}
