import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'portal_sidebar_collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useSidebarState() {
  const [collapsed, setCollapsedState] = useState(readCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      // private browsing
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return { collapsed, toggle, setCollapsed, isMobileOpen, openMobile, closeMobile };
}
