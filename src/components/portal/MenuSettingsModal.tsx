import React, { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { X, Save, Palette, Type, Clock } from 'lucide-react';

interface MenuSettings {
  title: string;
  brandColor: string;
  font: string;
  themePreset?: string;
  customBrandColor?: string;
  showPrices: boolean;
  currency: string;
  hours?: string;
  enableTimeBasedMenu?: boolean;
  breakfastEndTime?: string;
  lunchEndTime?: string;
  lunchMenuId?: string;
  dinnerMenuId?: string;
}

interface MenuSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: MenuSettings;
  projects?: { id: string; name: string }[];
  onSave: (settings: MenuSettings) => void;
}

const THEME_PRESETS = [
  { id: 'amber', label: 'Warm Amber', brandColor: '#d97706', bg: '#09090b', surface: '#18181b', accent: '#fbbf24' },
  { id: 'slate', label: 'Cool Slate', brandColor: '#6366f1', bg: '#0f172a', surface: '#1e293b', accent: '#818cf8' },
  { id: 'emerald', label: 'Emerald', brandColor: '#059669', bg: '#022c22', surface: '#064e3b', accent: '#34d399' },
  { id: 'rose', label: 'Rose', brandColor: '#e11d48', bg: '#0c0a09', surface: '#1c1917', accent: '#fb7185' },
  { id: 'purple', label: 'Royal', brandColor: '#7c3aed', bg: '#0a0015', surface: '#1a0a2e', accent: '#a78bfa' },
];

export const MenuSettingsModal: React.FC<MenuSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  projects = [],
  onSave,
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<MenuSettings>(currentSettings);

  // Reset form state only when the modal opens, not on every currentSettings change
  useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEscapeKey(
    useCallback(() => onClose(), [onClose]),
    isOpen
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-settings-title"
    >
      <div
        className="absolute inset-0 bg-transparent pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={trapRef}
        className="relative pointer-events-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-modal w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 id="menu-settings-title" className="text-lg font-bold text-zinc-900 dark:text-white">
            {t('portal.menuSettings.title')}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Type className="w-3.5 h-3.5" /> {t('portal.menuSettings.general')}
            </h3>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t('portal.menuSettings.menuTitle')}
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" /> {t('portal.menuSettings.appearance', 'Appearance')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t('portal.menuSettings.themePreset', 'Theme Preset')}
                </label>
                <select
                  value={settings.themePreset || 'amber'}
                  onChange={(e) => setSettings({ ...settings, themePreset: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                >
                  {THEME_PRESETS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t('portal.menuSettings.brandColor', 'Custom Brand Color')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.customBrandColor || settings.brandColor || '#d97706'}
                    onChange={(e) => setSettings({ ...settings, customBrandColor: e.target.value, brandColor: e.target.value })}
                    className="w-10 h-10 p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={settings.customBrandColor || settings.brandColor || '#d97706'}
                    onChange={(e) => setSettings({ ...settings, customBrandColor: e.target.value, brandColor: e.target.value })}
                    placeholder="#HEX"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all uppercase"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t('portal.menuSettings.currency')}
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="¥">JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Time-Based Menu Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> {t('portal.menuSettings.timeBasedMenu', 'Time-Based Menu')}
            </h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {t('portal.menuSettings.enableTimeBased', 'Enable Breakfast / Dinner Switch')}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                  Automatically switch menu based on tags. Use ?override=breakfast to bypass.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.enableTimeBasedMenu || false}
                  onChange={(e) => setSettings({ ...settings, enableTimeBasedMenu: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>
            {settings.enableTimeBasedMenu && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 mt-2">
                    {t('portal.menuSettings.breakfastEnd', 'Breakfast Ends At')}
                  </label>
                  <input
                    type="time"
                    value={settings.breakfastEndTime || '11:00'}
                    onChange={(e) => setSettings({ ...settings, breakfastEndTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 mt-2">
                    {t('portal.menuSettings.lunchEnd', 'Lunch Ends At')}
                  </label>
                  <input
                    type="time"
                    value={settings.lunchEndTime || '16:00'}
                    onChange={(e) => setSettings({ ...settings, lunchEndTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 text-xs text-zinc-500 mt-1 mb-2">
                  Dinner begins automatically after Lunch ends.
                </div>

                {projects.length > 0 && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 mt-2">
                        {t('portal.menuSettings.lunchRedirect', 'Forward to Lunch Menu')}
                      </label>
                      <select
                        value={settings.lunchMenuId || ''}
                        onChange={(e) => setSettings({ ...settings, lunchMenuId: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white"
                      >
                        <option value="">{t('portal.menuSettings.noRedirect', '-- Do not forward --')}</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 mt-2">
                        {t('portal.menuSettings.dinnerRedirect', 'Forward to Dinner Menu')}
                      </label>
                      <select
                        value={settings.dinnerMenuId || ''}
                        onChange={(e) => setSettings({ ...settings, dinnerMenuId: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white"
                      >
                        <option value="">{t('portal.menuSettings.noRedirect', '-- Do not forward --')}</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {t('portal.menuSettings.showPrices')}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                  {t('portal.menuSettings.showPricesDescription')}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showPrices}
                  onChange={(e) => setSettings({ ...settings, showPrices: e.target.checked })}
                  className="sr-only peer"
                  aria-label={t('portal.menuSettings.showPrices')}
                />
                <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {t('portal.menuSettings.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-500 flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" /> {t('portal.menuSettings.saveSettings')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
