/**
 * Accessibility Utilities
 *
 * Helpers for screen reader announcements and other a11y concerns.
 */

/**
 * Announce a message to screen readers via the portal's live region.
 * Falls back to creating a temporary live region if the portal one isn't found.
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const region = document.getElementById('portal-status-announcer');

  if (region) {
    region.setAttribute('aria-live', priority);
    // Clear first to force re-announcement of identical messages
    region.textContent = '';
    requestAnimationFrame(() => {
      region.textContent = message;
    });
    return;
  }

  // Fallback: reuse a single announcer element to avoid DOM accumulation
  let fallback = document.getElementById('_a11y-fallback-announcer');
  if (!fallback) {
    fallback = document.createElement('div');
    fallback.id = '_a11y-fallback-announcer';
    fallback.setAttribute('role', 'status');
    fallback.setAttribute('aria-atomic', 'true');
    fallback.className = 'sr-only';
    document.body.appendChild(fallback);
  }
  fallback.setAttribute('aria-live', priority);
  // Clear first to force re-announcement of identical messages
  fallback.textContent = '';
  requestAnimationFrame(() => {
    fallback!.textContent = message;
  });
}
