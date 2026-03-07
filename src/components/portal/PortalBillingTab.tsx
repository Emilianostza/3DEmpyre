import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  CreditCard,
  Plus,
  Puzzle,
  X,
  TrendingUp,
  Eye,
  Download,
  ShoppingBag,
  Receipt,
  Zap,
  ArrowUpRight,
  Shield,
  HardDrive,
  Paintbrush,
} from 'lucide-react';
import { Asset } from '@/types';

// ── Add-on metadata (mirrors RestaurantPricing) ──
const ADDON_META = [
  { key: 'a2', setup: 30, monthly: 2 },
  { key: 'a3', setup: 40, monthly: 2 },
  { key: 'a4', setup: 20, monthly: 2 },
  { key: 'a5', setup: 30, monthly: 5 },
  { key: 'a6', setup: 30, monthly: 5 },
  { key: 'a7', setup: 50, monthly: 5 },
  { key: 'a8', setup: 50, monthly: 5 },
  { key: 'a9', setup: 20, monthly: 2 },
  { key: 'a10', setup: 20, monthly: 2 },
  { key: 'a11', setup: 50, monthly: 10 },
  { key: 'a12', setup: 40, monthly: 2 },
  { key: 'a13', setup: 60, monthly: 5 },
] as const;

interface ModelSettings {
  forSale: boolean;
  price: number;
}

interface PortalBillingTabProps {
  assets: Asset[];
  proPlanFeatures: string[];
  setShowUpgradePlanModal: (v: boolean) => void;
}

// ── Stat Card ──
const StatCard: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => (
  <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-2xl p-4 flex items-center gap-3 ring-1 ring-black/5 dark:ring-white/10 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
    {icon && (
      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 shadow-inner">
        {icon}
      </div>
    )}
    <div className="min-w-0">
      <div className="text-xl font-bold text-zinc-900 dark:text-white font-serif-premium truncate">{value}</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium truncate">{label}</div>
    </div>
  </div>
);

// ── Section Wrapper ──
const Section: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, badge, children }) => (
  <div className="relative rounded-[2rem] overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl shadow-zinc-900/10 dark:shadow-black/40 mb-8">
    {/* Deep Glassmorphic Panel Background */}
    <div className="absolute inset-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl" />

    {/* Subtle Gradient Glows (Ambient) */}
    <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-500/10 dark:bg-brand-500/5 blur-[80px] rounded-full pointer-events-none" />

    <div className="relative z-10 hidden sm:block">
      <div className="px-8 py-6 flex justify-between items-center gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {icon && (
            <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-center flex-shrink-0 ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white font-serif-premium truncate">{title}</h2>
            {subtitle && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {badge}
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-50" />
    </div>

    {/* Mobile Header Version */}
    <div className="relative z-10 sm:hidden px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-center flex-shrink-0 ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
              {icon}
            </div>
          )}
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-serif-premium truncate">{title}</h2>
        </div>
        {badge}
      </div>
      {subtitle && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">{subtitle}</p>
      )}
    </div>

    <div className="relative z-10">
      {children}
    </div>
  </div>
);

