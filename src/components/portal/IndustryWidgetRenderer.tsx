import React from 'react';
import { useTranslation } from 'react-i18next';
import { Asset, Project, IndustryPortalConfig } from '@/types';
import { ProjectProgress } from './ProjectProgress';
import { AssetGrid } from './AssetGrid';

interface Props {
  config: IndustryPortalConfig;
  assets: Asset[];
  projects: Project[];
  onApproveAsset: (assetId: string) => Promise<void>;
  onRequestRevision: (assetId: string, feedback: string) => Promise<void>;
}

export const IndustryWidgetRenderer: React.FC<Props> = ({
  config,
  assets,
  projects,
  onApproveAsset: _onApproveAsset,
  onRequestRevision: _onRequestRevision,
}) => {
  const { t } = useTranslation();

  const widgetMap: Record<string, React.ReactNode> = {
    projectProgress: <ProjectProgress key="projectProgress" projects={projects} assets={assets} />,
    assetGrid: (
      <div key="assetGrid">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
          {t(config.labels.assets)}
        </h2>
        <AssetGrid assets={assets} role="customer" />
      </div>
    ),
  };

  return (
    <>
      {config.widgets.map((widgetId) => (
        <React.Fragment key={widgetId}>{widgetMap[widgetId] || null}</React.Fragment>
      ))}
    </>
  );
};
