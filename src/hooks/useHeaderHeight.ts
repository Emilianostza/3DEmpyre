import { useEffect, useState, type RefObject } from 'react';

/**
 * Tracks the outer height (offsetHeight) of an element via ResizeObserver.
 * Useful for measuring a sticky header so other code can react to its size.
 * Returns 0 until the element mounts.
 */
export function useHeaderHeight(ref: RefObject<HTMLElement | null>): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setHeight(el.offsetHeight);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return height;
}
