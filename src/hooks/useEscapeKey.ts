import { useEffect, useRef } from 'react';

/**
 * Calls `handler` when the Escape key is pressed.
 * Automatically cleans up the listener on unmount or when `enabled` changes.
 *
 * The handler is stored in a ref so that inline arrow functions
 * do not cause the listener to be torn down and re-bound every render.
 */
export function useEscapeKey(handler: () => void, enabled = true): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handlerRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
