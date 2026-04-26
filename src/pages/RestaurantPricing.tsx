import React, { useState } from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import {
  Check,
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  BarChart2,
  CreditCard,
  Users,
  Globe,
  Box,
  MapPin,
  Plus,
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Accordion from '@/components/Accordion';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/common/StructuredData';

// ─── Plans META (non-translatable data only) ─────────────────────────────────

interface PlanMeta {
  id: 'standard' | 'pro' | 'ultra';
  monthlyPrice: number;
  annualPrice: number;
  qualityLevel: 'A' | 'B' | 'C';
  storage: string;
  includedViews: number;
  featureCount: number;
  highlighted?: boolean;
}

const PLAN_META: PlanMeta[] = [
  {
    id: 'standard',
    monthlyPrice: 18,
    annualPrice: 180,
    qualityLevel: 'A',
    storage: '1 GB',
    includedViews: 1000,
    featureCount: 5,
  },
  {
    id: 'pro',
    monthlyPrice: 35,
    annualPrice: 350,
    qualityLevel: 'B',
    storage: '3 GB',
    includedViews: 2000,
    featureCount: 6,
    highlighted: true,
  },
  {
    id: 'ultra',
    monthlyPrice: 48,
    annualPrice: 480,
    qualityLevel: 'C',
    storage: '8 GB',
    includedViews: 3000,
    featureCount: 6,
  },
];

// ─── Overage tiers META ──────────────────────────────────────────────────────

interface OverageTierMeta {
  key: 'tier1' | 'tier2' | 'tier3';
  standard: string;
  pro: string;
  ultra: string;
}

const OVERAGE_META: OverageTierMeta[] = [
  { key: 'tier1', standard: '€3 / 1,000', pro: '€4 / 1,000', ultra: '€5 / 1,000' },
  { key: 'tier2', standard: '€1.50 / 1,000', pro: '€2.00 / 1,000', ultra: '€2.50 / 1,000' },
  { key: 'tier3', standard: '€1.00 / 1,000', pro: '€1.50 / 1,000', ultra: '€2.00 / 1,000' },
];

// ─── Add-ons META ────────────────────────────────────────────────────────────

interface AddonMeta {
  key: string;
  setup: number;
  monthly: number;
}

const ADDON_META: AddonMeta[] = [
  { key: 'a2', setup: 30, monthly: 2 },
  { key: 'a5', setup: 30, monthly: 5 },
  { key: 'a6', setup: 30, monthly: 5 },
  { key: 'a7', setup: 50, monthly: 5 },
  { key: 'a10', setup: 20, monthly: 2 },
  { key: 'a11', setup: 0, monthly: 10 },
  { key: 'a12', setup: 40, monthly: 2 },
];

// Add-ons announced but not yet available
const UPCOMING_ADDON_KEYS = ['a9'] as const;

// ─── FAQ META ────────────────────────────────────────────────────────────────

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;

// ─── View-definition tiles META ──────────────────────────────────────────────

const VIEW_DEF_META = [
  { key: 't1', icon: Zap },
  { key: 't2', icon: Shield },
  { key: 't3', icon: BarChart2 },
  { key: 't4', icon: CreditCard },
  { key: 't5', icon: Globe },
  { key: 't6', icon: Users },
] as const;

// ─── Quality levels META ─────────────────────────────────────────────────────

const QUALITY_META = [
  { level: 'A', key: 'a', color: 'zinc' as const },
  { level: 'B', key: 'b', color: 'blue' as const },
  { level: 'C', key: 'c', color: 'amber' as const },
] as const;

// ─── Production examples META ────────────────────────────────────────────────

const PRODUCTION_EXAMPLES = [
  { key: 'ex1', formula: '€100 + 10 × €20', total: 300, discount: 0, discountedTotal: 300, discountedFormula: '' },
  { key: 'ex2', formula: '€100 + 20 × €20', total: 500, discount: 10, discountedTotal: 460, discountedFormula: '€100 + 20 × €18' },
  { key: 'ex3', formula: '€100 + 40 × €20', total: 900, discount: 20, discountedTotal: 740, discountedFormula: '€100 + 40 × €16' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

const RestaurantPricing: React.FC = () => {
  const { t } = useTranslation();
  const [annual, setAnnual] = useState(false);

  // Build translated plan arrays inside component
  const plans = PLAN_META.map((meta) => ({
    ...meta,
    name: t(`restPricing.plans.${meta.id}.name`),
    tagline: t(`restPricing.plans.${meta.id}.tagline`),
    quality: t(`restPricing.plans.${meta.id}.quality`),
    features: Array.from({ length: meta.featureCount }, (_, i) =>
      t(`restPricing.plans.${meta.id}.features.f${i + 1}`)
    ),
  }));

  // Build translated overage tiers
  const overageTiers = OVERAGE_META.map((meta) => ({
    ...meta,
    band: t(`restPricing.overage.${meta.key}.band`),
  }));

  // Build translated add-ons
  const addons = ADDON_META.map((meta) => ({
    ...meta,
    name: t(`restPricing.addons.${meta.key}.name`),
    detail: t(`restPricing.addons.${meta.key}.detail`),
  }));

  // Upcoming add-ons (announced but not yet available)
  const upcomingAddons = UPCOMING_ADDON_KEYS.map((key) => ({
    key,
    name: t(`restPricing.addons.${key}.name`),
    detail: t(`restPricing.addons.${key}.detail`),
  }));

  // Build translated FAQ items
  const faqItems = FAQ_KEYS.map((key) => ({
    question: t(`restPricing.faq.${key}.question`),
    answer: t(`restPricing.faq.${key}.answer`),
  }));

  // Build translated view-definition tiles
  const viewDefTiles = VIEW_DEF_META.map((meta) => ({
    icon: meta.icon,
    title: t(`restPricing.viewDef.${meta.key}.title`),
    body: t(`restPricing.viewDef.${meta.key}.body`),
  }));

  // Build translated quality levels
  const qualityLevels = QUALITY_META.map((meta) => ({
    ...meta,
    name: t(`restPricing.quality.${meta.key}.name`),
    plan: t(`restPricing.quality.${meta.key}.plan`),
    desc: t(`restPricing.quality.${meta.key}.desc`),
  }));

  // Build translated production examples
  const productionExamples = PRODUCTION_EXAMPLES.map((meta) => ({
    ...meta,
    label: t(`restPricing.production.${meta.key}.label`),
  }));

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'Restaurant Pricing',
        'data-file': 'src/pages/RestaurantPricing.tsx',
      })}
    >
      <SEO title={t('restPricing.seo.title')} description={t('restPricing.seo.desc')} />
      <BreadcrumbSchema
        items={[
          { name: t('restPricing.breadcrumb.home'), path: '/' },
          { name: t('restPricing.breadcrumb.current'), path: '/restaurants/pricing' },
        ]}
      />
      <FAQSchema items={faqItems} />
      <ServiceSchema
        name={t('restPricing.schema.name')}
        description={t('restPricing.schema.desc')}
        price="18"
      />
      {/* Hero */}
      <section
        data-section="hero"
        className="relative bg-stone-950 text-white py-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-600/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative container mx-auto px-4 max-w-4xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            {t('restPricing.hero.badge')}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-5 text-white">
            {t('restPricing.hero.heading')}
          </h1>
          <p className="text-lg text-stone-400 max-w-xl mx-auto">
            {t('restPricing.hero.subtitle')}
          </p>

          {/* Toggle */}
          <div className="mt-10 inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !annual ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              {t('restPricing.hero.monthly')}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                annual ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              {t('restPricing.hero.annual')}
              <span className="ml-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                {t('restPricing.hero.annualDiscount')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 1: Plans ──────────────────────────────────────────────────── */}
      <section data-section="plans" className="py-24 bg-zinc-800/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              {t('restPricing.plans.badge')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {t('restPricing.plans.heading')}
            </h2>
            <p className="mt-3 text-zinc-400 max-w-md mx-auto text-sm">
              {t('restPricing.plans.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {plans.map((plan) => {
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              const period = annual
                ? t('restPricing.plans.perYear')
                : t('restPricing.plans.perMonth');
              const accentClass = plan.highlighted
                ? 'ring-2 ring-amber-400 md:scale-105 shadow-2xl bg-gradient-to-b from-amber-950/30 to-zinc-900'
                : 'bg-zinc-900';
              return (
                <Card
                  key={plan.id}
                  hover={false}
                  className={`p-7 relative flex flex-col h-full transition-all ${accentClass}`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                      {t('restPricing.plans.mostPopular')}
                    </div>
                  )}

                  {/* Quality badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 w-fit ${
                      plan.qualityLevel === 'C'
                        ? 'bg-amber-900/30 text-amber-400'
                        : plan.qualityLevel === 'B'
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Box className="w-3 h-3" />
                    {plan.quality}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 mb-5">{plan.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className={`text-4xl font-bold ${plan.highlighted ? 'text-amber-400' : 'text-white'}`}
                    >
                      €{price}
                    </span>
                    <span className="text-sm text-zinc-400">
                      {period} {t('restPricing.plans.perMenu')}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono mb-1">
                    {t('restPricing.plans.viewsIncluded', {
                      views: plan.includedViews.toLocaleString(),
                    })}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono mb-6">
                    {t('restPricing.plans.storage', { size: plan.storage })}
                  </p>

                  <ul className="space-y-2.5 mb-8 flex-grow">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-300">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/request">
                    <Button
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      className={`w-full ${plan.highlighted ? 'bg-amber-600 hover:bg-amber-500 border-amber-600' : ''}`}
                    >
                      {t('cta.getQuote')} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 2: 3D Quality Levels ─────────────────────────────────────── */}
      <section data-section="quality-levels" className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              {t('restPricing.quality.badge')}
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              {t('restPricing.quality.heading')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {qualityLevels.map(({ level, key: _key, name, plan, color, desc }) => (
              <div
                key={level}
                className={`rounded-2xl border p-6 ${
                  color === 'amber'
                    ? 'border-amber-900/40 bg-amber-950/20'
                    : color === 'blue'
                      ? 'border-blue-900/30 bg-blue-950/20'
                      : 'border-zinc-700 bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                      color === 'amber'
                        ? 'bg-amber-900/50 text-amber-300'
                        : color === 'blue'
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {level}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">
                      {t('restPricing.quality.levelLabel', { level, name })}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t('restPricing.quality.planLabel', { plan })}
                    </p>
                  </div>
                </div>

                {/* Placeholder for 3D model preview */}
                <div className="aspect-square rounded-xl bg-zinc-700 flex items-center justify-center mb-4 border border-zinc-600">
                  <div className="text-center">
                    <Box
                      className={`w-10 h-10 mx-auto mb-2 ${color === 'amber' ? 'text-amber-400' : color === 'blue' ? 'text-blue-400' : 'text-zinc-400'}`}
                    />
                    <p className="text-xs text-zinc-400 font-mono">
                      {t('restPricing.quality.modelPreview')}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {t('restPricing.quality.comingSoon')}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: View Metering ──────────────────────────────────────────── */}
      <section data-section="view-metering" className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              {t('restPricing.overage.badge')}
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              {t('restPricing.overage.heading')}
            </h2>
            <p className="mt-3 text-zinc-400 max-w-md mx-auto text-sm">
              {t('restPricing.overage.desc')}
            </p>
          </div>

          {/* Overage table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-700 mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800 border-b border-zinc-700">
                  <th className="text-left px-6 py-4 font-semibold text-zinc-300">
                    {t('restPricing.overage.colBand')}
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-zinc-300">
                    {t('restPricing.overage.colStandard')}
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-amber-400">
                    {t('restPricing.overage.colPro')}
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-zinc-300">
                    {t('restPricing.overage.colUltra')}
                  </th>
                </tr>
                <tr className="bg-zinc-800/60 border-b border-zinc-700">
                  <td className="px-6 py-3 text-xs text-zinc-400 font-medium">
                    {t('restPricing.overage.includedViews')}
                  </td>
                  <td className="text-center px-4 py-3 text-xs font-mono font-semibold text-zinc-300">
                    1,000
                  </td>
                  <td className="text-center px-4 py-3 text-xs font-mono font-semibold text-amber-400">
                    2,000
                  </td>
                  <td className="text-center px-4 py-3 text-xs font-mono font-semibold text-zinc-300">
                    3,000
                  </td>
                </tr>
              </thead>
              <tbody>
                {overageTiers.map((tier, i) => (
                  <tr
                    key={tier.key}
                    className={`border-b border-zinc-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-zinc-800/20'}`}
                  >
                    <td className="px-6 py-4 text-zinc-300">{tier.band}</td>
                    <td className="text-center px-4 py-4 font-mono text-zinc-400">
                      {tier.standard}
                    </td>
                    <td className="text-center px-4 py-4 font-mono font-semibold text-amber-400">
                      {tier.pro}
                    </td>
                    <td className="text-center px-4 py-4 font-mono text-zinc-400">{tier.ultra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* View definition tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {viewDefTiles.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-800/40"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-white mb-1">{title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: On-site Production ────────────────────────────────────── */}
      <section data-section="production" className="py-20 bg-zinc-800/40 border-t border-zinc-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              {t('restPricing.production.badge')}
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              {t('restPricing.production.heading')}
            </h2>
            <p className="mt-3 text-zinc-400 max-w-md mx-auto text-sm">
              {t('restPricing.production.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-7">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-5">
                <MapPin className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {t('restPricing.production.visitTitle')}
              </h3>
              <p className="text-sm text-zinc-400 mb-5">{t('restPricing.production.visitDesc')}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">€100</span>
                <span className="text-sm text-zinc-500">
                  {t('restPricing.production.visitUnit')}
                </span>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-amber-900/40 p-7">
              <div className="w-10 h-10 rounded-xl bg-amber-900/30 flex items-center justify-center mb-5">
                <Box className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {t('restPricing.production.modelTitle')}
              </h3>
              <p className="text-sm text-zinc-400 mb-5">{t('restPricing.production.modelDesc')}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-amber-400">€20</span>
                <span className="text-sm text-zinc-500">
                  {t('restPricing.production.modelUnit')}
                </span>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              {t('restPricing.production.exampleHeading')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {productionExamples.map(({ key, label, formula, total, discount, discountedTotal, discountedFormula }) => (
                <div key={key} className={`relative rounded-xl p-4 text-center ${discount > 0 ? 'bg-zinc-800 ring-1 ring-amber-500/30' : 'bg-zinc-800'}`}>
                  {discount > 0 && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 whitespace-nowrap">
                      {discount}% off per item
                    </span>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
                    {label}
                  </p>
                  {discount > 0 ? (
                    <div className="mb-1">
                      <span className="text-sm font-medium text-zinc-500 line-through mr-2">€{total}</span>
                      <span className="text-2xl font-bold text-amber-400">€{discountedTotal}</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-white mb-1">€{total}</p>
                  )}
                  <p className="text-[11px] font-mono text-zinc-400">
                    {discount > 0 ? discountedFormula : formula}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-4 text-center">
              {t('restPricing.production.qualityNote')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 5: Add-ons ────────────────────────────────────────────────── */}
      <section data-section="addons" className="py-20 bg-zinc-800/40 border-t border-zinc-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              {t('restPricing.addons.badge')}
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              {t('restPricing.addons.heading')}
            </h2>
            <p className="mt-3 text-zinc-400 max-w-md mx-auto text-sm">
              {t('restPricing.addons.desc')}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800 border-b border-zinc-700">
                  <th className="text-left px-6 py-4 font-semibold text-zinc-300">
                    {t('restPricing.addons.colAddon')}
                  </th>
                  <th className="text-right px-4 py-4 font-semibold text-zinc-300">
                    {t('restPricing.addons.colSetup')}
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-zinc-300">
                    {t('restPricing.addons.colMonthly')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {addons.map((addon, i) => (
                  <tr
                    key={addon.key}
                    className={`border-b border-zinc-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-zinc-800/20'}`}
                  >
                    <td className="px-6 py-3">
                      <p className="font-medium text-white">{addon.name}</p>
                      <p className="text-xs text-zinc-400">{addon.detail}</p>
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-zinc-400">€{addon.setup}</td>
                    <td className="text-right px-6 py-3 font-mono font-semibold text-white">
                      €{addon.monthly}
                      {t('restPricing.addons.moSuffix')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Storage add-on */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 text-zinc-500" />
              </div>
              <div>
                <p className="font-semibold text-white">{t('restPricing.addons.extraStorage')}</p>
                <p className="text-xs text-zinc-500">
                  {t('restPricing.addons.extraStorageDetail')}
                </p>
              </div>
            </div>
            <p className="font-bold text-xl text-white font-mono whitespace-nowrap">
              {t('restPricing.addons.extraStoragePrice')}
            </p>
          </div>

          {/* Upcoming add-ons teaser */}
          {upcomingAddons.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                {t('restPricing.addons.comingSoonLabel', { defaultValue: 'Coming Soon' })}
              </p>
              {upcomingAddons.map((addon) => (
                <div
                  key={addon.key}
                  className="bg-zinc-900/60 rounded-2xl border border-dashed border-zinc-700 p-6 flex items-center justify-between gap-4 opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-amber-500/60" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{addon.name}</p>
                      <p className="text-xs text-zinc-500">{addon.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-500/70 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 whitespace-nowrap">
                    {t('restPricing.addons.comingSoonBadge', { defaultValue: 'Coming Soon' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Section 6: FAQ ────────────────────────────────────────────────────── */}
      <section data-section="faq" className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              {t('restPricing.faq.badge')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {t('restPricing.faq.heading')}
            </h2>
          </div>
          <Accordion
            items={faqItems.map((item) => ({
              title: item.question,
              content: <p>{item.answer}</p>,
            }))}
          />
        </div>
      </section>

      {/* CTA */}
      <section data-section="cta" className="py-20 bg-stone-950 text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl font-bold mb-5">{t('restPricing.cta.heading')}</h2>
          <p className="text-lg mb-8 text-stone-400">{t('restPricing.cta.desc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link to="/request">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-500 border-amber-600 text-white"
              >
                {t('cta.getQuote')} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/compare">
              <Button
                variant="outline"
                size="lg"
                className="border-stone-600 text-stone-300 hover:bg-stone-800"
              >
                {t('restPricing.cta.compare')} <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-stone-600 mt-6">{t('cta.reassurance')}</p>
        </div>
      </section>
    </div>
  );
};

export default RestaurantPricing;
