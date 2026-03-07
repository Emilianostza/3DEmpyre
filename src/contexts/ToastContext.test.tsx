import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { ToastProvider, useToast } from './ToastContext';

// Mock crypto.randomUUID
let uuidCounter = 0;
const mockUUID = vi.fn(() => {
  uuidCounter++;
  return `test-id-${uuidCounter}`;
});

Object.defineProperty(globalThis.crypto, 'randomUUID', {
  value: mockUUID,
  writable: true,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('ToastContext', () => {
  beforeEach(() => {
    uuidCounter = 0;
    mockUUID.mockClear();
  });

  describe('useToast outside provider', () => {
    it('throws when used outside ToastProvider', () => {
      // Suppress console.error for expected error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within a ToastProvider');
      consoleSpy.mockRestore();
    });
  });

  describe('addToast', () => {
    it('adds a toast with correct type and message', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Hello World', 'success');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toEqual({
        id: 'test-id-1',
        type: 'success',
        message: 'Hello World',
        duration: 3000,
      });
    });

    it('defaults to type info and duration 3000', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Default toast');
      });

      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].duration).toBe(3000);
    });

    it('returns the generated toast id', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      let id: string = '';
      act(() => {
        id = result.current.addToast('Test');
      });

      expect(id).toBe('test-id-1');
    });
  });

  describe('convenience methods', () => {
    it('success() adds a toast with type success', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.success('Success message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].message).toBe('Success message');
    });

    it('error() adds a toast with type error', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.error('Error message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('error');
      expect(result.current.toasts[0].message).toBe('Error message');
    });

    it('warning() adds a toast with type warning', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.warning('Warning message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('warning');
      expect(result.current.toasts[0].message).toBe('Warning message');
    });

    it('info() adds a toast with type info', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.info('Info message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].message).toBe('Info message');
    });
  });

  describe('removeToast', () => {
    it('removes a specific toast by id', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('First', 'info', 0);
        result.current.addToast('Second', 'info', 0);
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        result.current.removeToast('test-id-1');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].id).toBe('test-id-2');
      expect(result.current.toasts[0].message).toBe('Second');
    });
  });

  describe('auto-removal', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('auto-removes toast after duration', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Temporary', 'info', 2000);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('auto-removes toast after default duration (3000ms)', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Default duration');
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('does NOT auto-remove toast with duration=0', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.addToast('Persistent', 'info', 0);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Persistent');
    });
  });

  describe('multiple toasts', () => {
    it('can have multiple toasts simultaneously', () => {
      const { result } = renderHook(() => useToast(), { wrapper });

      act(() => {
        result.current.success('Success toast', 0);
        result.current.error('Error toast', 0);
        result.current.warning('Warning toast', 0);
        result.current.info('Info toast', 0);
      });

      expect(result.current.toasts).toHaveLength(4);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[1].type).toBe('error');
      expect(result.current.toasts[2].type).toBe('warning');
      expect(result.current.toasts[3].type).toBe('info');
    });
  });
});
