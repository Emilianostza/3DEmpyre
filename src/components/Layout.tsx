import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS } from '@/constants';
import { LocalizedLink as Link } from '@/components/LocalizedLink';

import { Menu, X, Box, ShieldCheck, ArrowRight, ChevronDown, Github, Twitter, Linkedin } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLocale } from '@/contexts/LocaleContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface LayoutProps {
  children: React.ReactNode;
  onOpenSearch?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const mobileMenuRef = useFocusTrap<HTMLDivElement>(isMobileMenuOpen);
  useEscapeKey(() => setIsMobileMenuOpen(false), isMobileMenuOpen);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Track scroll for header shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll(); // sync initial state
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { stripLocalePath } = useLocale();

  // Don't show public nav on app routes or standalone template pages
  const isAppRoute =
    location.pathname.startsWith('/app') || location.pathname.startsWith('/portal') || location.pathname.startsWith('/project');

  if (isAppRoute) {
    return <>{children}</>;
  }

  // Compare paths without locale prefix for active state detection
  const barePath = stripLocalePath(location.pathname);
  const isActive = (path: string) =>
    path === '/' ? barePath === '/' : path !== '/industries' && barePath.startsWith(path);

  return (
    <div
      className="flex flex-col min-h-screen"
      {...(import.meta.env.DEV && {
        'data-component': 'Layout',
        'data-file': 'src/components/Layout.tsx',
      })}
    >
      {/* Skip to content — a11y best practice */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand-600 focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        {t('nav.skipToContent')}
      </a>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3">
        <div
          className={`w-full max-w-7xl h-16 flex items-center justify-between gap-6 rounded-2xl transition-all duration-200 ${isScrolled
            ? 'bg-zinc-950/85 backdrop-blur-2xl shadow-lg border border-white/[0.08]'
            : 'bg-zinc-950/70 backdrop-blur-2xl border border-white/[0.06]'
            }`}
        >
          <div className="flex items-center justify-between gap-6 w-full px-6">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 font-display font-bold text-lg text-white hover:opacity-80 transition-opacity shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow/40">
                <Box className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span>
                3Difys
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav
              aria-label="Main navigation"
              className="hidden md:flex items-center gap-1 flex-1 justify-center"
            >
              {NAV_ITEMS.map((item) => (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                      ? 'text-brand-400 bg-brand-950/40'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                      }`}
                    {...(isActive(item.path) ? { 'aria-current': 'page' as const } : {})}
                  >
                    {t(item.label)}
                    {item.children && (
                      <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                    )}
                  </Link>

                  {/* Dropdown — visible on hover OR keyboard focus-within */}
                  {item.children && (
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0 z-50">
                      <div
                        className="w-44 bg-zinc-900/80 backdrop-blur-xl rounded-xl shadow-hover border border-white/[0.06] overflow-hidden py-1"
                        role="menu"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            role="menuitem"
                            className="flex items-center px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-brand-400 focus:bg-zinc-800 focus:text-brand-400 focus:outline-none transition-colors"
                          >
                            {t(child.label)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-2 shrink-0">

              <LanguageSwitcher />
              <Link
                to="/app/login"
                className="text-sm font-medium text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-800/60 transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/request"
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-glow/40 hover:shadow-glow hover:-translate-y-px active:translate-y-0"
              >
                {t('cta.getQuote')}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-1.5">
              <button
                className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800/50 transition-colors"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label={isMobileMenuOpen ? t('shared.closeMenu') : t('shared.openMenu')}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Gradient divider */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
        </div>

        {/* Mobile Menu — Full-screen overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Menu panel */}
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="fixed inset-0 z-[70] md:hidden bg-gradient-to-b from-zinc-950 to-zinc-950/95"
              >
                <div ref={mobileMenuRef} className="px-6 py-6 flex flex-col h-full">
                  {/* Header with logo and close button */}
                  <div className="flex items-center justify-between mb-8">
                    <Link
                      to="/"
                      className="flex items-center gap-2.5 font-display font-bold text-lg text-white"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow/40">
                        <Box className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                      </div>
                      <span>
                        3Difys
                      </span>
                    </Link>
                    <button
                      className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800/50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label={t('shared.closeMenu')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Navigation items */}
                  <nav className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 -mx-6 px-6">
                    {NAV_ITEMS.map((item) => (
                      <div key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(item.path)
                            ? 'text-brand-400 bg-brand-950/40'
                            : 'text-zinc-300 hover:bg-zinc-900/50 hover:text-zinc-100'
                            }`}
                          {...(isActive(item.path) ? { 'aria-current': 'page' as const } : {})}
                        >
                          {t(item.label)}
                          {item.children && (
                            <ChevronDown className="w-4 h-4 opacity-60" />
                          )}
                        </Link>
                        {item.children && (
                          <div className="ml-4 mt-1 mb-2 pl-4 border-l-2 border-zinc-800 flex flex-col gap-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.path}
                                to={child.path}
                                className="px-3 py-2.5 text-sm text-zinc-400 hover:text-brand-400 transition-colors rounded-lg hover:bg-zinc-900/40"
                              >
                                {t(child.label)}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>

                  {/* Bottom actions — pinned */}
                  <div className="shrink-0 space-y-3 pt-5 mt-auto border-t border-zinc-800/60">
                    <div className="px-2 py-2">
                      <LanguageSwitcher />
                    </div>

                    <Link
                      to="/app/login"
                      className="block px-4 py-3 rounded-lg text-base font-medium text-zinc-300 hover:bg-zinc-900/50 hover:text-white transition-colors text-center min-h-[48px] flex items-center justify-center"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/request"
                      className="block px-4 py-3 rounded-full bg-brand-600 text-white text-base font-semibold text-center hover:bg-brand-700 transition-colors shadow-glow/40 min-h-[48px] flex items-center justify-center"
                    >
                      {t('cta.getQuote')}
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <main id="main-content" className="flex-grow pt-20" role="main">
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative bg-zinc-950 text-zinc-400 overflow-hidden">
        {/* Gradient divider at top */}
        <div className="h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

        {/* Subtle background mesh (optional gradient) */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 to-zinc-950 pointer-events-none" />

        <div className="relative container mx-auto px-4 pt-20 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            {/* Brand col */}
            <div className="space-y-5 md:col-span-1">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 font-display font-bold text-lg text-white hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow/30">
                  <Box className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                3Difys
              </Link>
              <p className="text-base text-zinc-400 leading-relaxed max-w-[280px]">
                {t('footer.description')}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                {t('footer.soc2')}
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-brand-400 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-brand-400 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-brand-400 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Industries */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">{t('footer.industries')}</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: t('footer.restaurants'), path: '/industries/restaurants' },
                  // Hidden until ready — keep the data, just not in footer
                  // { label: t('footer.hospitality'), path: '/industries/hospitality' },
                  { label: t('footer.retail'), path: '/industries/retail' },
                  // { label: t('footer.realEstate'), path: '/industries/real-estate' },
                ].map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="hover:text-brand-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-brand-500 hover:after:w-full after:transition-all"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: t('footer.howItWorks'), path: '/how-it-works' },
                  { label: t('footer.caseStudies'), path: '/case-studies' },
                  { label: t('footer.compare'), path: '/compare' },
                  { label: t('footer.vsARCode'), path: '/compare/ar-code' },
                  { label: t('footer.vs3DPhoto'), path: '/compare/menus' },
                  { label: t('footer.about'), path: '/about' },
                  { label: t('footer.pricing'), path: '/pricing' },
                  { label: t('footer.roi'), path: '/roi' },
                  { label: t('footer.trustCenter'), path: '/security' },
                ].map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="hover:text-brand-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-brand-500 hover:after:w-full after:transition-all"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: t('footer.privacy'), path: '/privacy' },
                  { label: t('footer.terms'), path: '/terms' },
                ].map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="hover:text-brand-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-brand-500 hover:after:w-full after:transition-all"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">{t('footer.copyright')}</p>
            <p className="text-xs text-zinc-500">{t('footer.tagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
