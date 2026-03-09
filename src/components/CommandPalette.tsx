import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  FileText,
  ChefHat,
  Briefcase,
  Moon,
  Sun,
  Globe,
  CornerDownLeft,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { modalOverlay, modalContent } from '@/components/motion/presets';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: 'page' | 'item' | 'action';
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  page: 'Pages',
  item: 'Menu Items',
  action: 'Quick Actions',
};

const CATEGORY_ORDER = ['page', 'action', 'item'] as const;

// ─── Component ────────────────────────────────────────────────────────────────

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ── Build searchable items ──

  const allItems = useMemo<SearchResult[]>(() => {
    const nav = (path: string) => () => {
      navigate(path);
      onClose();
    };

    const pages: SearchResult[] = [
      {
        id: 'p-home',
        title: t('nav.home', 'Home'),
        subtitle: '/',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/'),
      },
      {
        id: 'p-pricing',
        title: t('nav.pricing', 'Pricing'),
        subtitle: '/pricing',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/pricing'),
      },
      {
        id: 'p-library',
        title: t('nav.library', 'Library'),
        subtitle: '/library',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/library'),
      },
      {
        id: 'p-how',
        title: t('nav.howItWorks', 'How It Works'),
        subtitle: '/how-it-works',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/how-it-works'),
      },
      {
        id: 'p-about',
        title: t('nav.about', 'About'),
        subtitle: '/about',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/about'),
      },
      {
        id: 'p-blog',
        title: t('nav.blog', 'Blog'),
        subtitle: '/blog',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/blog'),
      },
      {
        id: 'p-roadmap',
        title: t('nav.roadmap', 'Roadmap'),
        subtitle: '/roadmap',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/roadmap'),
      },
      {
        id: 'p-roi',
        title: t('nav.roi', 'ROI Calculator'),
        subtitle: '/roi',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/roi'),
      },
      {
        id: 'p-compare',
        title: t('nav.compare', 'Compare'),
        subtitle: '/compare',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/compare'),
      },
      {
        id: 'p-case',
        title: t('nav.caseStudies', 'Case Studies'),
        subtitle: '/case-studies',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/case-studies'),
      },
      {
        id: 'p-request',
        title: t('nav.request', 'Request a Quote'),
        subtitle: '/request',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/request'),
      },
      {
        id: 'p-security',
        title: t('nav.security', 'Security'),
        subtitle: '/security',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/security'),
      },
      {
        id: 'p-privacy',
        title: t('nav.privacy', 'Privacy'),
        subtitle: '/privacy',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/privacy'),
      },
      {
        id: 'p-terms',
        title: t('nav.terms', 'Terms'),
        subtitle: '/terms',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/terms'),
      },
      {
        id: 'p-portal',
        title: t('nav.portal', 'Dashboard'),
        subtitle: '/app/dashboard',
        category: 'page',
        icon: <Briefcase className="w-4 h-4" />,
        action: nav('/app/dashboard'),
      },
      {
        id: 'p-login',
        title: t('nav.login', 'Login'),
        subtitle: '/app/login',
        category: 'page',
        icon: <FileText className="w-4 h-4" />,
        action: nav('/app/login'),
      },
    ];

    const actions: SearchResult[] = [
      {
        id: 'a-theme',
        title:
          theme === 'dark'
            ? t('cmd.lightMode', 'Switch to Light Mode')
            : t('cmd.darkMode', 'Switch to Dark Mode'),
        subtitle: theme === 'dark' ? 'Currently dark' : 'Currently light',
        category: 'action',
        icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'a-lang-en',
        title: t('cmd.switchEn', 'Switch to English'),
        category: 'action',
        icon: <Globe className="w-4 h-4" />,
        action: () => {
          i18n.changeLanguage('en');
          onClose();
        },
      },
      {
        id: 'a-lang-es',
        title: t('cmd.switchEs', 'Switch to Spanish'),
        category: 'action',
        icon: <Globe className="w-4 h-4" />,
        action: () => {
          i18n.changeLanguage('es');
          onClose();
        },
      },
      {
        id: 'a-lang-de',
        title: t('cmd.switchDe', 'Switch to German'),
        category: 'action',
        icon: <Globe className="w-4 h-4" />,
        action: () => {
          i18n.changeLanguage('de');
          onClose();
        },
      },
      {
        id: 'a-lang-ru',
        title: t('cmd.switchRu', 'Switch to Russian'),
        category: 'action',
        icon: <Globe className="w-4 h-4" />,
        action: () => {
          i18n.changeLanguage('ru');
          onClose();
        },
      },
    ];

    // Static demo menu items (same as RestaurantMenu INITIAL_ITEMS)
    const menuItems: SearchResult[] = [
      {
        id: 'm-1',
        title: 'Wagyu Tartare',
        subtitle: 'Starters \u00b7 $28',
        category: 'item',
        icon: <ChefHat className="w-4 h-4" />,
        action: nav('/project/demo/menu#item-1'),
      },
      {
        id: 'm-2',
        title: 'Truffle Arancini',
        subtitle: 'Starters \u00b7 $12',
        category: 'item',
        icon: <ChefHat className="w-4 h-4" />,
        action: nav('/project/demo/menu#item-2'),
      },
      {
        id: 'm-3',
        title: 'Pan-Seared Salmon',
        subtitle: 'Mains \u00b7 $38',
        category: 'item',
        icon: <ChefHat className="w-4 h-4" />,
        action: nav('/project/demo/menu#item-3'),
      },
      {
        id: 'm-4',
        title: 'Filet Mignon',
        subtitle: 'Mains \u00b7 $52',
        category: 'item',
        icon: <ChefHat className="w-4 h-4" />,
        action: nav('/project/demo/menu#item-4'),
      },
      {
        id: 'm-5',
        title: 'Dark Chocolate Fondant',
        subtitle: 'Desserts \u00b7 $16',
        category: 'item',
        icon: <ChefHat className="w-4 h-4" />,
        action: nav('/project/demo/menu#item-5'),
      },
      {
        id: 'm-6',
        title: 'Cr\u00e8me Br\u00fbl\u00e9e',
        subtitle: 'Desserts \u00b7 $14',
        category: 'item',
        icon: <ChefHat className="w-4 h-4" />,
        action: nav('/project/demo/menu#item-6'),
      },
    ];

    return [...pages, ...actions, ...menuItems];
  }, [navigate, onClose, t, i18n, theme, toggleTheme]);

  // ── Filter results ──

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 12); // show top items when empty
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [allItems, query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      if (groups[item.category].length < 8) {
        groups[item.category].push(item);
      }
    }
    return groups;
  }, [filtered]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: SearchResult[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (grouped[cat]) flat.push(...grouped[cat]);
    }
    return flat;
  }, [grouped]);

  // ── Reset on open/close ──

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after animation starts
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // ── Body scroll lock ──

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // ── Keyboard navigation ──

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % Math.max(flatResults.length, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + flatResults.length) % Math.max(flatResults.length, 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            flatResults[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [flatResults, selectedIndex, onClose]
  );

  // Reset selected index when results change (covers query changes and list shrinking)
  useEffect(() => {
    setSelectedIndex(0);
  }, [flatResults]);

  // ── Render ──

  let globalIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Palette */}
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={t('cmd.title', 'Command Palette')}
            className="fixed z-[81] top-[15%] left-1/2 -translate-x-1/2 w-full max-w-[640px] mx-4"
            onKeyDown={handleKeyDown}
          >
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Search className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('cmd.placeholder', 'Search pages, items, actions...')}
                  className="flex-1 bg-transparent text-white text-base placeholder:text-zinc-600 outline-none"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="cmd-results"
                  aria-activedescendant={
                    flatResults[selectedIndex] ? `cmd-${flatResults[selectedIndex].id}` : undefined
                  }
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-600 font-mono bg-zinc-800 border border-zinc-700 rounded-md px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div
                id="cmd-results"
                role="listbox"
                className="max-h-[400px] overflow-y-auto py-2 scrollbar-thin"
              >
                {flatResults.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-zinc-500 text-sm">
                      {t('cmd.noResults', 'No results found')}
                    </p>
                    <p className="text-zinc-700 text-xs mt-1">
                      {t('cmd.tryDifferent', 'Try a different search term')}
                    </p>
                  </div>
                ) : (
                  CATEGORY_ORDER.map((cat) => {
                    const items = grouped[cat];
                    if (!items || items.length === 0) return null;

                    return (
                      <div key={cat}>
                        {/* Category header */}
                        <div className="px-5 pt-3 pb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                            {CATEGORY_LABELS[cat]}
                          </span>
                        </div>

                        {/* Items */}
                        {items.map((item) => {
                          globalIndex++;
                          const isSelected = globalIndex === selectedIndex;
                          const idx = globalIndex;

                          return (
                            <button
                              key={item.id}
                              id={`cmd-${item.id}`}
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => item.action()}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={`flex items-center gap-3 w-full px-5 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? 'bg-brand-600/20 text-white'
                                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                              }`}
                            >
                              <span
                                className={`flex-shrink-0 ${isSelected ? 'text-brand-400' : 'text-zinc-600'}`}
                              >
                                {item.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">
                                  {item.title}
                                </span>
                                {item.subtitle && (
                                  <span className="text-xs text-zinc-600 truncate block">
                                    {item.subtitle}
                                  </span>
                                )}
                              </div>
                              {isSelected && (
                                <CornerDownLeft className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-4 px-5 py-3 border-t border-white/5 text-[10px] text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <kbd className="font-mono bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5">
                    &uarr;&darr;
                  </kbd>
                  {t('cmd.navigate', 'navigate')}
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="font-mono bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5">
                    &crarr;
                  </kbd>
                  {t('cmd.select', 'select')}
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="font-mono bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5">
                    esc
                  </kbd>
                  {t('cmd.close', 'close')}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
