import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { portalCardEnter } from '@/components/motion/presets';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ElementType;
  trend?: { value: number; direction: 'up' | 'down' | 'flat' };
  color?: 'brand' | 'emerald' | 'amber' | 'rose' | 'sky';
  loading?: boolean;
  onClick?: () => void;
}

const colorMap = {
  brand: {
    bg: 'bg-brand-50 dark:bg-brand-900/20',
    text: 'text-brand-600 dark:text-brand-400',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-600 dark:text-rose-400',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-600 dark:text-sky-400',
  },
};

const trendColors = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  flat: 'text-zinc-500 dark:text-zinc-400',
};

const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'flat' }) => {
  if (direction === 'up') return <TrendingUp className="w-3.5 h-3.5" />;
  if (direction === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  color = 'brand',
  loading,
  onClick,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const numericValue = typeof value === 'number' ? value : null;
  const displayValue = useCountUp({ end: numericValue ?? 0, duration: 600 });
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="w-20 h-3 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="w-16 h-7 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : portalCardEnter}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-5 transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700' : ''
      }`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-2 sm:mb-3">
        {Icon && (
          <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${colors.text}`} />
          </div>
        )}
        <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 leading-tight">
          {label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white font-display tabular-nums">
          {numericValue !== null ? displayValue : value}
        </span>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColors[trend.direction]}`}>
            <TrendIcon direction={trend.direction} />
            <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
