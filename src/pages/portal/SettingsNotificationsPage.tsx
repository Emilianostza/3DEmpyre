import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useToast } from '@/contexts/ToastContext';

const SettingsNotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { success } = useToast();

  const [notificationPrefs, setNotificationPrefs] = useState({
    projectUpdates: true,
    newMessages: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  const notifItems = [
    {
      key: 'projectUpdates' as const,
      title: t('portal.settings.projectUpdates'),
      desc: t('portal.settings.projectUpdatesDesc'),
    },
    {
      key: 'newMessages' as const,
      title: t('portal.settings.newMessages'),
      desc: t('portal.settings.newMessagesDesc'),
    },
    {
      key: 'marketingEmails' as const,
      title: t('portal.settings.marketingEmails'),
      desc: t('portal.settings.marketingEmailsDesc'),
    },
    {
      key: 'securityAlerts' as const,
      title: t('portal.settings.securityAlerts'),
      desc: t('portal.settings.securityAlertsDesc'),
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {t('portal.settings.notifPrefs')}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          {t('portal.settings.notifDesc')}
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {notifItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700 last:border-0 last:pb-0"
            >
              <div>
                <div className="font-medium text-zinc-900 dark:text-white">{item.title}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  aria-label={item.title}
                  checked={notificationPrefs[item.key]}
                  onChange={() => {
                    const newVal = !notificationPrefs[item.key];
                    setNotificationPrefs((prev) => ({ ...prev, [item.key]: newVal }));
                    success(
                      `${item.title} ${newVal ? t('portal.settings.enabled') : t('portal.settings.disabled')}.`
                    );
                  }}
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
              <Sun className="w-5 h-5 text-amber-500 hidden dark:block" />
              <Moon className="w-5 h-5 text-zinc-500 dark:hidden" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-zinc-900 dark:text-white mb-1">
                {t('portal.settings.interfaceTheme')}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                {t('portal.settings.themeDesc')}
              </p>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsNotificationsPage;
