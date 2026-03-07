import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Eye, Globe, Lock } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────

type Visibility = 'team' | 'customer' | 'public' | 'private';

interface AccessBadgeProps {
  visibility: Visibility;
  className?: string;
}

// ── Config ──────────────────────────────────────────────────────

const VISIBILITY_CONFIG: Record<
  Visibility,
  {
    icon: React.ElementType;
    i18nKey: string;
    fallback: string;
    cls: string;
  }
> = {
  team: {
    icon: Users,
    i18nKey: 'access.team',
    fallback: 'Shared with team',
    cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  },
  customer: {
    icon: Eye,
    i18nKey: 'access.customer',
    fallback: 'Customer visible',
    cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
  public: {
    icon: Globe,
    i18nKey: 'access.public',
    fallback: 'Public',
    cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  },
  private: {
    icon: Lock,
    i18nKey: 'access.private',
    fallback: 'Internal only',
    cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  },
};

// ── Component ───────────────────────────────────────────────────

export const AccessBadge: React.FC<AccessBadgeProps> = ({ visibility, className = '' }) => {
  const { t } = useTranslation();
  const config = VISIBILITY_CONFIG[visibility];
  const Icon = config.icon;
  const label = t(config.i18nKey, config.fallback);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${config.cls} ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
};
