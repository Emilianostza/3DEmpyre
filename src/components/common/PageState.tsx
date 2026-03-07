/**
 * Reusable Page State Components
 *
 * Consistent loading, error, and empty state displays
 * used across all pages for unified UX.
 */

import React from 'react';
import { AlertTriangle, Loader2, Inbox, RefreshCw, ArrowRight } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';

// ── Loading State ─────────────────────────────────────────────

interface LoadingStateProps {
  /** Optional message to display below spinner */
  message?: string;
  /** Use compact layout (no min-height) */
  compact?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  compact = false,
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 ${
      compact ? 'py-12' : 'min-h-[400px]'
    } ${className}`}
    role="status"
    aria-live="polite"
  >
    <Loader2 className="w-10 h-10 text-brand-400 animate-spin" aria-hidden="true" />
    <p className="text-sm text-zinc-400">{message}</p>
  </div>
);

// ── Error State ───────────────────────────────────────────────

interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error message or description */
  message?: string;
  /** Retry callback — shows retry button if provided */
  onRetry?: () => void;
  /** Use compact layout */
  compact?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  compact = false,
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-4 text-center ${
      compact ? 'py-12' : 'min-h-[400px]'
    } ${className}`}
    role="alert"
  >
    <div className="w-14 h-14 rounded-2xl bg-red-950/30 flex items-center justify-center">
      <AlertTriangle className="w-7 h-7 text-red-500" aria-hidden="true" />
    </div>
    <div className="max-w-sm">
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-400">{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white text-zinc-900 hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-700 focus:outline-none"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Try again
      </button>
    )}
  </div>
);

// ── Empty State ───────────────────────────────────────────────

interface EmptyStateProps {
  /** Icon to display (defaults to Inbox) */
  icon?: React.ReactNode;
  /** Title text */
  title?: string;
  /** Description text */
  message?: string;
  /** Optional action button */
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  /** Use compact layout */
  compact?: boolean;
  className?: string;
  /** Optional help text */
  helpText?: string;
  /** Optional help link URL */
  helpLink?: string;
  /** Optional suggested actions */
  suggestions?: Array<{ label: string; onClick?: () => void; to?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'Nothing here yet',
  message = 'There are no items to display.',
  action,
  compact = false,
  className = '',
  helpText,
  helpLink,
  suggestions,
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-4 text-center ${
      compact ? 'py-12' : 'min-h-[400px]'
    } ${className}`}
  >
    <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
      {icon || <Inbox className="w-7 h-7 text-zinc-500" aria-hidden="true" />}
    </div>
    <div className="max-w-sm">
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-400">{message}</p>
      {helpText && (
        <p className="text-xs text-zinc-500 mt-2">
          {helpLink ? (
            <a
              href={helpLink}
              className="text-brand-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {helpText}
            </a>
          ) : (
            helpText
          )}
        </p>
      )}
    </div>
    {action &&
      (action.to ? (
        <Link
          to={action.to}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 focus:outline-none"
        >
          {action.label}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 focus:outline-none"
        >
          {action.label}
        </button>
      ))}
    {suggestions && suggestions.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {suggestions.map((s) =>
          s.to ? (
            <Link
              key={s.label}
              to={s.to}
              className="text-xs font-medium text-brand-500 hover:text-brand-400 underline underline-offset-2"
            >
              {s.label}
            </Link>
          ) : (
            <button
              key={s.label}
              onClick={s.onClick}
              className="text-xs font-medium text-brand-500 hover:text-brand-400 underline underline-offset-2"
            >
              {s.label}
            </button>
          )
        )}
      </div>
    )}
  </div>
);
