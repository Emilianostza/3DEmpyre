import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { portalFadeIn } from '@/components/motion/presets';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : portalFadeIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-zinc-400 dark:text-zinc-500" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};
