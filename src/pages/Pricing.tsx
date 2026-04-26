import React, { useState } from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import {
  Check,
  ArrowRight,
  Box,
  Zap,
  Globe,
  Shield,
  Users,
  BarChart2,
  Package,
  CreditCard,
  ChevronRight,
  Video,
  Scan,
  Building2,
  Settings2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Accordion from '@/components/Accordion';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/common/StructuredData';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlatformPlanMeta {
  id: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  includedProducts: number;
  includedViews: string;
  storage: string;
  seats: number;
  overagePerK: number | null;
  featureCount: number;
  highlighted?: boolean;
  enterpriseCustom?: boolean;
}

interface PlatformPlan extends PlatformPlanMeta {
  name: string;
  tagline: string;
  features: string[];
}

interface AddonMeta {
  id: string;
  price2Key?: string;
}

interface Addon {
  label: string;
  detail: string;
  price: string;
  price2?: string;
}

interface CreditPackMeta {
  views: string;
  price: number;
  effective: string;
}

interface FaqMeta {
  id: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface OnsiteServiceMeta {
  id: string;
  icon: React.FC<{ className?: string }>;
  tagColor: string;
}

interface ViewMeterMeta {
  id: string;
  icon: React.FC<{ className?: string }>;
}

// ─── Static metadata (non-translatable) ──────────────────────────────────────

const PLAN_META: PlatformPlanMeta[] = [
  {
    id: 'launch',
    monthlyPrice: 59,
    annualPrice: 590,
    includedProducts: 25,
    includedViews: '50,000',
    storage: '10 GB',
    seats: 1,
    overagePerK: 1.5,
    featureCount: 6,
  },
  {
    id: 'scale',
    monthlyPrice: 199,
    annualPrice: 1990,
    includedProducts: 150,
    includedViews: '250,000',
    storage: '50 GB',
    seats: 3,
    overagePerK: 1.0,
    highlighted: true,
    featureCount: 7,
  },
  {
    id: 'enterprise',
    monthlyPrice: null,
    annualPrice: null,
    includedProducts: 5000,
    includedViews: 'Unlimited',
    storage: 'Custom',
    seats: 0,
    overagePerK: null,
    enterpriseCustom: true,
    featureCount: 6,
  },
];

const ADDON_META: AddonMeta[] = [
  { id: 'a1', price2Key: 'pricing.addons.a1.price2' },
  { id: 'a2' },
  { id: 'a3' },
  { id: 'a4' },
  { id: 'a5' },
];

const CREDIT_PACK_META: CreditPackMeta[] = [
  { views: '1,000,000', price: 900, effective: '\u20AC0.0009/view' },
  { views: '5,000,000', price: 4000, effective: '\u20AC0.0008/view' },
  { views: '10,000,000', price: 7000, effective: '\u20AC0.0007/view' },
];

const FAQ_META: FaqMeta[] = [
  { id: 'q1' },
  { id: 'q2' },
  { id: 'q3' },
  { id: 'q4' },
  { id: 'q5' },
  { id: 'q6' },
  { id: 'q7' },
];

const ONSITE_META: OnsiteServiceMeta[] = [
  { id: 's1', icon: Box, tagColor: 'brand' },
  { id: 's2', icon: Video, tagColor: 'zinc' },
  { id: 's3', icon: Scan, tagColor: 'zinc' },
  { id: 's4', icon: Building2, tagColor: 'zinc' },
];

const VIEW_METER_META: ViewMeterMeta[] = [
  { id: 'v1', icon: Zap },
  { id: 'v2', icon: BarChart2 },
  { id: 'v3', icon: Shield },
  { id: 'v4', icon: CreditCard },
  { id: 'v5', icon: Users },
  { id: 'v6', icon: Globe },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Pricing: React.FC = () => {
  const { t } = useTranslation();
  const [annual, setAnnual] = useState(false);

  // Build translatable arrays inside the component
  const plans: PlatformPlan[] = PLAN_META.map((meta) => ({
    ...meta,
    name: t(`pricing.plans.${meta.id}.name`),
    tagline: t(`pricing.plans.${meta.id}.tagline`),
    features: Array.from({ length: meta.featureCount }, (_, i) =>
      t(`pricing.plans.${meta.id}.features.f${i + 1}`)
    ),
  }));

  const addons: Addon[] = ADDON_META.map((meta) => ({
    label: t(`pricing.addons.${meta.id}.label`),
    detail: t(`pricing.addons.${meta.id}.detail`),
    price: t(`pricing.addons.${meta.id}.price`),
    ...(meta.price2Key ? { price2: t(meta.price2Key) } : {}),
  }));

  const faqItems: FaqItem[] = FAQ_META.map((meta) => ({
    question: t(`pricing.faq.${meta.id}.question`),
    answer: t(`pricing.faq.${meta.id}.answer`),
  }));

  const onsiteServices = ONSITE_META.map((meta) => ({
    ...meta,
    title: t(`pricing.onsite.${meta.id}.title`),
    desc: t(`pricing.onsite.${meta.id}.desc`),
    tag: t(`pricing.onsite.${meta.id}.tag`),
  }));

  const viewMeterTiles = VIEW_METER_META.map((meta) => ({
    ...meta,
    title: t(`pricing.views.${meta.id}.title`),
    body: t(`pricing.views.${meta.id}.body`),
  }));

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'Pricing',
        'data-file': 'src/pages/Pricing.tsx',
      })}
    >
      <SEO title={t('pricing.seo.title')} description={t('pricing.seo.description')} />
      <BreadcrumbSchema
        items={[
          { name: t('pricing.schema.breadcrumb.home'), path: '/' },
          { name: t('pricing.schema.breadcrumb.pricing'), path: '/pricing' },
        ]}
      />
      <FAQSchema items={faqItems} />
      <ServiceSchema
        name={t('pricing.schema.service1.name')}
        description={t('pricing.schema.service1.desc')}
        price="59"
      />
      <ServiceSchema
        name={t('pricing.schema.service2.name')}
        description={t('pricing.schema.service2.desc')}
        price="290"
      />

      {/* Hero */}
      <section
        data-section="hero"
        className="relative bg-zinc-950 text-white py-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -left-40 w-[500px] h-[500px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative container mx-auto px-4 max-w-4xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('pricing.hero.badge')}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-5 text-white">
            {t('pricing.hero.heading')}
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">{t('pricing.hero.subtitle')}</p>

          {/* Billing toggle */}
          <div className="mt-10 inline-flex items-center gap-3 bg-white/[0.05] border border-white/[0.08] rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !annual ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('pricing.billing.monthly')}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                annual ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('pricing.billing.annual')}
              <span className="ml-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                {t('pricing.billing.annualDiscount')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 1: Platform Plans ─────────────────────────────────────────── */}
      <section data-section="plans" className="py-24 bg-zinc-800/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('pricing.plans.badge')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {t('pricing.plans.heading')}
            </h2>
            <p className="mt-3 text-zinc-400 max-w-lg mx-auto text-sm">
              {t('pricing.plans.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-end">
            {plans.map((plan) => {
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              const period = annual ? t('pricing.plans.perYear') : t('pricing.plans.perMonth');
              return (
                <Card
                  key={plan.id}
                  hover={false}
                  className={`p-7 relative flex flex-col h-full transition-all ${
                    plan.highlighted
                      ? 'glass-card ring-2 ring-brand-500/60 md:scale-105 shadow-2xl'
                      : plan.enterpriseCustom
                        ? 'bg-gradient-to-b from-zinc-800 to-zinc-900 text-white'
                        : 'glass-card'
                  } hover:border-brand-500/30`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-glow whitespace-nowrap">
                      {t('pricing.plans.mostPopular')}
                    </div>
                  )}

                  <div className="mb-6 pt-2">
                    <h3
                      className={`text-xl font-bold mb-1 ${plan.enterpriseCustom ? 'text-white' : 'text-white'}`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className="text-xs text-zinc-400"
                    >
                      {plan.tagline}
                    </p>

                    <div className="mt-5">
                      {plan.enterpriseCustom ? (
                        <p className="text-3xl font-bold text-white">{t('pricing.plans.custom')}</p>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-4xl font-bold ${plan.highlighted ? 'text-brand-400' : 'text-white'}`}
                          >
                            &euro;{price?.toLocaleString()}
                          </span>
                          <span className="text-sm text-zinc-400">{period}</span>
                        </div>
                      )}
                      {!plan.enterpriseCustom && plan.overagePerK !== null && (
                        <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                          {t('pricing.plans.overage', { rate: plan.overagePerK.toFixed(2) })}
                        </p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-grow">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.enterpriseCustom ? 'text-brand-400' : 'text-emerald-500'}`}
                        />
                        <span
                          className={`text-sm ${plan.enterpriseCustom ? 'text-zinc-300' : 'text-zinc-300'}`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.enterpriseCustom ? (
                    <Link to="/request">
                      <Button
                        variant="outline"
                        className="w-full border-zinc-600 text-white hover:bg-zinc-700"
                      >
                        {t('cta.getQuote')} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/request">
                      <Button variant={plan.highlighted ? 'primary' : 'outline'} className="w-full">
                        {t('cta.getQuote')} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Billing Examples ──────────────────────────────────────────────────── */}
      <section data-section="billing-examples" className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('pricing.examples.badge')}
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              {t('pricing.examples.heading')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Example A */}
            <div className="rounded-2xl glass-card p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">
                {t('pricing.examples.a.badge')}
              </p>
              <div className="space-y-2 text-sm text-zinc-400 mb-5">
                <div className="flex justify-between">
                  <span>{t('pricing.examples.a.subscription')}</span>
                  <span className="font-mono text-white">&euro;199</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pricing.examples.a.includedViews')}</span>
                  <span className="font-mono text-white">250,000</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pricing.examples.a.viewsUsed')}</span>
                  <span className="font-mono text-white">400,000</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>{t('pricing.examples.a.overage')}</span>
                  <span className="font-mono">+&euro;150</span>
                </div>
              </div>
              <div className="border-t border-zinc-700 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">
                  {t('pricing.examples.a.invoiceTotal')}
                </span>
                <span className="text-3xl font-bold text-white">&euro;349</span>
              </div>
            </div>

            {/* Example B */}
            <div className="rounded-2xl glass-card p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">
                {t('pricing.examples.b.badge')}
              </p>
              <div className="space-y-2 text-sm text-zinc-400 mb-5">
                <div className="flex justify-between">
                  <span>{t('pricing.examples.b.subscription')}</span>
                  <span className="font-mono text-white">&euro;59</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pricing.examples.b.includedViews')}</span>
                  <span className="font-mono text-white">50,000</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pricing.examples.b.viewsUsed')}</span>
                  <span className="font-mono text-white">300,000</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>{t('pricing.examples.b.creditDeduction')}</span>
                  <span className="font-mono">&euro;0</span>
                </div>
              </div>
              <div className="border-t border-zinc-700 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">
                  {t('pricing.examples.b.invoiceTotal')}
                </span>
                <span className="text-3xl font-bold text-white">&euro;59</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                {t('pricing.examples.b.creditsNote')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: 3Difys ────────────────────────────────────────── */}
      <section
        data-section="managed-capture"
        className="py-20 bg-zinc-800/40 border-t border-zinc-800"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('pricing.capture.badge')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {t('pricing.capture.heading')}
            </h2>
            <p className="mt-3 text-zinc-400 max-w-lg mx-auto text-sm">
              {t('pricing.capture.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Standard */}
            <Card hover={false} className="glass-card p-8 flex flex-col hover:border-brand-500/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center mb-5">
                <Box className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {t('pricing.capture.standard.title')}
              </h3>
              <p className="text-sm text-zinc-400 mb-6 flex-grow">
                {t('pricing.capture.standard.desc')}
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">&euro;290</span>
                <span className="text-sm text-zinc-500">
                  {t('pricing.capture.standard.perItem')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {t('pricing.capture.standard.turnaround')}
              </p>
            </Card>

            {/* Complex */}
            <Card hover={false} className="glass-card p-8 ring-2 ring-brand-500/60 flex flex-col hover:border-brand-500/30 transition-all">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap hidden" />
              <div className="w-11 h-11 rounded-xl bg-brand-900/40 flex items-center justify-center mb-5">
                <Package className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {t('pricing.capture.complex.title')}
              </h3>
              <p className="text-sm text-zinc-400 mb-6 flex-grow">
                {t('pricing.capture.complex.desc')}
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-brand-400">&euro;490</span>
                <span className="text-sm text-zinc-500">
                  {t('pricing.capture.complex.perItem')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {t('pricing.capture.complex.turnaround')}
              </p>
            </Card>
          </div>

          {/* Onsite + discounts row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl glass-card p-5 hover:border-brand-500/30 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                {t('pricing.capture.onsite.label')}
              </p>
              <p className="text-2xl font-bold text-white">
                &euro;900
                <span className="text-sm font-normal text-zinc-400">
                  {t('pricing.capture.onsite.perDay')}
                </span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">{t('pricing.capture.onsite.note')}</p>
            </div>
            <div className="rounded-xl glass-card p-5 hover:border-brand-500/30 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                {t('pricing.capture.batch.label')}
              </p>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li className="flex justify-between">
                  <span>{t('pricing.capture.batch.tier1')}</span>
                  <span className="font-semibold text-emerald-600">&minus;10%</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('pricing.capture.batch.tier2')}</span>
                  <span className="font-semibold text-emerald-600">&minus;20%</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('pricing.capture.batch.tier3')}</span>
                  <span className="font-semibold text-emerald-600">
                    {t('pricing.plans.custom')}
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl glass-card p-5 hover:border-brand-500/30 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                {t('pricing.capture.rush.label')}
              </p>
              <p className="text-2xl font-bold text-white">+30%</p>
              <p className="text-xs text-zinc-500 mt-1">{t('pricing.capture.rush.note')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── On-site Services ─────────────────────────────────────────────────── */}
      <section data-section="onsite-services" className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('pricing.onsite.badge')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {t('pricing.onsite.heading')}
            </h2>
            <p className="mt-3 text-zinc-400 max-w-lg mx-auto text-sm">
              {t('pricing.onsite.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {onsiteServices.map(({ id, icon: Icon, title, desc, tag, tagColor }) => (
              <div
                key={id}
                className="flex gap-5 p-6 rounded-2xl glass-card hover:border-brand-500/30 hover:shadow-sm transition-all"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tagColor === 'brand' ? 'bg-brand-900/40' : 'bg-zinc-700'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${tagColor === 'brand' ? 'text-brand-400' : 'text-zinc-400'}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-sm text-white">{title}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        tagColor === 'brand'
                          ? 'bg-brand-900/30 text-brand-400'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {tag}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-2xl glass-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Settings2 className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-300">
                <span className="font-semibold">{t('pricing.onsite.setup.text')}</span>{' '}
                {t('pricing.onsite.setup.detail')}
              </p>
            </div>
            <Link to="/request" className="flex-shrink-0">
              <Button variant="outline" size="sm">
                {t('pricing.onsite.setup.cta')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 3: How Views Are Counted ─────────────────────────────────── */}
      <section data-section="views" className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('pricing.views.badge')}
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              {t('pricing.views.heading')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {viewMeterTiles.map(({ id, icon: Icon, title, body }) => (
              <div
                key={id}
                className="flex gap-4 p-5 rounded-xl glass-card hover:border-brand-500/30 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white mb-1">{title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Add-ons ────────────────────────────────────────────────── */}
      <section data-section="addons" className="py-20 bg-zinc-800/40 border-t border-zinc-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('pricing.addons.badge')}
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              {t('pricing.addons.heading')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recurring add-ons */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.08]">
                <p className="text-sm font-bold text-white">
                  {t('pricing.addons.recurring.title')}
                </p>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {addons.map((addon, idx) => (
                    <tr key={idx} className="border-b border-white/[0.08] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3 text-zinc-300">
                        <p className="font-medium">{addon.label}</p>
                        <p className="text-xs text-zinc-400">{addon.detail}</p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <p className="font-semibold text-white font-mono">{addon.price}</p>
                        {addon.price2 && (
                          <p className="text-xs text-zinc-400 font-mono">{addon.price2}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* View Credit Packs */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.08]">
                <p className="text-sm font-bold text-white">{t('pricing.addons.credits.title')}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {t('pricing.addons.credits.subtitle')}
                </p>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {CREDIT_PACK_META.map((pack) => (
                    <tr key={pack.views} className="border-b border-white/[0.08] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3 text-zinc-300">
                        <p className="font-medium">
                          {pack.views} {t('pricing.addons.credits.views')}
                        </p>
                        <p className="text-xs text-emerald-400 font-mono">{pack.effective}</p>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-white font-mono">
                        &euro;{pack.price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 bg-zinc-800/40 border-t border-white/[0.08]">
                <p className="text-xs text-zinc-400">{t('pricing.addons.credits.shared')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: FAQ ────────────────────────────────────────────────────── */}
      <section data-section="faq" className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('pricing.faq.badge')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {t('pricing.faq.heading')}
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

      {/* Final CTA */}
      <section data-section="cta" className="py-20 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 text-center max-w-2xl relative z-10">
          <h2 className="font-display text-3xl font-bold mb-5">{t('pricing.cta.heading')}</h2>
          <p className="text-lg mb-8 text-zinc-400">{t('pricing.cta.description')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/request">
              <Button size="lg" className="bg-brand-500 hover:bg-brand-600 text-white">
                {t('cta.getQuote')} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/compare">
              <Button variant="outline" size="lg">
                {t('pricing.cta.compare')} <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-6">{t('cta.reassurance')}</p>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
