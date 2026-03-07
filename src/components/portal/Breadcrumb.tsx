import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────

interface BreadcrumbProps {
  /** Override labels for specific path segments (e.g., a project ID → project name) */
  overrides?: Record<string, string>;
  className?: string;
}

// ── Segment label map ───────────────────────────────────────────

const SEGMENT_KEYS: Record<string, string> = {
  dashboard: 'breadcrumb.dashboard',
  projects: 'breadcrumb.projects',
  customers: 'breadcrumb.customers',
  settings: 'breadcrumb.settings',
  billing: 'breadcrumb.billing',
  profile: 'breadcrumb.profile',
  security: 'breadcrumb.security',
  notifications: 'breadcrumb.notifications',
};

// ── Component ───────────────────────────────────────────────────

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ overrides = {}, className = '' }) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Determine base path and strip it from display segments
  const isEmployee = location.pathname.startsWith('/app');
  const basePath = isEmployee ? '/app' : '/portal';
  const baseLabel = isEmployee
    ? t('breadcrumb.portal', 'Portal')
    : t('breadcrumb.portal', 'Portal');

  // Split path into segments after the base
  const relativePath = location.pathname.replace(basePath, '');
  const rawSegments = relativePath.split('/').filter(Boolean);

  if (rawSegments.length === 0) return null;

  // Build breadcrumb items
  const items = rawSegments.map((segment, index) => {
    const cumulativePath = `${basePath}/${rawSegments.slice(0, index + 1).join('/')}`;
    const label =
      overrides[segment] || (SEGMENT_KEYS[segment] ? t(SEGMENT_KEYS[segment], segment) : segment);
    const isLast = index === rawSegments.length - 1;

    return { segment, path: cumulativePath, label, isLast };
  });

  return (
    <nav aria-label={t('breadcrumb.label', 'Breadcrumb')} className={`mb-4 ${className}`}>
      <ol className="flex items-center gap-1.5 text-sm flex-wrap">
        {/* Home / Portal root */}
        <li className="flex items-center gap-1.5">
          <Link
            to={basePath}
            className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            {baseLabel}
          </Link>
          <ChevronRight
            className="w-3 h-3 text-zinc-300 dark:text-zinc-600 flex-shrink-0"
            aria-hidden="true"
          />
        </li>

        {/* Dynamic segments */}
        {items.map((item) => (
          <li key={item.path} className="flex items-center gap-1.5">
            {item.isLast ? (
              <span
                aria-current="page"
                className="text-zinc-900 dark:text-white font-semibold truncate max-w-[200px]"
              >
                {item.label}
              </span>
            ) : (
              <>
                <Link
                  to={item.path}
                  className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors truncate max-w-[200px]"
                >
                  {item.label}
                </Link>
                <ChevronRight
                  className="w-3 h-3 text-zinc-300 dark:text-zinc-600 flex-shrink-0"
                  aria-hidden="true"
                />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
