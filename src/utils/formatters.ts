/**
 * Shared formatting utilities.
 *
 * Consolidates duplicated helpers that were previously copy-pasted
 * across Portal.tsx, ProjectCards.tsx, ProjectTable.tsx,
 * ActivityFeed.tsx, WorkflowPipeline.tsx,
 * NotificationCenter.tsx, etc.
 */

/**
 * Format a relative time string from an ISO date.
 *
 * @example timeAgo('2026-02-22T10:00:00Z') // "2h ago"
 * @example timeAgo('') // "Unknown"
 * @example timeAgo(undefined) // "Unknown"
 */
export function timeAgo(iso: string | undefined): string {
  if (!iso) return 'Unknown';
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff) || diff < 0) return 'Just now';

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Extract initials from a name string.
 *
 * @example getInitials('John Doe') // "JD"
 * @example getInitials('Alice') // "A"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Map an i18next language code to a BCP 47 locale tag
 * suitable for `Intl.NumberFormat` / `Date.toLocaleDateString`.
 *
 * @example i18nToLocale('en') // "en-US"
 * @example i18nToLocale('de') // "de-DE"
 * @example i18nToLocale('fr') // "en-US" (fallback)
 */
/**
 * Format a project/asset status key into a human-readable label.
 *
 * @example formatStatus('in_progress') // "In Progress"
 * @example formatStatus('delivered')   // "Delivered"
 * @example formatStatus('qa')          // "QA"
 */
export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    in_progress: 'In Progress',
    delivered: 'Delivered',
    approved: 'Approved',
    pending: 'Pending',
    processing: 'Processing',
    qa: 'QA',
    archived: 'Archived',
    assigned: 'Assigned',
    rejected: 'Rejected',
  };
  return map[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function i18nToLocale(lang: string): string {
  const map: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    ru: 'ru-RU',
  };
  return map[lang] ?? 'en-US';
}
