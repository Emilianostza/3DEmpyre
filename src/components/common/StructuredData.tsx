/**
 * JSON-LD Structured Data Components
 *
 * Provides structured data for Google rich results.
 * React 19 hoists <script> tags to <head> automatically.
 */

import React from 'react';
import { SITE_NAME, SITE_ORIGIN, SITE_LOGO, CONTACT_EMAIL } from '@/config/site';

// ── Organization Schema ───────────────────────────────────────

export const OrganizationSchema: React.FC = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: SITE_LOGO,
    description:
      'Professional 3D capture services for enterprise. We digitize the physical world into production-ready 3D & AR assets.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: CONTACT_EMAIL,
      contactType: 'customer service',
    },
    sameAs: [],
    areaServed: [
      { '@type': 'Country', name: 'Estonia' },
      { '@type': 'Country', name: 'Greece' },
      { '@type': 'Country', name: 'France' },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
};

// ── WebSite Schema ────────────────────────────────────────────

export const WebSiteSchema: React.FC = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description:
      'Expert 3D capture services delivered to your door. Create production-ready 3D & AR assets for restaurants, retail, and enterprise.',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
};

// ── FAQ Schema ────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSchema: React.FC<{ items: FAQItem[] }> = ({ items }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
};

// ── Service Schema ────────────────────────────────────────────

interface ServiceSchemaProps {
  name: string;
  description: string;
  price?: string;
  priceCurrency?: string;
}

export const ServiceSchema: React.FC<ServiceSchemaProps> = ({
  name,
  description,
  price,
  priceCurrency = 'EUR',
}) => {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    areaServed: 'EU',
  };

  if (price) {
    data.offers = {
      '@type': 'Offer',
      price,
      priceCurrency,
    };
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
};

// ── Breadcrumb Schema ─────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  path: string;
}

export const BreadcrumbSchema: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path}`,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
};

// ── BlogPosting Schema ───────────────────────────────────────

interface BlogPostingSchemaProps {
  headline: string;
  description: string;
  datePublished: string;
  authorName: string;
}

export const BlogPostingSchema: React.FC<BlogPostingSchemaProps> = ({
  headline,
  description,
  datePublished,
  authorName,
}) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    datePublished,
    author: { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: SITE_LOGO },
    },
    mainEntityOfPage: { '@type': 'WebPage' },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
};

// ── LocalBusiness Schema ──────────────────────────────────────

export const LocalBusinessSchema: React.FC = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: SITE_LOGO,
    description:
      'Professional managed 3D capture and AR services for restaurants, retail, and enterprise across Europe.',
    priceRange: '$$',
    areaServed: [
      { '@type': 'Country', name: 'Estonia' },
      { '@type': 'Country', name: 'Greece' },
      { '@type': 'Country', name: 'France' },
    ],
    knowsAbout: [
      '3D Scanning',
      'Photogrammetry',
      'Augmented Reality',
      '3D Food Photography',
      'AR Menus',
      'WebAR',
    ],
    serviceType: [
      'Managed 3D Capture',
      '3D Menu Creation',
      'AR Experience Development',
      'Product 3D Scanning',
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
};
