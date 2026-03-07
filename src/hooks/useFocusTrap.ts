import { useEffect, useRef } from 'react';

/**
 * Traps keyboard focus inside a container element while active.
 *
 * When enabled the hook:
 *  1. Remembers the previously focused element.
 *  2. Moves focus to the first focusable child (or the container itself).
 *  3. Intercepts Tab / Shift+Tab to cycle within the container.
 *  4. Restores focus to the previously focused element on cleanup.
 *
 * Usage:
 *   const trapRef = useFocusTrap<HTMLDivElement>(isOpen);
 *   <div ref={trapRef} ...>
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focusable selector list (WCAG-compliant)
    const FOCUSABLE =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null // visible only
      );

    // Move focus into the trap
    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      container.setAttribute('tabindex', '-1');
      container.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const nodes = getFocusable();
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}
