import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, ArrowRight } from 'lucide-react';

const SettingsBillingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="p-8 text-center">
        <CreditCard className="w-10 h-10 text-zinc-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
          {t('portal.settings.billingSubscription')}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
          {t('portal.settings.billingRedirectDesc')}
        </p>
        <Link
          to="../../billing"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          {t('portal.settings.goToBilling')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default SettingsBillingPage;
