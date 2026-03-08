import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCommandPalette } from './useCommandPalette';

describe('useCommandPalette', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(result.current.isOpen).toBe(false);
  });

  it('open() sets isOpen to true', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('close() sets isOpen to false', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle() flips the state', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('responds to Ctrl+K keyboard shortcut', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
      );
    });
    expect(result.current.isOpen).toBe(true);

    // Toggle again to close
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
      );
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('responds to Meta+K keyboard shortcut', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
      );
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('ignores plain K key without modifier', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', bubbles: true }),
      );
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('prevents default on Ctrl+K', () => {
    renderHook(() => useCommandPalette());

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const spy = vi.spyOn(event, 'preventDefault');

    act(() => {
      document.dispatchEvent(event);
    });
    expect(spy).toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useCommandPalette());

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
