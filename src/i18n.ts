import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

/** Detect language from URL path prefix (e.g. /de/gallery → 'de') */
const pathDetector = {
  name: 'path' as const,
  lookup(): string | undefined {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const first = segments[0];
    if (first && ['de', 'el', 'es', 'ru'].includes(first)) return first;
    return undefined; // fall through to next detector
  },
};

const customDetector = new LanguageDetector();
customDetector.addDetector(pathDetector);

i18n
  .use(HttpBackend)
  .use(customDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de', 'el', 'es', 'ru'],
    interpolation: { escapeValue: false },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['path', 'querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      caches: ['localStorage'],
    },
  });

// Keep <html lang> in sync with the active language
i18n.on('languageChanged', (lng: string) => {
  document.documentElement.lang = lng;
});

export default i18n;
