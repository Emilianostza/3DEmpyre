import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { PortalRole } from '@/types';
import { Permission } from '@/types/auth';

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string | Record<string, unknown>) => {
      if (typeof fallback === 'string') return fallback;
      if (typeof fallback === 'object' && 'defaultValue' in fallback)
        return fallback.defaultValue as string;
      return key;
    },
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const mockAuthValue = {
  user: null,
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  hasPermission: vi.fn(),
  organization: null,
  token: null,
};

const renderProtectedRoute = (
  children: React.ReactNode,
  props?: { requiredRoles?: PortalRole[]; requiredPermissions?: Permission[] }
) => {
  return render(
    <BrowserRouter>
      <ProtectedRoute {...props}>{children}</ProtectedRoute>
    </BrowserRouter>
  );
};

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthValue);
  });

  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthValue,
      loading: true,
    });

    renderProtectedRoute(<div>Protected content</div>);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('redirects to /app/login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthValue,
      user: null,
      loading: false,
    });

    renderProtectedRoute(<div>Protected content</div>);
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects to / when user lacks required role', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthValue,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: {
          type: PortalRole.CustomerViewer,
          permissions: [],
        },
        orgId: 'org-1',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      loading: false,
    });

    renderProtectedRoute(<div>Protected content</div>, {
      requiredRoles: [PortalRole.Admin, PortalRole.Approver],
    });

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children when user has required role', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthValue,
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        role: {
          type: PortalRole.Admin,
          permissions: [],
        },
        orgId: 'org-1',
        name: 'Admin User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      loading: false,
    });

    renderProtectedRoute(<div>Protected content</div>, {
      requiredRoles: [PortalRole.Admin, PortalRole.Approver],
    });

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('checks permissions when requiredPermissions is set', () => {
    const hasPermissionMock = vi.fn().mockReturnValue(true);
    mockUseAuth.mockReturnValue({
      ...mockAuthValue,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: {
          type: PortalRole.Admin,
          permissions: [],
        },
        orgId: 'org-1',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      loading: false,
      hasPermission: hasPermissionMock,
    });

    const requiredPermission: Permission = {
      resource: 'project',
      action: 'read',
      orgId: 'org-1',
    };

    renderProtectedRoute(<div>Protected content</div>, {
      requiredPermissions: [requiredPermission],
    });

    expect(hasPermissionMock).toHaveBeenCalledWith(requiredPermission);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to / when user lacks required permission', () => {
    const hasPermissionMock = vi.fn().mockReturnValue(false);
    mockUseAuth.mockReturnValue({
      ...mockAuthValue,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: {
          type: PortalRole.CustomerViewer,
          permissions: [],
        },
        orgId: 'org-1',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      loading: false,
      hasPermission: hasPermissionMock,
    });

    const requiredPermission: Permission = {
      resource: 'admin',
      action: 'update',
      orgId: 'org-1',
    };

    renderProtectedRoute(<div>Protected content</div>, {
      requiredPermissions: [requiredPermission],
    });

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
