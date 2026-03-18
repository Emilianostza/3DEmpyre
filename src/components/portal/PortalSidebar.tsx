import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Box,
  LayoutDashboard,
  UtensilsCrossed,
  Paintbrush,
  CreditCard,
  Settings,
  FolderOpen,
  Workflow,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  X,
} from 'lucide-react';
import { sheetFromLeft, modalOverlay } from '@/components/motion/presets';

// ── Types ───────────────────────────────────────────────────────

interface SidebarNavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface PortalSidebarProps {
  role: 'employee' | 'customer';
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onNewProject?: () => void;
}

// ── Nav Config ──────────────────────────────────────────────────

function useNavItems(role: 'employee' | 'customer'): SidebarNavItem[] {
  const { t } = useTranslation();
  if (role === 'customer') {
    return [
      { path: 'dashboard', label: t('portal.tab.menus', 'Dashboard'), icon: LayoutDashboard },
      { path: 'assets', label: t('portal.tab.dishes', 'Dishes'), icon: UtensilsCrossed },
      { path: 'menu-editor', label: t('portal.tab.menuEditor', 'Menu Editor'), icon: Paintbrush },
      { path: 'billing', label: t('portal.tab.billing', 'Billing'), icon: CreditCard },
      { path: 'settings', label: t('portal.tab.settings', 'Settings'), icon: Settings },
    ];
  }
  return [
    { path: 'dashboard', label: t('portal.tab.menus', 'Dashboard'), icon: LayoutDashboard },
    { path: 'projects', label: t('portal.tab.projects', 'Projects'), icon: FolderOpen },
    { path: 'assets', label: t('portal.tab.dishes', 'Assets'), icon: Box },
    { path: 'pipeline', label: t('portal.tab.pipeline', '3D Pipeline'), icon: Workflow },
    { path: 'settings', label: t('portal.tab.settings', 'Settings'), icon: Settings },
  ];
}

// ── Sidebar Content (shared between desktop and mobile) ─────────

const SidebarContent: React.FC<{
  role: 'employee' | 'customer';
  collapsed: boolean;
  navItems: SidebarNavItem[];
  basePath: string;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}> = ({ collapsed, navItems, basePath, userName, userEmail, onLogout, onToggleCollapse, isMobile }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const isActive = (path: string) => {
    const fullPath = `${basePath}/${path}`;
    return location.pathname === fullPath || location.pathname.startsWith(`${fullPath}/`);
  };

  const effectiveCollapsed = isMobile ? false : collapsed;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-sm flex-shrink-0">
          <Box className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        {!effectiveCollapsed && (
          <span className="font-bold text-zinc-900 dark:text-white text-base whitespace-nowrap overflow-hidden">
            3D <span className="text-brand-600 dark:text-brand-400">Empyre</span>
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === 'dashboard'}
              title={effectiveCollapsed ? item.label : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
              {...(active ? { 'aria-current': 'page' as const } : {})}
            >
              {/* Active indicator bar */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-600 dark:bg-brand-400 rounded-r-full" />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? '' : 'group-hover:scale-105 transition-transform'}`} />
              {!effectiveCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`${effectiveCollapsed ? 'absolute top-1 right-1' : 'ml-auto'} bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <div className="px-2 py-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            aria-label={collapsed ? t('portal.expandSidebar', 'Expand sidebar') : t('portal.collapseSidebar', 'Collapse sidebar')}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!effectiveCollapsed && <span>{t('portal.collapse', 'Collapse')}</span>}
          </button>
        </div>
      )}

      {/* User Section */}
      <div className="px-2 pb-3 border-t border-zinc-200 dark:border-zinc-800 pt-2" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors ${effectiveCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </span>
          </div>
          {!effectiveCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{userName}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{userEmail}</p>
            </div>
          )}
        </button>

        {/* User dropdown */}
        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className={`${effectiveCollapsed ? 'absolute left-[72px] bottom-4' : 'mt-1'} bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden z-50 min-w-[180px]`}
            >
              <NavLink
                to="settings/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
              >
                <User className="w-4 h-4" />
                {t('portal.settings.profile', 'Profile')}
              </NavLink>
              <NavLink
                to="settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('portal.tab.settings', 'Settings')}
              </NavLink>
              <div className="border-t border-zinc-200 dark:border-zinc-700" />
              <button
                onClick={() => { setShowUserMenu(false); onLogout(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('portal.signOut', 'Sign Out')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  role,
  collapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  userName,
  userEmail,
  onLogout,
}) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const basePath = role === 'customer' ? '/portal' : '/app';
  const navItems = useNavItems(role);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] h-screen sticky top-0 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <SidebarContent
          role={role}
          collapsed={collapsed}
          navItems={navItems}
          basePath={basePath}
          userName={userName}
          userEmail={userEmail}
          onLogout={onLogout}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              variants={prefersReducedMotion ? undefined : modalOverlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              variants={prefersReducedMotion ? undefined : sheetFromLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-zinc-900 shadow-2xl lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={onCloseMobile}
                className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-10"
                aria-label={t('portal.close', 'Close')}
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent
                role={role}
                collapsed={false}
                navItems={navItems}
                basePath={basePath}
                userName={userName}
                userEmail={userEmail}
                onLogout={onLogout}
                onToggleCollapse={onToggleCollapse}
                isMobile
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
