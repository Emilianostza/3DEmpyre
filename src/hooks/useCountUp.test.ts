import { renderHook, act } from '@testing-library/react';
import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  let rafCallbacks: Array<(time: number) => void>;
  let mockNow: number;
  let originalRAF: typeof globalThis.requestAnimationFrame;
  let originalCAF: typeof globalThis.cancelAnimationFrame;
  let originalPerformanceNow: typeof performance.now;

  beforeEach(() => {
    rafCallbacks = [];
    mockNow = 0;

    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;
    originalPerformanceNow = performance.now;

    let rafId = 0;
    globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb as (time: number) => void);
      return ++rafId;
    });
    globalThis.cancelAnimationFrame = vi.fn();
    performance.now = vi.fn(() => mockNow);
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCAF;
    performance.now = originalPerformanceNow;
  });

  /**
   * Flush one batch of queued rAF callbacks at the given timestamp.
   * Only processes callbacks that were queued before this call (no recursion).
   */
  function stepRAF(time: number) {
    mockNow = time;
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    for (const cb of cbs) {
      cb(time);
    }
  }

  /**
   * Advance to a time >= duration so the animation completes.
   * When progress >= 1 the hook won't schedule another rAF, so
   * a single step is sufficient to reach the final value.
   */
  function completeAnimation(time: number) {
    // Step until no new callbacks are enqueued (max 200 to be safe)
    mockNow = time;
    let safety = 200;
    while (rafCallbacks.length > 0 && safety-- > 0) {
      const cbs = [...rafCallbacks];
      rafCallbacks = [];
      for (const cb of cbs) {
        cb(time);
      }
    }
  }

  it('returns the final formatted value after animation completes', () => {
    const { result } = renderHook(() => useCountUp({ end: 100, duration: 2000 }));

    // Flush past the duration to complete the animation
    act(() => {
      completeAnimation(2500);
    });

    expect(result.current).toBe('100');
  });

  it('applies prefix and suffix formatting', () => {
    const { result } = renderHook(() =>
      useCountUp({ end: 50, duration: 1000, prefix: '$', suffix: '+' })
    );

    act(() => {
      completeAnimation(1500);
    });

    expect(result.current).toBe('$50+');
  });

  it('returns prefix + "0" + suffix when enabled is false', () => {
    const { result } = renderHook(() =>
      useCountUp({ end: 100, duration: 2000, prefix: '<', suffix: '%', enabled: false })
    );

    expect(result.current).toBe('<0%');
  });

  it('returns "0" when enabled is false with no prefix/suffix', () => {
    const { result } = renderHook(() => useCountUp({ end: 100, duration: 2000, enabled: false }));

    expect(result.current).toBe('0');
  });

  it('shows intermediate values during animation', () => {
    const { result } = renderHook(() => useCountUp({ end: 100, duration: 1000 }));

    // Process one frame at t=0
    act(() => {
      stepRAF(0);
    });

    // At time 0 elapsed is 0, progress is 0, so value should be 0
    expect(result.current).toBe('0');

    // Process one frame at t=500 (midway)
    act(() => {
      stepRAF(500);
    });

    // At 50% progress with ease-out cubic: 1 - (1 - 0.5)^3 = 1 - 0.125 = 0.875
    // So value should be Math.round(0.875 * 100) = 88
    expect(result.current).toBe('88');
  });

  it('cancels animation frame on unmount', () => {
    const { unmount } = renderHook(() => useCountUp({ end: 100, duration: 2000 }));

    unmount();

    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('only animates once even if re-rendered', () => {
    const { result, rerender } = renderHook((props) => useCountUp(props), {
      initialProps: { end: 100, duration: 1000, enabled: true },
    });

    act(() => {
      completeAnimation(1500);
    });

    expect(result.current).toBe('100');

    // Clear the mock calls
    (globalThis.requestAnimationFrame as ReturnType<typeof vi.fn>).mockClear();

    // Re-render with the same props
    rerender({ end: 100, duration: 1000, enabled: true });

    // No new rAF should be scheduled because hasAnimated.current is true
    expect(globalThis.requestAnimationFrame).not.toHaveBeenCalled();
  });
});
