import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { PortalRole } from '@/types';
import { Permission, UserRoleType } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: PortalRole[] | UserRoleType[];
  requiredPermissions?: Permission[];
}

/**
 * ProtectedRoute guards routes from unauthenticated access.
 * PHASE 2: Added permission-based checks via requiredPermissions prop
 *
 * Usage (role-based):
 * <ProtectedRoute requiredRoles={[PortalRole.Admin, PortalRole.Approver]}>
 *   <AdminPage />
 * </ProtectedRoute>
 *
 * Usage (permission-based):
 * <ProtectedRoute requiredPermissions={[{ resource: 'project', action: 'read', orgId: '...' }]}>
 *   <ProjectPage />
 * </ProtectedRoute>
 *
 * If user is not authenticated, redirects to /app/login.
 * If user lacks required role/permission, redirects to /.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
}) => {
  const { user, loading, hasPermission } = useAuth();
  const { t } = useTranslation();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/app/login" replace />;
  }

  // Role check (if required roles specified)
  if (requiredRoles) {
    const userRole = user.role.type;
    if (!(requiredRoles as string[]).includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  // Permission check (if required permissions specified)
  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every((permission) => hasPermission(permission));
    if (!hasAllPermissions) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
