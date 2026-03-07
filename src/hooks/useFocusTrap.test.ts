import { renderHook } from '@testing-library/react';
import { useFocusTrap } from './useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let button3: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    button1 = document.createElement('button');
    button1.textContent = 'First';
    button2 = document.createElement('button');
    button2.textContent = 'Second';
    button3 = document.createElement('button');
    button3.textContent = 'Third';
    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);
    document.body.appendChild(container);

    // happy-dom may not implement offsetParent; stub it so the
    // visibility filter inside the hook treats elements as visible.
    Object.defineProperty(button1, 'offsetParent', {
      get: () => document.body,
      configurable: true,
    });
    Object.defineProperty(button2, 'offsetParent', {
      get: () => document.body,
      configurable: true,
    });
    Object.defineProperty(button3, 'offsetParent', {
      get: () => document.body,
      configurable: true,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns a ref object', () => {
    const { result } = renderHook(() => useFocusTrap<HTMLDivElement>(false));
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('current');
  });

  it('focuses the first focusable element when activated', () => {
    const { result } = renderHook(({ active }) => useFocusTrap<HTMLDivElement>(active), {
      initialProps: { active: false },
    });

    // Attach ref to our container
    (result.current as { current: HTMLDivElement | null }).current = container;

    // Activate the trap by re-rendering with active=true via a new renderHook
    // We need to set the ref before the effect runs
    const { unmount } = renderHook(() => {
      const ref = useFocusTrap<HTMLDivElement>(true);
      (ref as { current: HTMLDivElement | null }).current = container;
      return ref;
    });

    expect(document.activeElement).toBe(button1);
    unmount();
  });

  it('wraps focus from last to first element on Tab', () => {
    renderHook(() => {
      const ref = useFocusTrap<HTMLDivElement>(true);
      (ref as { current: HTMLDivElement | null }).current = container;
      return ref;
    });

    // Focus should be on the first button initially
    expect(document.activeElement).toBe(button1);

    // Move focus to the last button
    button3.focus();
    expect(document.activeElement).toBe(button3);

    // Press Tab while on the last button - should wrap to first
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(button1);
  });

  it('wraps focus from first to last element on Shift+Tab', () => {
    renderHook(() => {
      const ref = useFocusTrap<HTMLDivElement>(true);
      (ref as { current: HTMLDivElement | null }).current = container;
      return ref;
    });

    // Focus is on the first button
    expect(document.activeElement).toBe(button1);

    // Press Shift+Tab while on the first button - should wrap to last
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(shiftTabEvent);

    expect(document.activeElement).toBe(button3);
  });

  it('restores focus to previously focused element on cleanup', () => {
    // Focus an element outside the trap first
    const outsideButton = document.createElement('button');
    outsideButton.textContent = 'Outside';
    document.body.appendChild(outsideButton);
    Object.defineProperty(outsideButton, 'offsetParent', {
      get: () => document.body,
      configurable: true,
    });
    outsideButton.focus();
    expect(document.activeElement).toBe(outsideButton);

    const { unmount } = renderHook(() => {
      const ref = useFocusTrap<HTMLDivElement>(true);
      (ref as { current: HTMLDivElement | null }).current = container;
      return ref;
    });

    // Focus should have moved into the trap
    expect(document.activeElement).toBe(button1);

    // Unmount should restore focus to the outside button
    unmount();
    expect(document.activeElement).toBe(outsideButton);
  });

  it('does not trap focus when active is false', () => {
    const outsideButton = document.createElement('button');
    outsideButton.textContent = 'Outside';
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    renderHook(() => {
      const ref = useFocusTrap<HTMLDivElement>(false);
      (ref as { current: HTMLDivElement | null }).current = container;
      return ref;
    });

    // Focus should remain on the outside button
    expect(document.activeElement).toBe(outsideButton);
  });

  it('focuses the container itself when no focusable children exist', () => {
    const emptyContainer = document.createElement('div');
    document.body.appendChild(emptyContainer);

    renderHook(() => {
      const ref = useFocusTrap<HTMLDivElement>(true);
      (ref as { current: HTMLDivElement | null }).current = emptyContainer;
      return ref;
    });

    expect(emptyContainer.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(emptyContainer);
  });
});
