import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import type { Asset, Project } from '@/types';

interface Props {
  assets: Asset[];
  projects: Project[];
}

export const ReviewBanner: React.FC<Props> = ({ assets, projects }) => {
  const { t } = useTranslation();

  const reviewAssets = assets.filter((a) => a.status === 'In Review');
  const reviewCount = reviewAssets.length;

  if (reviewCount === 0) return null;

  const targetProject = projects.find((p) => reviewAssets.some((a) => a.project_id === p.id));
  const targetPath = targetProject ? `/project/${targetProject.id}/menu/edit?tab=review` : '#';

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      <span className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex-1">
        {t('portal.reviewBanner.title', { count: reviewCount })}
      </span>
      <Link
        to={targetPath}
        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
      >
        {t('portal.reviewBanner.action')}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
