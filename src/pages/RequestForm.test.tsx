import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RequestForm from './RequestForm';

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/request',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }),
  };
});

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

const mockCreateProject = vi.fn().mockResolvedValue({ id: 'proj_123' });
vi.mock('@/services/dataProvider', () => ({
  ProjectsProvider: {
    create: (...args: unknown[]) => mockCreateProject(...args),
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn(),
    update: vi.fn(),
    approve: vi.fn(),
    start: vi.fn(),
    deliver: vi.fn(),
    delete: vi.fn(),
  },
}));

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const renderForm = () => render(<RequestForm />);

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('RequestForm Page', () => {
  describe('Step 1 — Project', () => {
    it('renders the step 1 heading', () => {
      renderForm();
      expect(screen.getByText('requestForm.step1.heading')).toBeInTheDocument();
    });

    it('renders industry selection buttons', () => {
      renderForm();
      // Industry buttons render their names directly
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
    });

    it('renders the step indicator with step labels', () => {
      renderForm();
      expect(screen.getByText('requestForm.step.project')).toBeInTheDocument();
      expect(screen.getByText('requestForm.step.details')).toBeInTheDocument();
      expect(screen.getByText('requestForm.step.contact')).toBeInTheDocument();
    });

    it('renders the step 1 description', () => {
      renderForm();
      expect(screen.getByText('requestForm.step1.desc')).toBeInTheDocument();
    });

    it('renders the industry label', () => {
      renderForm();
      expect(screen.getByText('requestForm.step1.industryLabel')).toBeInTheDocument();
    });
  });

  describe('Live estimate sidebar', () => {
    it('renders the pricing sidebar heading', () => {
      renderForm();
      expect(screen.getByText('requestForm.estimate.liveEstimate')).toBeInTheDocument();
    });
  });

  describe('Session storage draft', () => {
    it('loads without crashing when no draft exists', () => {
      sessionStorage.removeItem('managed_capture_request_draft');
      renderForm();
      expect(screen.getByText('requestForm.step1.heading')).toBeInTheDocument();
    });

    it('loads without crashing when invalid draft exists', () => {
      sessionStorage.setItem('managed_capture_request_draft', 'invalid-json');
      renderForm();
      expect(screen.getByText('requestForm.step1.heading')).toBeInTheDocument();
    });
  });

  describe('Trust & security', () => {
    it('renders the page without errors', () => {
      renderForm();
      expect(document.body.querySelector('div')).toBeInTheDocument();
    });
  });
});
