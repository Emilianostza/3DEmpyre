import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Login from './Login';

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockLogin = vi.fn();
const mockAuthValue = {
  user: null as ReturnType<typeof import('@/contexts/AuthContext').useAuth>['user'],
  loading: false,
  error: null as string | null,
  login: mockLogin,
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

vi.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    localePath: (p: string) => p,
    locale: 'en',
    isLocalePrefixed: false,
    stripLocalePath: (p: string) => p,
    switchLocale: vi.fn(),
  }),
  LocaleProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
}));

vi.mock('@/components/LocalizedLink', () => ({
  LocalizedLink: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/common/SEO', () => ({
  SEO: () => null,
}));

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const renderLogin = () => render(<Login />);

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthValue.user = null;
    mockAuthValue.loading = false;
    mockAuthValue.error = null;
    mockAuthValue.login = mockLogin;
  });

  it('renders the login heading', () => {
    renderLogin();
    expect(screen.getByText('login.heading')).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('login.emailPlaceholder');
    const passwordInput = screen.getByPlaceholderText('login.passwordPlaceholder');

    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renders the sign-in button', () => {
    renderLogin();
    const button = screen.getByRole('button', { name: /login\.signIn/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders role toggle with customer and employee buttons', () => {
    renderLogin();
    const customerBtn = screen.getByText('login.roleCustomer');
    const employeeBtn = screen.getByText('login.roleEmployee');

    expect(customerBtn).toBeInTheDocument();
    expect(employeeBtn).toBeInTheDocument();
  });

  it('toggles role selection when clicking customer button', () => {
    renderLogin();
    const customerBtn = screen.getByText('login.roleCustomer');
    fireEvent.click(customerBtn);

    // After clicking customer, the customer description should show
    expect(screen.getByText('login.roleDescCustomer')).toBeInTheDocument();
  });

  it('displays error message when auth error exists', () => {
    mockAuthValue.error = 'Invalid credentials';
    renderLogin();

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('does not display error when no error exists', () => {
    renderLogin();
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });

  it('calls login with email and password on form submit', async () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText('login.emailPlaceholder');
    const passwordInput = screen.getByPlaceholderText('login.passwordPlaceholder');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const form = emailInput.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('disables inputs and button when loading', () => {
    mockAuthValue.loading = true;
    renderLogin();

    const emailInput = screen.getByPlaceholderText('login.emailPlaceholder');
    const passwordInput = screen.getByPlaceholderText('login.passwordPlaceholder');
    const submitBtn = screen.getByRole('button', { name: /login\.signingIn/i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitBtn).toBeDisabled();
  });

  it('shows spinner text when loading', () => {
    mockAuthValue.loading = true;
    renderLogin();

    expect(screen.getByText('login.signingIn')).toBeInTheDocument();
  });

  it('shows no-account message for customer role', () => {
    renderLogin();
    const customerBtn = screen.getByText('login.roleCustomer');
    fireEvent.click(customerBtn);

    expect(screen.getByText('login.noAccountCustomer')).toBeInTheDocument();
  });

  it('shows no-account message for employee role', () => {
    renderLogin();
    // Employee is default
    expect(screen.getByText('login.noAccountEmployee')).toBeInTheDocument();
  });
});
