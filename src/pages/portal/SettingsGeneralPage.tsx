import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePortalContext } from '@/types/portal';
import { useToast } from '@/contexts/ToastContext';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

const INDUSTRIES = [
  { value: 'restaurant', label: 'Restaurant / Food Service' },
  { value: 'retail', label: 'Retail / E-Commerce' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' },
];

const SettingsGeneralPage: React.FC = () => {
  const { t } = useTranslation();
  const { role } = usePortalContext();
  const { success } = useToast();
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState(
    role === 'employee' ? '3D Empyre' : 'Acme Restaurant'
  );
  const [industry, setIndustry] = useState('restaurant');
  const [timezone, setTimezone] = useState('America/New_York');
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    success(t('portal.toast.settingsSaved', 'Settings saved'));
  };

  const inputCls =
    'w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm';
  const labelCls = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5';

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
          {t('portal.settings.general', 'General')}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {t('portal.settings.generalDesc', 'Manage your organization settings and preferences.')}
        </p>
      </div>
      <div className="p-6 space-y-5">
        {/* Company Name */}
        <div>
          <label htmlFor="settings-company" className={labelCls}>
            {t('portal.settings.companyName', 'Company Name')}
          </label>
          <input
            id="settings-company"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Industry */}
          <div>
            <label htmlFor="settings-industry" className={labelCls}>
              {t('portal.settings.industry', 'Industry')}
            </label>
            <select
              id="settings-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={inputCls}
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="settings-timezone" className={labelCls}>
              {t('portal.settings.timezone', 'Timezone')}
            </label>
            <select
              id="settings-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={inputCls}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="settings-language" className={labelCls}>
              {t('portal.settings.language', 'Language')}
            </label>
            <select
              id="settings-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={inputCls}
            >
              <option value="en">English</option>
              <option value="es">Espa\u00f1ol</option>
              <option value="fr">Fran\u00e7ais</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="settings-currency" className={labelCls}>
              {t('portal.settings.currency', 'Default Currency')}
            </label>
            <select
              id="settings-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={inputCls}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving
              ? t('portal.settings.saving', 'Saving...')
              : t('portal.settings.saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsGeneralPage;
