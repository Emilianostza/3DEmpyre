import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Settings2,
  User,
  Palette,
  Bell,
  Shield,
  Plug,
  CreditCard,
} from 'lucide-react';
import { usePortalContext } from '@/types/portal';

interface SettingsLayoutProps {
  role: 'employee' | 'customer';
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ role }) => {
  const { t } = useTranslation();
  const portalContext = usePortalContext();

  const settingsNavItems = [
    {
      path: 'general',
      label: t('portal.settings.general', 'General'),
      icon: Settings2,
    },
    {
      path: 'profile',
      label: t('portal.settings.profile', 'Profile'),
      icon: User,
    },
    {
      path: 'appearance',
      label: t('portal.settings.appearance', 'Appearance'),
      icon: Palette,
    },
    {
      path: 'notifications',
      label: t('portal.settings.notifications', 'Notifications'),
      icon: Bell,
    },
    {
      path: 'security',
      label: t('portal.settings.security', 'Security'),
      icon: Shield,
    },
    {
      path: 'integrations',
      label: t('portal.settings.integrations', 'Integrations'),
      icon: Plug,
    },
    ...(role === 'customer'
      ? [
          {
            path: 'billing',
            label: t('portal.settings.billing', 'Billing'),
            icon: CreditCard,
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
        {t('portal.tab.settings', 'Settings')}
      </h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden sticky top-8">
            <nav className="flex flex-col p-1.5 space-y-0.5">
              {settingsNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          <Outlet context={portalContext} />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
