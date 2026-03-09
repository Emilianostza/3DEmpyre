import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/contexts/ToastContext';

const SettingsSecurityPage: React.FC = () => {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();

  const [passwordSaving, setPasswordSaving] = useState(false);
  const passwordTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Clean up mock API timer on unmount
  useEffect(() => {
    return () => {
      if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
    };
  }, []);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const getPasswordStrength = (pw: string): { level: number; label: string; cls: string } => {
    if (!pw) return { level: 0, label: '', cls: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: t('portal.settings.passwordWeak', 'Weak'), cls: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: t('portal.settings.passwordFair', 'Fair'), cls: 'bg-orange-500' };
    if (score <= 3) return { level: 3, label: t('portal.settings.passwordGood', 'Good'), cls: 'bg-yellow-500' };
    return { level: 4, label: t('portal.settings.passwordStrong', 'Strong'), cls: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.new);

  const handleUpdatePassword = () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toastError(t('portal.toast.passwordFillAll'));
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toastError(t('portal.toast.passwordMismatch'));
      return;
    }

    if (passwordForm.new.length < 8) {
      toastError(t('portal.toast.passwordTooShort'));
      return;
    }

    // Simulate API call
    setPasswordSaving(true);
    if (passwordTimerRef.current) clearTimeout(passwordTimerRef.current);
    passwordTimerRef.current = setTimeout(() => {
      setPasswordSaving(false);
      success(t('portal.toast.passwordUpdated'));
      setPasswordForm({ current: '', new: '', confirm: '' });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {t('portal.settings.passwordSecurity')}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {t('portal.settings.passwordDesc')}
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('portal.settings.currentPassword')}
            </label>
            <input
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {t('portal.settings.newPassword')}
              </label>
              <input
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
              />
              {passwordForm.new && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className={`flex-1 rounded-full transition-colors ${seg <= passwordStrength.level ? passwordStrength.cls : ''}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {t('portal.settings.confirmPassword')}
              </label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpdatePassword}
              disabled={passwordSaving}
              className="px-6 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {passwordSaving ? t('portal.settings.updating') : t('portal.settings.updatePassword')}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">
                {t('portal.settings.2fa')}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {t('portal.settings.2faDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" aria-label={t('portal.settings.2fa')}>
              <input
                type="checkbox"
                className="sr-only peer"
                aria-label={t('portal.settings.toggle2fa', 'Toggle two-factor authentication')}
                checked={twoFactorEnabled}
                onChange={() => {
                  const newVal = !twoFactorEnabled;
                  setTwoFactorEnabled(newVal);
                  success(newVal ? t('portal.toast.2faEnabled') : t('portal.toast.2faDisabled'));
                }}
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSecurityPage;
