import { type RefObject, useCallback, useMemo } from 'react';

/**
 * Scrolls to elements by their DOM id while compensating for a fixed /
 * sticky header so the target isn't hidden behind it.
 *
 * Returns:
 * - `scrollToId(id)` — programmatic scroll that offsets by header height + 16 px buffer.
 * - `isNativeSupported` — true when the browser supports `scroll-margin-top`,
 *    meaning `scrollIntoView` already respects CSS offsets and you can prefer
 *    it over `scrollToId`.
 */
export function useScrollOffset(headerRef: RefObject<HTMLElement | null>) {
  const isNativeSupported = useMemo(() => {
    if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
      return false;
    }
    return CSS.supports('scroll-margin-top', '1px');
  }, []);

  const scrollToId = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      const headerH = headerRef.current
        ? headerRef.current.getBoundingClientRect().height
        : 0;

      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      const top = Math.max(0, elementTop - headerH - 16);

      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      window.scrollTo({
        top,
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
    },
    [headerRef],
  );

  return { scrollToId, isNativeSupported } as const;
}
