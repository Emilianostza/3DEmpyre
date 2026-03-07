import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndustryPortalConfig } from '@/types';

interface KPIValues {
  activeProjects: number;
  inReview: number;
  published: number;
}

interface Props {
  config: IndustryPortalConfig;
  values: KPIValues;
}

export const IndustryKPIStrip: React.FC<Props> = ({ config, values }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3">
      {config.kpis.map((kpi, index) => {
        const Icon = kpi.iconComponent;
        const value = values[kpi.valueKey];

        return (
          <div
            key={index}
            className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow min-w-[140px]"
          >
            <div className={`w-9 h-9 rounded-lg ${kpi.colorBg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${kpi.colorText}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${kpi.colorText} leading-none`}>{value}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
                {t(kpi.label)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
