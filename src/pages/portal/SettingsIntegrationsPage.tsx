import { useTranslation } from 'react-i18next';
import { Plug, Webhook, Key } from 'lucide-react';
import { EmptyState } from '@/components/portal/EmptyState';

const INTEGRATIONS = [
  {
    key: 'api',
    icon: Key,
    i18nTitle: 'portal.settings.apiKeys',
    defaultTitle: 'API Keys',
    i18nDesc: 'portal.settings.apiKeysDesc',
    defaultDesc: 'Manage API keys for external integrations.',
  },
  {
    key: 'webhooks',
    icon: Webhook,
    i18nTitle: 'portal.settings.webhooks',
    defaultTitle: 'Webhooks',
    i18nDesc: 'portal.settings.webhooksDesc',
    defaultDesc: 'Configure webhook endpoints for real-time events.',
  },
  {
    key: 'services',
    icon: Plug,
    i18nTitle: 'portal.settings.connectedServices',
    defaultTitle: 'Connected Services',
    i18nDesc: 'portal.settings.connectedServicesDesc',
    defaultDesc: 'Connect third-party services like POS systems.',
  },
];

const SettingsIntegrationsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            {t('portal.settings.integrations', 'Integrations')}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t(
              'portal.settings.integrationsDesc',
              'Manage API keys, webhooks, and connected services.'
            )}
          </p>
        </div>
        <div className="p-6 space-y-4">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-4 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {t(item.i18nTitle, item.defaultTitle)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {t(item.i18nDesc, item.defaultDesc)}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[11px] font-semibold flex-shrink-0">
                {t('portal.comingSoon', 'Coming Soon')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <EmptyState
        icon={Plug}
        title={t('portal.settings.noIntegrations', 'No integrations yet')}
        description={t(
          'portal.settings.noIntegrationsDesc',
          'Integrations will be available in a future update.'
        )}
      />
    </div>
  );
};

export default SettingsIntegrationsPage;
