import { useTranslation } from 'react-i18next';
import { usePortalContext } from '@/types/portal';
import { PortalBillingTab } from '@/components/portal/PortalBillingTab';

const BillingPage: React.FC = () => {
  const { t } = useTranslation();
  const { assets, setShowUpgradePlanModal } = usePortalContext();

  const proPlanFeatures = [
    t('portal.billing.feat.unlimited'),
    t('portal.billing.feat.levelB'),
    t('portal.billing.feat.qr'),
    t('portal.billing.feat.printable'),
    t('portal.billing.feat.analytics'),
    t('portal.billing.feat.support'),
  ];

  return (
    <PortalBillingTab
      assets={assets}
      proPlanFeatures={proPlanFeatures}
      setShowUpgradePlanModal={setShowUpgradePlanModal}
    />
  );
};

export default BillingPage;
