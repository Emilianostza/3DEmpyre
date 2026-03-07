import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndustryPortalConfig } from '@/types';

interface Props {
  config: IndustryPortalConfig;
  userName: string;
}

export const IndustryHeader: React.FC<Props> = ({ config, userName }) => {
  const { t } = useTranslation();
  const Icon = config.theme.iconComponent;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6">
      {/* Gradient accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${config.theme.gradient}`} />

      <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-zinc-900">
        {/* Industry icon */}
        <div
          className={`w-12 h-12 rounded-xl ${config.theme.accentBg} ${config.theme.accentBgDark} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${config.theme.accentText} ${config.theme.accentTextDark}`} />
        </div>

        {/* Welcome text */}
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
            {t(config.labels.welcome)}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{userName}</p>
        </div>
      </div>
    </div>
  );
};