export const PortalBillingTab: React.FC<PortalBillingTabProps> = ({
  assets,
  proPlanFeatures,
  setShowUpgradePlanModal,
}) => {
  const { t } = useTranslation();

  const [modelSettings, setModelSettings] = useState<Record<string, ModelSettings>>(() =>
    Object.fromEntries(
      assets.map((a) => [a.id, { forSale: a.status === 'Published', price: 20 }])
    )
  );

  const getSettings = (id: string): ModelSettings =>
    modelSettings[id] ?? { forSale: false, price: 20 };

  const toggleForSale = (id: string) =>
    setModelSettings((prev) => ({
      ...prev,
      [id]: { ...getSettings(id), forSale: !getSettings(id).forSale },
    }));

  const setPrice = (id: string, price: number) =>
    setModelSettings((prev) => ({
      ...prev,
      [id]: { ...getSettings(id), price: Math.max(0, price) },
    }));

  // Track which add-ons are active (simulated — some enabled by default)
  const [enabledAddons, setEnabledAddons] = useState<Record<string, boolean>>(() => ({
    a3: true,
    a5: true,
    a8: true,
  }));

  const toggleAddon = (key: string) =>
    setEnabledAddons((prev) => ({ ...prev, [key]: !prev[key] }));

  const addons = ADDON_META.map((meta) => ({
    ...meta,
    name: t(`restPricing.addons.${meta.key}.name`),
    detail: t(`restPricing.addons.${meta.key}.detail`),
    enabled: Boolean(enabledAddons[meta.key]),
  }));

  const activeAddonCount = addons.filter((a) => a.enabled).length;
  const addonMonthlyTotal = addons.filter((a) => a.enabled).reduce((sum, a) => sum + a.monthly, 0);

  // ── View usage computation ──
  const usage = useMemo(() => {
    const totalViews = assets.reduce((sum, a) => sum + (a.viewCount ?? 0), 0);
    const viewLimit = 2000;
    const usagePct = Math.min((totalViews / viewLimit) * 100, 100);
    const remaining = Math.max(viewLimit - totalViews, 0);
    const botEstimate = Math.round(totalViews * 0.023);
    const billableViews = totalViews - botEstimate;
    const overage = Math.max(billableViews - viewLimit, 0);
    const overageCharge =
      overage > 0 ? Math.min(overage, 10000) * 0.004 + Math.max(overage - 10000, 0) * 0.002 : 0;
    const projectedBill = 35 + overageCharge;
    return { totalViews, viewLimit, usagePct, remaining, botEstimate, billableViews, overage, overageCharge, projectedBill };
  }, [assets]);

  // ── Layout presets storage (reads localStorage) ──
  const layoutPresetsStorage = useMemo(() => {
    let totalBytes = 0;
    let presetCount = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('mc3d_layout_presets_')) {
          const value = localStorage.getItem(key);
          if (value) {
            totalBytes += new Blob([value]).size;
            try {
              const parsed = JSON.parse(value);
              presetCount += parsed.presets?.length ?? 0;
            } catch { /* malformed */ }
          }
        }
      }
    } catch { /* unavailable */ }
    return { totalBytes, presetCount };
  }, [assets]); // re-compute when page data refreshes

  // ── Storage usage computation ──
  const storage = useMemo(() => {
    const assetBytes = assets.reduce((sum, a) => sum + (a.file_size ?? 0), 0);
    const totalBytes = assetBytes + layoutPresetsStorage.totalBytes;
    const totalGB = totalBytes / (1024 ** 3);
    const limitGB = 8; // Pro plan: 8 GB
    const usagePct = Math.min((totalGB / limitGB) * 100, 100);
    const remainingGB = Math.max(limitGB - totalGB, 0);
    const modelCount = assets.length;
    return { totalBytes, totalGB, limitGB, usagePct, remainingGB, modelCount };
  }, [assets, layoutPresetsStorage.totalBytes]);

  // ── Sell models computation ──
  const sales = useMemo(() => {
    const listedAssets = assets.filter((a) => getSettings(a.id).forSale);
    const totalDownloads = assets.reduce((s, a) => s + (a.download_count ?? 0), 0);
    const totalRevenue = assets.reduce((s, a) => {
      const settings = getSettings(a.id);
      if (!settings.forSale) return s;
      return s + settings.price * (a.download_count ?? 0);
    }, 0);
    return { listedAssets, totalDownloads, totalRevenue };
  }, [assets, modelSettings]);

  // ── Invoice data ──
  const invoices = [
    { date: 'Feb 15, 2026', amount: '€35.00', invoice: 'INV-2026-02' },
    { date: 'Jan 15, 2026', amount: '€75.00', invoice: 'INV-2026-01', note: '€35 plan + €40 overage (10k views)' },
    { date: 'Dec 15, 2025', amount: '€135.00', invoice: 'INV-2025-12', note: '€35 plan + €100 on-site capture (1 visit + 5 models)' },
    { date: 'Nov 15, 2025', amount: '€35.00', invoice: 'INV-2025-11' },
    { date: 'Oct 15, 2025', amount: '€35.00', invoice: 'INV-2025-10' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ─── Current Plan ─── */}
      <Section
        title={t('portal.billing.currentPlan')}
        icon={<Zap className="w-5 h-5 text-amber-500" />}
        subtitle={`${t('portal.billing.onPlan')} ${t('portal.billing.proPlan')} · ${t('portal.billing.levelB')}`}
        badge={
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full transition-opacity opacity-50 group-hover:opacity-100" />
            <span className="relative px-4 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('portal.billing.active')}
            </span>
          </div>
        }
      >
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          {/* Price hero */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white font-serif-premium">€35</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">{t('portal.billing.perMonth')}</span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{t('portal.billing.viewsIncluded')}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 font-mono mt-1 mb-2">{t('portal.billing.overage')}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 mt-4 mb-8">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{t('portal.billing.nextBilling')}</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">March 15, 2026</span>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {proPlanFeatures.map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-3 bg-white/50 dark:bg-zinc-900/40 px-4 py-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{feat}</span>
              </div>
            ))}
          </div>

          {/* ── Add-ons ── */}
          <div className="pt-6 mt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                  <Puzzle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white font-serif-premium">
                  {t('restPricing.addons.heading', 'Extend your menu')}
                </h3>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-500/20 font-mono shadow-sm">
                {activeAddonCount} {t('portal.addons.active', 'active')} · €{addonMonthlyTotal}/mo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {addons.map((addon) => (
                <button
                  key={addon.key}
                  onClick={() => toggleAddon(addon.key)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-md ${addon.enabled
                    ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/5 hover:border-red-300 dark:hover:border-red-500/30'
                    : 'bg-white/50 dark:bg-white/[0.02] border-zinc-200/50 dark:border-white/[0.06] hover:border-amber-300 dark:hover:border-amber-500/30'
                    }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 shadow-sm ${addon.enabled
                      ? 'bg-emerald-500 text-white group-hover:bg-red-500 group-hover:scale-110'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 group-hover:scale-110'
                      }`}
                  >
                    {addon.enabled ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3] group-hover:hidden" />
                        <X className="w-3.5 h-3.5 stroke-[3] hidden group-hover:block" />
                      </>
                    ) : (
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-bold truncate transition-colors ${addon.enabled ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'
                        }`}
                    >
                      {addon.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium truncate mt-0.5">{addon.detail}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold font-mono text-zinc-900 dark:text-white">€{addon.monthly}/mo</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500 font-medium">€{addon.setup} setup</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Extra storage */}
            <div className="mt-3 flex items-center gap-4 px-5 py-4 rounded-2xl border bg-white/50 dark:bg-white/[0.02] border-zinc-200/50 dark:border-white/[0.06] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                <Plus className="w-3.5 h-3.5 text-zinc-400 stroke-[3]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {t('restPricing.addons.extraStorage', 'Extra storage')}
                </p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  {t('restPricing.addons.extraStorageDetail', '+10 GB per menu · hosted 3D models & textures')}
                </p>
              </div>
              <span className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                {t('restPricing.addons.extraStoragePrice', '€10/mo')}
              </span>
            </div>

            {/* Add-on summary bar */}
            {activeAddonCount > 0 && (
              <div className="mt-4 flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20 shadow-inner">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {activeAddonCount} add-on{activeAddonCount !== 1 ? 's' : ''} ·{' '}
                  <span className="font-bold">€{addonMonthlyTotal}/mo</span>{' '}
                  {t('portal.addons.addedToBill', 'added to your bill')}
                </p>
                <button className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white dark:text-black rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0">
                  {t('portal.addons.saveChanges', 'Save Changes')}
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setShowUpgradePlanModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/40 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              {t('portal.billing.upgradeUltra')}
            </button>
            <button className="px-6 py-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] shadow-sm rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.08] transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
              {t('portal.billing.changePlan')}
            </button>
            <button className="px-6 py-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] shadow-sm rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/20 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
              {t('portal.billing.cancel')}
            </button>
          </div>
        </div>
      </Section>

      {/* ─── View Usage ─── */}
      <Section
        title={t('portal.billing.viewUsage')}
        subtitle={t('portal.billing.currentCycle')}
        icon={<Eye className="w-5 h-5 text-brand-500" />}
      >
        <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-8">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">{t('portal.billing.viewsUsed')}</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                {usage.totalViews.toLocaleString()}{' '}
                <span className="text-zinc-500 dark:text-zinc-500 font-medium">/ {usage.viewLimit.toLocaleString()}</span>
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${usage.usagePct > 90
                  ? 'bg-gradient-to-r from-red-500 to-red-400'
                  : usage.usagePct > 70
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  }`}
                style={{ width: `${usage.usagePct}%` }}
              />
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-3">
              {usage.remaining > 0
                ? t('portal.billing.viewsRemaining', {
                  count: usage.remaining,
                  formattedCount: usage.remaining.toLocaleString(),
                  overage:
                    usage.overage > 0
                      ? t('portal.billing.overageAmount', { amount: usage.overageCharge.toFixed(2) })
                      : t('portal.billing.noOverage'),
                })
                : t('portal.billing.viewLimitReached', { amount: usage.overageCharge.toFixed(2) })}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label={t('portal.billing.totalViews')}
              value={usage.totalViews.toLocaleString()}
              icon={<Eye className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
            <StatCard
              label={t('portal.billing.billableViews')}
              value={usage.billableViews.toLocaleString()}
              icon={<TrendingUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
            <StatCard
              label={t('portal.billing.botsExcluded')}
              value={usage.botEstimate.toLocaleString()}
              icon={<Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
            <StatCard
              label={t('portal.billing.projectedBill')}
              value={`€${usage.projectedBill.toFixed(0)}`}
              icon={<Receipt className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
          </div>
        </div>
      </Section>

      {/* ─── Storage Usage ─── */}
      <Section
        title={t('portal.billing.storageUsage', 'Storage Usage')}
        subtitle={t('portal.billing.storageSubtitle', 'Current plan storage allocation')}
        icon={<HardDrive className="w-5 h-5 text-indigo-500" />}
      >
        <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-8">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                {t('portal.billing.storageUsed', 'Storage used')}
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                {storage.totalGB.toFixed(2)} GB{' '}
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">/ {storage.limitGB} GB</span>
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${storage.usagePct > 90
                  ? 'bg-gradient-to-r from-red-500 to-red-400'
                  : storage.usagePct > 70
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                  }`}
                style={{ width: `${storage.usagePct}%` }}
              />
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-3">
              {storage.remainingGB > 0
                ? t('portal.billing.storageRemaining', {
                  amount: storage.remainingGB.toFixed(2),
                  defaultValue: '{{amount}} GB remaining',
                })
                : t('portal.billing.storageFull', 'Storage limit reached — upgrade your plan or add extra storage')}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label={t('portal.billing.totalStorage', 'Total used')}
              value={storage.totalGB < 1 ? `${(storage.totalGB * 1024).toFixed(0)} MB` : `${storage.totalGB.toFixed(2)} GB`}
              icon={<HardDrive className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
            <StatCard
              label={t('portal.billing.storageLimit', 'Plan limit')}
              value={`${storage.limitGB} GB`}
              icon={<Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
            <StatCard
              label={t('portal.billing.modelCount', '3D models')}
              value={storage.modelCount.toString()}
              icon={<ShoppingBag className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
            <StatCard
              label={t('portal.billing.savedLayouts', 'Saved layouts')}
              value={layoutPresetsStorage.presetCount.toString()}
              icon={<Paintbrush className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
          </div>
        </div>
      </Section>

      {/* ─── Sell 3D Models ─── */}
      <Section
        title={t('portal.billing.sell3dModels', 'Sell 3D Models')}
        subtitle={t('portal.billing.sell3dModelsDesc', 'Let customers purchase and download your 3D model files (GLB). Set a price per model.')}
        icon={<ShoppingBag className="w-5 h-5 text-purple-500" />}
      >
        {/* Sales summary stats */}
        {assets.length > 0 && (
          <div className="grid grid-cols-3 gap-3 p-6 sm:px-8 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <StatCard
              label={t('portal.billing.modelsListed', 'Models listed')}
              value={`${sales.listedAssets.length} / ${assets.length}`}
              icon={<ShoppingBag className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
            <StatCard
              label={t('portal.billing.totalDownloads', 'Total downloads')}
              value={sales.totalDownloads.toLocaleString()}
              icon={<Download className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
            <StatCard
              label={t('portal.billing.totalRevenue', 'Total revenue')}
              value={`€${sales.totalRevenue.toLocaleString()}`}
              icon={<TrendingUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400 stroke-[2.5]" />}
            />
          </div>
        )}

        {/* Column header */}
        {assets.length > 0 && (
          <div className="flex items-center justify-between px-6 sm:px-8 py-3 bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200/50 dark:border-zinc-800/50 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <span>{t('portal.billing.model', 'Model')}</span>
            <div className="flex items-center" style={{ width: '280px' }}>
              <span className="w-[80px] text-right">{t('portal.billing.price', 'Price')}</span>
              <span className="w-[60px] text-right">{t('portal.billing.sold', 'Sold')}</span>
              <span className="w-[84px] text-center">{t('portal.billing.statusLabel', 'Status')}</span>
              <span className="w-[56px] text-center">{t('portal.billing.onOff', 'On/Off')}</span>
            </div>
          </div>
        )}

        <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 p-2">
          {assets.length === 0 ? (
            <div className="p-12 text-center text-sm font-medium text-zinc-500">
              {t('portal.billing.noModels', 'No 3D models yet.')}
            </div>
          ) : (
            assets.map((asset) => {
              const { forSale, price } = getSettings(asset.id);
              const sold = asset.download_count ?? 0;

              return (
                <div
                  key={asset.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-4 sm:px-6 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 rounded-2xl transition-all duration-300 gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {asset.thumb && (
                      <img
                        src={asset.thumb}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10 shadow-sm flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">{asset.name}</div>
                      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                        GLB · {asset.size ?? t('portal.billing.readyToSell', 'Ready to sell')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start flex-shrink-0 sm:w-[280px] bg-zinc-50 sm:bg-transparent dark:bg-zinc-900 sm:dark:bg-transparent rounded-xl p-3 sm:p-0">
                    {/* Price */}
                    <div className="flex items-center gap-1.5 w-[80px] justify-end">
                      <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500">€</span>
                      <input
                        type="number"
                        min={0}
                        step={5}
                        value={price}
                        onChange={(e) => setPrice(asset.id, Number(e.target.value))}
                        className="w-16 text-sm font-bold font-mono text-right bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-2 py-1.5 text-zinc-900 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
                        aria-label={`Price for ${asset.name}`}
                      />
                    </div>

                    {/* Sold count */}
                    <div className="w-[60px] text-right">
                      <span className="text-sm font-bold font-mono text-zinc-900 dark:text-white">{sold}</span>
                    </div>

                    {/* Status badge */}
                    <div className="w-[84px] flex justify-center">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap shadow-sm ${forSale
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.06]'
                          }`}
                      >
                        {forSale
                          ? t('portal.billing.forSale', 'For sale')
                          : t('portal.billing.notListed', 'Not listed')}
                      </span>
                    </div>

                    {/* Toggle */}
                    <div className="w-[56px] flex justify-end">
                      <button
                        role="switch"
                        aria-checked={forSale}
                        onClick={() => toggleForSale(asset.id)}
                        aria-label={`${forSale ? 'Stop selling' : 'Start selling'} ${asset.name}`}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${forSale ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
                          }`}
                      >
                        <span aria-hidden="true" className="pointer-events-none absolute h-full w-full rounded-md bg-transparent" />
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${forSale ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Section>

      {/* ─── Payment Method ─── */}
      <Section
        title={t('portal.billing.paymentMethod')}
        icon={<CreditCard className="w-5 h-5 text-indigo-500" />}
      >
        <div className="p-6 sm:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.06] hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="w-14 h-10 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                <CreditCard className="w-6 h-6 text-zinc-700 dark:text-zinc-300 stroke-[1.5]" />
              </div>
              <div>
                <div className="font-bold text-zinc-900 dark:text-white font-mono tracking-tight text-sm">{t('portal.billing.cardEnding')}</div>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{t('portal.billing.visaExpires')}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 border-t sm:border-0 border-zinc-200 dark:border-zinc-800/50 pt-4 sm:pt-0">
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                {t('portal.billing.default')}
              </span>
              <button className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">
                {t('portal.billing.edit')}
              </button>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 px-2 py-2 transition-colors rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-500/10">
            <Plus className="w-4 h-4 stroke-[3]" />
            {t('portal.billing.addPayment')}
          </button>
        </div>
      </Section>

      {/* ─── Invoice History ─── */}
      <Section
        title={t('portal.billing.invoiceHistory')}
        icon={<Receipt className="w-5 h-5 text-rose-500" />}
      >
        <div className="p-2 sm:p-4 divide-y divide-zinc-100 dark:divide-white/[0.04]">
          {invoices.map((inv) => (
            <div
              key={inv.invoice}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors gap-3 sm:gap-0"
            >
              <div>
                <div className="text-sm font-bold text-zinc-900 dark:text-white">{inv.invoice}</div>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                  <span>{inv.date}</span>
                  {inv.note && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span className="truncate max-w-[200px] sm:max-w-md">{inv.note}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-5 bg-zinc-50 sm:bg-transparent dark:bg-zinc-900/50 sm:dark:bg-transparent p-3 sm:p-0 rounded-lg">
                <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">{inv.amount}</span>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                  {t('portal.billing.paid')}
                </span>
                <button className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-brand-500 hover:border-brand-500/30 transition-all shadow-sm group">
                  <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="sr-only">{t('portal.billing.download')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};
