import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const LANGS = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'ru', flag: '🇷🇺' },
] as const;

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { locale, switchLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const current = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  const handleSwitch = (code: string) => {
    switchLocale(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline text-xs font-medium uppercase tracking-wide">
          {current.code}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 rounded-xl shadow-hover border border-zinc-800 overflow-hidden py-1 z-50 animate-slide-down"
          role="listbox"
          aria-label="Select language"
        >
          {LANGS.map((lang) => {
            const isActive = locale === lang.code;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSwitch(lang.code)}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'text-brand-400 bg-brand-950/40'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="font-medium">{t(`lang.${lang.code}`)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
