import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useToast } from '@/contexts/ToastContext';

const BRAND_COLORS = [
  { value: 'violet', hex: '#7c3aed', label: 'Violet' },
  { value: 'blue', hex: '#2563eb', label: 'Blue' },
  { value: 'emerald', hex: '#059669', label: 'Emerald' },
  { value: 'rose', hex: '#e11d48', label: 'Rose' },
  { value: 'amber', hex: '#d97706', label: 'Amber' },
  { value: 'slate', hex: '#475569', label: 'Slate' },
];

const SettingsAppearancePage: React.FC = () => {
  const { t } = useTranslation();
  const { success } = useToast();
  const [selectedColor, setSelectedColor] = useState('violet');
  const [compactMode, setCompactMode] = useState(false);

  const handleSave = async () => {
    success(t('portal.toast.appearanceSaved', 'Appearance saved'));
  };

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            {t('portal.settings.theme', 'Theme')}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t('portal.settings.themeDesc', 'Choose your preferred color scheme.')}
          </p>
        </div>
        <div className="p-6">
          <DarkModeToggle />
        </div>
      </div>

      {/* Brand Color */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            {t('portal.settings.brandColor', 'Brand Color')}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t('portal.settings.brandColorDesc', 'Select your primary accent color.')}
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {BRAND_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setSelectedColor(c.value);
                  handleSave();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedColor === c.value
                    ? 'border-zinc-900 dark:border-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}
                style={
                  selectedColor === c.value
                    ? { '--tw-ring-color': c.hex } as React.CSSProperties
                    : undefined
                }
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-zinc-700 dark:text-zinc-300">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Preferences */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            {t('portal.settings.layoutPrefs', 'Layout Preferences')}
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                {t('portal.settings.compactMode', 'Compact Mode')}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t(
                  'portal.settings.compactModeDesc',
                  'Reduce spacing and padding for a denser layout.'
                )}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                aria-label={t('portal.settings.compactMode', 'Compact Mode')}
                checked={compactMode}
                onChange={() => {
                  setCompactMode(!compactMode);
                  success(
                    !compactMode
                      ? t('portal.settings.compactEnabled', 'Compact mode enabled')
                      : t('portal.settings.compactDisabled', 'Compact mode disabled')
                  );
                }}
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAppearancePage;
