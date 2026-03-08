import { useEffect, useRef } from 'react';

/**
 * Watches an element with IntersectionObserver and toggles the
 * `is-visible` CSS class when it scrolls into view.
 *
 * Pair with the `.reveal` / `.reveal-scale` / `.reveal-stagger`
 * classes defined in index.css.
 *
 * @param options.threshold  Visibility ratio to trigger (default 0.05 = 5 %).
 * @param options.rootMargin Extra margin around viewport (default triggers 80 px early from bottom).
 * @param options.once       If true (default) the class is added once and never removed.
 */
export function useScrollReveal<T extends HTMLElement>(
  options: {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
  } = {},
) {
  const ref = useRef<T>(null);

  // Store options in a ref so the effect doesn't re-run when the
  // caller passes a new object literal each render.
  const opts = useRef(options);
  opts.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { threshold = 0.05, rootMargin = '0px 0px -80px 0px', once = true } =
      opts.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove('is-visible');
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // Only run once on mount — options are read from the ref.

  return ref;
}
