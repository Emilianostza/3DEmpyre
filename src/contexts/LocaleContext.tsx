import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/** Non-English locales that get a URL prefix */
export const LOCALE_PREFIXES = ['de', 'es', 'ru'] as const;
export const ALL_LOCALES = ['en', ...LOCALE_PREFIXES] as const;
type Locale = (typeof ALL_LOCALES)[number];

interface LocaleContextValue {
  /** Current active locale (e.g. 'en', 'de') */
  locale: Locale;
  /** Whether the current URL has a locale prefix */
  isLocalePrefixed: boolean;
  /** Prepend the current locale prefix to a path (no-op for English) */
  localePath: (path: string) => string;
  /** Strip locale prefix from a path (returns the bare path) */
  stripLocalePath: (path: string) => string;
  /** Navigate to the same page under a different locale */
  switchLocale: (newLocale: string) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  isLocalePrefixed: false,
  localePath: (p) => p,
  stripLocalePath: (p) => p,
  switchLocale: () => {},
});

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  // Detect locale from URL path prefix
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] as string | undefined;
  const isLocalePrefixed =
    typeof firstSegment === 'string' &&
    (LOCALE_PREFIXES as readonly string[]).includes(firstSegment);
  const locale: Locale = isLocalePrefixed ? (firstSegment as Locale) : 'en';

  // Sync i18n language with URL locale
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const localePath = useCallback(
    (path: string): string => {
      if (locale === 'en') return path;
      const normalized = path.startsWith('/') ? path : `/${path}`;
      return `/${locale}${normalized}`;
    },
    [locale]
  );

  const stripLocalePath = useCallback((path: string): string => {
    for (const prefix of LOCALE_PREFIXES) {
      if (path === `/${prefix}`) return '/';
      if (path.startsWith(`/${prefix}/`)) return path.slice(prefix.length + 1);
    }
    return path;
  }, []);

  const switchLocale = useCallback(
    (newLocale: string) => {
      const barePath = stripLocalePath(pathname);
      const target = newLocale === 'en' ? barePath : `/${newLocale}${barePath}`;
      i18n.changeLanguage(newLocale);
      navigate(target);
    },
    [pathname, stripLocalePath, navigate, i18n]
  );

  const value = useMemo(
    () => ({ locale, isLocalePrefixed, localePath, stripLocalePath, switchLocale }),
    [locale, isLocalePrefixed, localePath, stripLocalePath, switchLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => useContext(LocaleContext);
