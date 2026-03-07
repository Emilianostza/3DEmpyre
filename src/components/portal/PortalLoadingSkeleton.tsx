import React from 'react';
import Skeleton, { SkeletonCard, SkeletonRow } from '@/components/Skeleton';

export const PortalLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <Skeleton className="w-16 h-16" rounded="xl" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-56" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-36" rounded="xl" />
            <Skeleton className="h-12 w-24" rounded="xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-200/50 dark:border-white/5 p-8 shadow-2xl shadow-black/5 space-y-2">
          {[...Array(6)].map((_, i) => (
            <SkeletonRow key={i} cols={6} />
          ))}
        </div>
      </div>
    </div>
  );
};
