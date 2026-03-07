import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Crown, Check, ArrowRight } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { BaseModal } from '@/components/common/BaseModal';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { success } = useToast();
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<'ultra' | 'enterprise'>('ultra');

  // Ultra features
  const ultraFeatures = [
    t('portal.upgrade.ultraFeat1'),
    t('portal.upgrade.ultraFeat2'),
    t('portal.upgrade.ultraFeat3'),
    t('portal.upgrade.ultraFeat4'),
    t('portal.upgrade.ultraFeat5'),
  ];

  // Enterprise features
  const enterpriseFeatures = [
    t('portal.upgrade.entFeat1'),
    t('portal.upgrade.entFeat2'),
    t('portal.upgrade.entFeat3'),
    t('portal.upgrade.entFeat4'),
    t('portal.upgrade.entFeat5'),
  ];

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      aria-labelledby="upgrade-plan-title"
    >
      <div>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div>
            <h2 id="upgrade-plan-title" className="text-xl font-bold text-zinc-900 dark:text-white">
              {t('portal.upgrade.title')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t('portal.upgrade.currentPlan')}{' '}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {t('portal.billing.proPlan')}
              </span>
              {t('portal.upgrade.chooseTier')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tier cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ultra */}
          <button
            onClick={() => setSelectedUpgradeTier('ultra')}
            className={`relative text-left p-5 rounded-xl border-2 transition-all focus:outline-none ${
              selectedUpgradeTier === 'ultra'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500 text-white whitespace-nowrap">
              {t('portal.upgrade.recommended')}
            </span>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                selectedUpgradeTier === 'ultra'
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Star className="w-4 h-4" />
            </div>
            <p className="font-bold text-zinc-900 dark:text-white text-sm mb-0.5">
              {t('portal.upgrade.ultra')}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-snug">
              {t('portal.upgrade.ultraDesc')}
            </p>
            <div className="flex items-baseline gap-0.5 mb-3">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {t('portal.upgrade.ultraPrice')}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {t('portal.upgrade.perMenu')}
              </span>
            </div>
            <ul className="space-y-1.5">
              {ultraFeatures.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {selectedUpgradeTier === 'ultra' && (
              <div className="absolute top-3 right-3">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </button>

          {/* Enterprise */}
          <button
            onClick={() => setSelectedUpgradeTier('enterprise')}
            className={`relative text-left p-5 rounded-xl border-2 transition-all focus:outline-none ${
              selectedUpgradeTier === 'enterprise'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                selectedUpgradeTier === 'enterprise'
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Crown className="w-4 h-4" />
            </div>
            <p className="font-bold text-zinc-900 dark:text-white text-sm mb-0.5">
              {t('portal.upgrade.enterprise')}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-snug">
              {t('portal.upgrade.enterpriseDesc')}
            </p>
            <div className="flex items-baseline gap-0.5 mb-3">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {t('portal.upgrade.custom')}
              </span>
            </div>
            <ul className="space-y-1.5">
              {enterpriseFeatures.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {selectedUpgradeTier === 'enterprise' && (
              <div className="absolute top-3 right-3">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </button>
        </div>

        {/* CTA footer */}
        <div className="px-6 pb-6">
          <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {selectedUpgradeTier === 'ultra'
                  ? t('portal.upgrade.ultraSummary')
                  : t('portal.upgrade.entSummary')}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {selectedUpgradeTier === 'ultra'
                  ? t('portal.upgrade.ultraBilling')
                  : t('portal.upgrade.entBilling')}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {t('portal.upgrade.notNow')}
              </button>
              <button
                onClick={() => {
                  onClose();
                  success(
                    selectedUpgradeTier === 'ultra'
                      ? t('portal.toast.upgradeUltra')
                      : t('portal.toast.upgradeEnterprise')
                  );
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                {selectedUpgradeTier === 'ultra'
                  ? t('portal.upgrade.upgradeToUltra')
                  : t('portal.upgrade.contactSales')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
