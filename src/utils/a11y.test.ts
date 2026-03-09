import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { announceToScreenReader } from './a11y';

describe('announceToScreenReader', () => {
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    rafCallbacks = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
  });

  afterEach(() => {
    // Clean up any announcer elements left in the DOM
    document.getElementById('_a11y-fallback-announcer')?.remove();
    document.querySelectorAll('[role="status"]').forEach((el) => el.remove());
    document.getElementById('portal-status-announcer')?.remove();
    vi.restoreAllMocks();
  });

  it('uses existing portal announcer region when present', () => {
    const region = document.createElement('div');
    region.id = 'portal-status-announcer';
    document.body.appendChild(region);

    announceToScreenReader('Item saved');

    // Content is cleared first, then set in rAF
    expect(region.textContent).toBe('');

    // Flush rAF
    rafCallbacks.forEach((cb) => cb(0));
    expect(region.textContent).toBe('Item saved');

    region.remove();
  });

  it('sets aria-live to assertive when priority is assertive', () => {
    const region = document.createElement('div');
    region.id = 'portal-status-announcer';
    document.body.appendChild(region);

    announceToScreenReader('Error occurred', 'assertive');
    expect(region.getAttribute('aria-live')).toBe('assertive');

    region.remove();
  });

  it('defaults to polite priority', () => {
    const region = document.createElement('div');
    region.id = 'portal-status-announcer';
    document.body.appendChild(region);

    announceToScreenReader('Update complete');
    expect(region.getAttribute('aria-live')).toBe('polite');

    region.remove();
  });

  it('creates a temporary announcer when portal region is absent', () => {
    announceToScreenReader('Temporary announcement');

    const temp = document.querySelector('[role="status"]');
    expect(temp).not.toBeNull();
    expect(temp!.getAttribute('aria-live')).toBe('polite');
    expect(temp!.getAttribute('aria-atomic')).toBe('true');
    expect(temp!.className).toBe('sr-only');
  });

  it('temporary announcer receives message after rAF', () => {
    announceToScreenReader('Hello screen reader');

    const temp = document.querySelector('[role="status"]');
    expect(temp!.textContent).toBe('');

    rafCallbacks.forEach((cb) => cb(0));
    expect(temp!.textContent).toBe('Hello screen reader');
  });

  it('fallback announcer is reused across multiple calls', () => {
    announceToScreenReader('First message');
    rafCallbacks.forEach((cb) => cb(0));
    rafCallbacks = [];

    const first = document.getElementById('_a11y-fallback-announcer');
    expect(first).not.toBeNull();
    expect(first!.textContent).toBe('First message');

    announceToScreenReader('Second message');
    rafCallbacks.forEach((cb) => cb(0));

    const second = document.getElementById('_a11y-fallback-announcer');
    expect(second).toBe(first); // same element reused
    expect(second!.textContent).toBe('Second message');
  });
});
