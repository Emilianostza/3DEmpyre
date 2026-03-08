import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Home from './Home';

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string | Record<string, unknown>) => {
      // Return default values for key assertions where provided
      if (typeof fallback === 'string') return fallback;
      if (typeof fallback === 'object' && 'defaultValue' in fallback)
        return fallback.defaultValue as string;
      return key;
    },
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

vi.mock('@/hooks/useScrollReveal', () => ({
  useScrollReveal: () => ({
    ref: { current: null },
    isVisible: true,
  }),
}));

vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: ({ end, prefix, suffix }: { end: number; prefix?: string; suffix?: string }) =>
    `${prefix ?? ''}${end}${suffix ?? ''}`,
}));

vi.mock('@/components/common/SEO', () => ({
  SEO: () => null,
}));

vi.mock('@/components/common/StructuredData', () => ({
  OrganizationSchema: () => null,
  WebSiteSchema: () => null,
  LocalBusinessSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock('@/components/BeforeAfterSlider', () => ({
  default: () => <div data-testid="before-after-slider">Slider</div>,
}));

vi.mock('@/components/Accordion', () => ({
  default: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => (
    <div data-testid="accordion">
      <button>{title}</button>
      <div>{children}</div>
    </div>
  ),
}));

vi.mock('@/config/site', () => ({
  DEMO_MODELS: {
    astronaut: {
      glb: 'https://example.com/model.glb',
      usdz: 'https://example.com/model.usdz',
      poster: 'https://example.com/poster.jpg',
    },
    materialSuite: {
      glb: 'https://example.com/material.glb',
      poster: 'https://example.com/material.jpg',
    },
  },
  PLACEHOLDER_BEFORE: 'data:image/svg+xml,<svg/>',
  PLACEHOLDER_AFTER: 'data:image/svg+xml,<svg/>',
  SITE_NAME: '3D Empyre',
  SITE_ORIGIN: 'https://managedcapture3d.com',
  CONTACT_EMAIL: 'info@managedcapture.com',
  placeholder: () => 'data:image/svg+xml,<svg/>',
}));

vi.mock('@/constants', () => ({
  HOW_IT_WORKS_STEPS: [
    {
      icon: 'Camera',
      title: 'Step 1',
      desc: 'First step description',
    },
    {
      icon: 'Upload',
      title: 'Step 2',
      desc: 'Second step description',
    },
  ],
  PLATFORM_CAPABILITIES: [
    { id: 'web-ar', color: 'brand', icon: '🌐' },
    { id: 'multi-format', color: 'purple', icon: '📦' },
  ],
}));

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const renderHome = () => render(<Home />);

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('Home Page', () => {
  it('renders without crashing', () => {
    renderHome();
    // Page should render something
    expect(document.body.querySelector('div')).toBeInTheDocument();
  });

  it('renders the hero section with heading', () => {
    renderHome();
    // The hero heading uses t('home.hero.line1') + t('home.hero.line2')
    expect(screen.getByText('home.hero.line1')).toBeInTheDocument();
  });

  it('renders a primary CTA button linking to /request', () => {
    renderHome();
    const ctaLinks = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === '/request');
    expect(ctaLinks.length).toBeGreaterThan(0);
  });

  it('renders the before/after slider component', () => {
    renderHome();
    expect(screen.getByTestId('before-after-slider')).toBeInTheDocument();
  });

  it('renders FAQ accordion items', () => {
    renderHome();
    const accordions = screen.getAllByTestId('accordion');
    expect(accordions.length).toBeGreaterThan(0);
  });

  it('renders stat counters section', () => {
    renderHome();
    // Stats section should contain animated stat labels
    expect(screen.getByText('home.stats.delivery')).toBeInTheDocument();
  });

  it('renders testimonial section', () => {
    renderHome();
    expect(screen.getByText('home.testimonial.label')).toBeInTheDocument();
  });

  it('renders how-it-works section', () => {
    renderHome();
    expect(screen.getByText('home.howItWorks.heading')).toBeInTheDocument();
  });

  it('renders the hero subtitle', () => {
    renderHome();
    expect(screen.getByText('home.hero.subtitle')).toBeInTheDocument();
  });

  it('renders roadmap teaser section', () => {
    renderHome();
    expect(screen.getByText('home.roadmap.badge')).toBeInTheDocument();
  });
});
