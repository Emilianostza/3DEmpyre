import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Camera, Plus } from 'lucide-react';
import { Breadcrumb } from '@/components/portal/Breadcrumb';
import { NotificationCenter } from '@/components/portal/NotificationCenter';
import DarkModeToggle from '@/components/DarkModeToggle';
import type { Asset, Project } from '@/types';

interface PortalTopBarProps {
  role: 'employee' | 'customer';
  onMenuToggle: () => void;
  projects: Project[];
  assets: Asset[];
  onNewProject?: () => void;
}

export const PortalTopBar: React.FC<PortalTopBarProps> = ({
  role,
  onMenuToggle,
  projects,
  assets,
  onNewProject,
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6 gap-4">
        {/* Left: hamburger (mobile) + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={t('portal.openMenu', 'Open menu')}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Breadcrumb className="hidden sm:flex mb-0" />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {role === 'customer' && (
            <Link
              to="/request"
              className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-brand-700 flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('cta.getQuote', 'Get a Free Quote')}</span>
            </Link>
          )}
          {role === 'employee' && onNewProject && (
            <button
              onClick={onNewProject}
              className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-brand-700 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('portal.newMenu', 'New Project')}</span>
            </button>
          )}
          <NotificationCenter projects={projects} assets={assets} />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
};
