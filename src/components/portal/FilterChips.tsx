import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

// ── Component ───────────────────────────────────────────────────

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemove,
  onClearAll,
  className = '',
}) => {
  const { t } = useTranslation();

  if (filters.length === 0) return null;

  return (
    <div
      className={`flex items-center gap-2 flex-wrap ${className}`}
      role="group"
      aria-label={t('filterChips.activeFilters', 'Active filters')}
    >
      {filters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-medium rounded-full px-2.5 py-1"
        >
          <span>
            {filter.label}: {filter.value}
          </span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-0.5 p-0.5 rounded-full hover:bg-brand-100 dark:hover:bg-brand-800/30 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus:outline-none"
            aria-label={t('filterChips.remove', 'Remove filter: {{label}}', {
              label: `${filter.label}: ${filter.value}`,
            })}
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        </span>
      ))}

      {filters.length >= 2 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors underline underline-offset-2"
        >
          {t('filterChips.clearAll', 'Clear all')}
        </button>
      )}
    </div>
  );
};
