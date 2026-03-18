import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  /** Final value to count to */
  end: number;
  /** Duration of the animation in ms (default: 2000) */
  duration?: number;
  /** Prefix string, e.g. "<" or "$" */
  prefix?: string;
  /** Suffix string, e.g. "%" or "+" */
  suffix?: string;
  /** Whether to animate (default: true) — useful with IntersectionObserver */
  enabled?: boolean;
  /** Easing function exponent (default: 3 for ease-out cubic) */
  easing?: number;
}

/**
 * Animates a number from 0 to `end` when `enabled` is true.
 * Returns the current display string (with optional prefix/suffix).
 *
 * Uses requestAnimationFrame for smooth 60fps animation.
 */
export function useCountUp({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  enabled = true,
  easing = 3,
}: UseCountUpOptions): string {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  // Keep ref to preserve hook order (was hasAnimated); not used as a gate
  const _reserved = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    _reserved.current = true;
    // Reset so strict-mode re-runs and value changes animate correctly
    setValue(0);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out curve: 1 - (1 - t)^easing
      const easedProgress = 1 - Math.pow(1 - progress, easing);
      const current = Math.round(easedProgress * end);

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, end, duration, easing]);

  return `${prefix}${value}${suffix}`;
}
