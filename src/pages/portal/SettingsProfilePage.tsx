import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePortalContext } from '@/types/portal';
import { useToast } from '@/contexts/ToastContext';

const SettingsProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { role } = usePortalContext();
  const { success } = useToast();
  const [profileSaving, setProfileSaving] = useState(false);

  const [fullName, setFullName] = useState(role === 'employee' ? 'Admin User' : 'Valued Client');
  const [email, setEmail] = useState(role === 'employee' ? 'admin@example.com' : 'client@example.com');
  const [phone, setPhone] = useState('+1 (555) 000-0000');
  const [company, setCompany] = useState('Acme Corp');

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setProfileSaving(false);
    success(t('portal.toast.profileUpdated'));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          {t('portal.settings.profileInfo')}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          {t('portal.settings.profileDesc')}
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-700">
          <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-2xl font-bold border-4 border-white dark:border-zinc-900 shadow-sm">
            {role === 'employee' ? 'AD' : 'CL'}
          </div>
          <div>
            <button className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              {t('portal.settings.changeAvatar')}
            </button>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              {t('portal.settings.avatarHint')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="profile-fullname" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('portal.settings.fullName')}
            </label>
            <input
              id="profile-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('portal.settings.email')}
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <div>
            <label htmlFor="profile-phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('portal.settings.phone')}
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <div>
            <label htmlFor="profile-company" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('portal.settings.company')}
            </label>
            <input
              id="profile-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSaveProfile}
            disabled={profileSaving}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-500/30"
          >
            {profileSaving ? t('portal.settings.saving') : t('portal.settings.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfilePage;
