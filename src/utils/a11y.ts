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

  // Fallback: create a temporary announcer
  const temp = document.createElement('div');
  temp.setAttribute('role', 'status');
  temp.setAttribute('aria-live', priority);
  temp.setAttribute('aria-atomic', 'true');
  temp.className = 'sr-only';
  document.body.appendChild(temp);
  requestAnimationFrame(() => {
    temp.textContent = message;
    setTimeout(() => temp.remove(), 3000);
  });
}
