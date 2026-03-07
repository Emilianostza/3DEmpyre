import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/** Single skeleton block — animated shimmer. */
const Skeleton: React.FC<SkeletonProps> = ({ className = '', rounded = 'md' }) => {
  const radii = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={`
        animate-shimmer
        bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800
        bg-[length:800px_100%]
        ${radii[rounded]}
        ${className}
      `}
      aria-hidden="true"
    />
  );
};

/** Pre-built skeleton for a text line. */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2.5 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`} />
    ))}
  </div>
);

/** Pre-built skeleton for a card. */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-2xl border border-zinc-800 p-5 space-y-4 ${className}`}>
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 flex-shrink-0" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" rounded="full" />
      <Skeleton className="h-8 w-16" rounded="full" />
    </div>
  </div>
);

/** Pre-built skeleton for a table row. */
export const SkeletonRow: React.FC<{ cols?: number; className?: string }> = ({
  cols = 4,
  className = '',
}) => (
  <div className={`flex items-center gap-4 py-3 ${className}`}>
    {Array.from({ length: cols }).map((_, i) => (
      <Skeleton key={i} className={`h-4 flex-1 ${i === 0 ? 'max-w-[40px]' : ''}`} />
    ))}
  </div>
);

/** Pre-built skeleton for an avatar + name. */
export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const s = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  const text = { sm: 'h-3', md: 'h-4', lg: 'h-5' };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton className={`${s[size]} flex-shrink-0`} rounded="full" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className={`${text[size]} w-24`} />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

export default React.memo(Skeleton);
