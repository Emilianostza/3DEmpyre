import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'brand' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const barColors = {
  brand: 'bg-brand-600 dark:bg-brand-500',
  emerald: 'bg-emerald-600 dark:bg-emerald-500',
  amber: 'bg-amber-500 dark:bg-amber-400',
  rose: 'bg-rose-600 dark:bg-rose-500',
};

const barSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = false,
  color = 'brand',
  size = 'md',
  animated = true,
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const prefersReducedMotion = useReducedMotion();

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs font-semibold text-zinc-900 dark:text-white tabular-nums">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${barSizes[size]} bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden`}>
        <motion.div
          className={`${barSizes[size]} ${barColors[color]} rounded-full`}
          initial={animated && !prefersReducedMotion ? { width: 0 } : { width: `${clamped}%` }}
          animate={{ width: `${clamped}%` }}
          transition={animated && !prefersReducedMotion ? { duration: 0.6, ease: 'easeOut' } : { duration: 0 }}
        />
      </div>
    </div>
  );
};
