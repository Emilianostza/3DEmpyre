import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Bell, Shield } from 'lucide-react';
import { usePortalContext } from '@/types/portal';

interface SettingsLayoutProps {
  role: 'employee' | 'customer';
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ role: _role }) => {
  const { t } = useTranslation();
  const portalContext = usePortalContext();

  const settingsNavItems = [
    {
      path: 'profile',
      label: t('portal.settings.profile'),
      icon: User,
    },
    {
      path: 'security',
      label: t('portal.settings.security'),
      icon: Shield,
    },
    {
      path: 'notifications',
      label: t('portal.settings.notifications'),
      icon: Bell,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
        {t('portal.tab.settings', 'Settings')}
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-card border border-zinc-200 dark:border-zinc-800 overflow-hidden sticky top-8">
            <nav className="flex flex-col p-2 space-y-1">
              {settingsNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
        <div className="flex-1 space-y-6">
          <Outlet context={portalContext} />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
