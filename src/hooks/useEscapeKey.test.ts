import { renderHook } from '@testing-library/react';
import { useEscapeKey } from './useEscapeKey';

describe('useEscapeKey', () => {
  it('calls handler when Escape key is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler for other keys', () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not call handler when enabled is false', () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler, false));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(handler));

    unmount();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('cleans up and re-registers listener when enabled changes', () => {
    const handler = vi.fn();
    const { rerender } = renderHook(({ enabled }) => useEscapeKey(handler, enabled), {
      initialProps: { enabled: true },
    });

    // Handler works while enabled
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledTimes(1);

    // Disable - handler should stop
    rerender({ enabled: false });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledTimes(1);

    // Re-enable - handler should work again
    rerender({ enabled: true });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
