import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
  icon: Icon,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4.5 h-4.5 text-zinc-600 dark:text-zinc-400" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white truncate">{title}</h2>
          {description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
