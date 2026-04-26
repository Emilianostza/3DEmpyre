import React from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_ORIGIN, SITE_NAME_SHORT, SITE_OG_IMAGE } from '@/config/site';
import { useLocale, LOCALE_PREFIXES } from '@/contexts/LocaleContext';

const LOCALE_TO_OG: Record<string, string> = {
  en: 'en_US',
  de: 'de_DE',
  el: 'el_GR',
  es: 'es_ES',
  ru: 'ru_RU',
};

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

// React 19 supports rendering <title> and <meta> directly from components —
// they are automatically hoisted to <head> without a provider.
export const SEO: React.FC<SEOProps> = ({
  title,
  description = '3Difys Platform - Create and share immersive AR experiences.',
  image = SITE_OG_IMAGE,
  url,
  type = 'website',
}) => {
  const { pathname } = useLocation();
  const { locale, stripLocalePath } = useLocale();

  // Bare path without any locale prefix (e.g. /gallery)
  const barePath = stripLocalePath(pathname);

  // Canonical URL — always the current locale version
  const canonical = url ?? `${SITE_ORIGIN}${pathname}`;
  const siteTitle = SITE_NAME_SHORT;
  const fullTitle = `${title} | ${siteTitle}`;

  return (
    <>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonical} />

      {/* Hreflang — path-based multi-language alternate pages */}
      <link rel="alternate" hrefLang="en" href={`${SITE_ORIGIN}${barePath}`} />
      {LOCALE_PREFIXES.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${SITE_ORIGIN}/${lang}${barePath}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_ORIGIN}${barePath}`} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={LOCALE_TO_OG[locale] ?? 'en_US'} />
      {Object.entries(LOCALE_TO_OG)
        .filter(([code]) => code !== locale)
        .map(([, ogLocale]) => (
          <meta key={ogLocale} property="og:locale:alternate" content={ogLocale} />
        ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
};
