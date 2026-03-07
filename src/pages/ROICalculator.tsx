import React, { useState, useMemo, useCallback } from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  Sparkles,
  PiggyBank,
  ChevronRight,
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';
import { i18nToLocale } from '@/utils/formatters';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useCountUp } from '@/hooks/useCountUp';

// ── Constants ───────────────────────────────────────────────────

const TYPICAL_INVESTMENT = 2500;
const CONVERSION_LIFT = 1.32;
const PHOTO_COST_REDUCTION = 0.4;

// ── Animated KPI Card ───────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: number;
  format: 'currency' | 'percent' | 'months';
  subtitle: string;
  colorClass: string;
  icon: React.ElementType;
}

const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  format,
  subtitle,
  colorClass,
  icon: Icon,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18nToLocale(i18n.language);

  const formatCurrency = (v: number): string =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(v);

  const formatPercent = (v: number): string =>
    new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 0,
    }).format(v / 100);

  const displayValue = useCountUp({
    end: Math.round(value),
    duration: 1200,
    enabled: true,
  });

  const formattedValue = useMemo(() => {
    const numericValue = parseInt(displayValue, 10) || 0;
    switch (format) {
      case 'currency':
        return formatCurrency(numericValue);
      case 'percent':
        return formatPercent(numericValue);
      case 'months':
        return `${numericValue}`;
      default:
        return displayValue;
    }
  }, [displayValue, format, locale]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all duration-300 hover:border-zinc-700/80">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
        <span className="text-sm font-medium text-zinc-400">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${colorClass} transition-all duration-300`}>
        {formattedValue}
        {format === 'months' && <span className="text-lg ml-1">{t('roi.months')}</span>}
      </p>
      <p className="text-xs text-zinc-500 mt-2">{subtitle}</p>
    </div>
  );
};

// ── How It Works Card ───────────────────────────────────────────

interface MethodologyCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  stat: string;
  statColor: string;
}

const MethodologyCard: React.FC<MethodologyCardProps> = ({
  icon: Icon,
  title,
  description,
  stat,
  statColor,
}) => (
  <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all duration-300 group">
    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center mb-4 group-hover:border-brand-500/30 transition-colors">
      <Icon className="w-5 h-5 text-brand-400" />
    </div>
    <h3 className="font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-zinc-500 leading-relaxed mb-3">{description}</p>
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${statColor}`}>
      {stat}
    </span>
  </div>
);

// ── Component ───────────────────────────────────────────────────

const ROICalculator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const locale = i18nToLocale(i18n.language);

  const formatCurrency = (v: number): string =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(v);

  // ── Calculator State ────────────────────────────────────────
  const [monthlyViews, setMonthlyViews] = useState<number>(5000);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(45);
  const [currentConversionRate, setCurrentConversionRate] = useState<number>(3);
  const [currentPhotoCost, setCurrentPhotoCost] = useState<number>(200);

  // ── Computed Results ────────────────────────────────────────
  const results = useMemo(() => {
    const projectedConversionRate = currentConversionRate * CONVERSION_LIFT;
    const additionalOrders =
      (monthlyViews * (projectedConversionRate - currentConversionRate)) / 100;
    const additionalRevenue = additionalOrders * avgOrderValue;
    const monthlySavings = currentPhotoCost * PHOTO_COST_REDUCTION;
    const totalMonthlyGain = additionalRevenue + monthlySavings;
    const annualGain = totalMonthlyGain * 12;
    const annualROI = totalMonthlyGain > 0 ? (annualGain / TYPICAL_INVESTMENT) * 100 : 0;
    const paybackPeriod =
      totalMonthlyGain > 0 ? Math.round(TYPICAL_INVESTMENT / totalMonthlyGain) : 0;

    return {
      additionalRevenue,
      monthlySavings,
      annualROI,
      paybackPeriod,
    };
  }, [monthlyViews, avgOrderValue, currentConversionRate, currentPhotoCost]);

  // ── Input handlers ──────────────────────────────────────────
  const handleNumberInput = useCallback(
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setter(isNaN(val) ? 0 : val);
      },
    []
  );

  // ── Scroll Reveal Refs ──────────────────────────────────────
  const heroRef = useScrollReveal<HTMLDivElement>();
  const calculatorRef = useScrollReveal<HTMLDivElement>();
  const methodologyRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  // ── Input Styles ────────────────────────────────────────────
  const inputClasses =
    'w-full bg-zinc-900 border border-zinc-700 rounded-lg text-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all placeholder:text-zinc-600';
  const labelClasses = 'block text-sm font-medium text-zinc-400 mb-2';

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'ROICalculator',
        'data-file': 'src/pages/ROICalculator.tsx',
      })}
    >
      <SEO title={t('roi.seo.title')} description={t('roi.seo.desc')} />
      <BreadcrumbSchema
        items={[
          { name: t('roi.hero.breadcrumbHome'), path: '/' },
          { name: t('roi.seo.title'), path: '/roi-calculator' },
        ]}
      />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section data-section="hero" className="relative bg-zinc-950 overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-600/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-emerald-700/8 blur-[100px] rounded-full pointer-events-none" />

        <div ref={heroRef} className="reveal relative container mx-auto px-4 max-w-3xl text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs text-zinc-500 mb-8">
            <Link to="/" className="hover:text-zinc-300 transition-colors">
              {t('roi.hero.breadcrumbHome')}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400">{t('roi.hero.breadcrumbROI')}</span>
          </nav>

          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('roi.hero.badge')}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('roi.hero.heading')}{' '}
            <span className="text-gradient">{t('roi.hero.headingHighlight')}</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {t('roi.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ── Calculator Section ─────────────────────────────────── */}
      <section
        data-section="calculator"
        className="relative py-24 bg-zinc-950 border-t border-zinc-800/40"
      >
        <div ref={calculatorRef} className="reveal container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* ── Left Column: Inputs ──────────────────── */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {t('roi.calculator.yourNumbers')}
                  </h2>
                  <p className="text-xs text-zinc-500">{t('roi.calculator.adjustValues')}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Monthly Menu Views */}
                <div>
                  <label htmlFor="monthly-views" className={labelClasses}>
                    {t('roi.calculator.monthlyMenuViews')}
                  </label>
                  <input
                    id="monthly-views"
                    type="number"
                    min={0}
                    value={monthlyViews}
                    onChange={handleNumberInput(setMonthlyViews)}
                    placeholder={t('roi.calculator.viewsPlaceholder', 'e.g. 5000')}
                    className={inputClasses}
                  />
                </div>

                {/* Average Order Value */}
                <div>
                  <label htmlFor="avg-order" className={labelClasses}>
                    {t('roi.calculator.avgOrderValue')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">
                      €
                    </span>
                    <input
                      id="avg-order"
                      type="number"
                      min={0}
                      value={avgOrderValue}
                      onChange={handleNumberInput(setAvgOrderValue)}
                      placeholder={t('roi.calculator.orderPlaceholder', 'e.g. 45')}
                      className={`${inputClasses} pl-8`}
                    />
                  </div>
                </div>

                {/* Current Conversion Rate */}
                <div>
                  <label htmlFor="conversion-rate" className={labelClasses}>
                    {t('roi.calculator.conversionRate')}{' '}
                    <span className="text-white font-semibold">{currentConversionRate}%</span>
                  </label>
                  <input
                    id="conversion-rate"
                    type="range"
                    min={0.5}
                    max={15}
                    step={0.5}
                    value={currentConversionRate}
                    onChange={(e) => setCurrentConversionRate(parseFloat(e.target.value))}
                    aria-valuenow={currentConversionRate}
                    aria-valuetext={`${currentConversionRate}%`}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                    <span>0.5%</span>
                    <span>15%</span>
                  </div>
                </div>

                {/* Monthly Photo/Menu Cost */}
                <div>
                  <label htmlFor="photo-cost" className={labelClasses}>
                    {t('roi.calculator.photoCost')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">
                      €
                    </span>
                    <input
                      id="photo-cost"
                      type="number"
                      min={0}
                      value={currentPhotoCost}
                      onChange={handleNumberInput(setCurrentPhotoCost)}
                      placeholder={t('roi.calculator.costPlaceholder', 'e.g. 200')}
                      className={`${inputClasses} pl-8`}
                    />
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-zinc-600 mt-6 leading-relaxed">
                {t('roi.calculator.disclaimer', { amount: formatCurrency(TYPICAL_INVESTMENT) })}
              </p>
            </div>

            {/* ── Right Column: Results ─────────────────── */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {t('roi.results.heading')}
                  </h2>
                  <p className="text-xs text-zinc-500">{t('roi.results.subtitle')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KPICard
                  label={t('roi.results.additionalRevenue')}
                  value={results.additionalRevenue}
                  format="currency"
                  subtitle={t('roi.results.conversionLift')}
                  colorClass="text-emerald-400"
                  icon={DollarSign}
                />
                <KPICard
                  label={t('roi.results.monthlySavings')}
                  value={results.monthlySavings}
                  format="currency"
                  subtitle={t('roi.results.vsPhotography')}
                  colorClass="text-teal-400"
                  icon={PiggyBank}
                />
                <KPICard
                  label={t('roi.results.annualROI')}
                  value={results.annualROI}
                  format="percent"
                  subtitle={t('roi.results.returnOn3d')}
                  colorClass="text-brand-400"
                  icon={TrendingUp}
                />
                <KPICard
                  label={t('roi.results.paybackPeriod')}
                  value={results.paybackPeriod}
                  format="months"
                  subtitle={t('roi.results.toFullROI')}
                  colorClass="text-amber-400"
                  icon={Clock}
                />
              </div>

              {/* Summary banner */}
              <div className="mt-6 p-4 rounded-xl bg-brand-500/5 border border-brand-500/15">
                <p className="text-sm text-zinc-300">
                  {t('roi.results.summaryPrefix')}{' '}
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(results.additionalRevenue + results.monthlySavings)}
                  </span>{' '}
                  {t('roi.results.summarySuffix')}
                </p>
              </div>

              <p className="text-[11px] text-zinc-600 mt-4">{t('roi.results.disclaimer')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ────────────────────────────────── */}
      <section
        data-section="methodology"
        className="relative py-24 bg-zinc-950 border-t border-zinc-800/40"
      >
        <div ref={methodologyRef} className="reveal container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('roi.methodology.badge')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t('roi.methodology.heading')}
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">{t('roi.methodology.desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MethodologyCard
              icon={Sparkles}
              title={t('roi.methodology.engagement.title')}
              description={t('roi.methodology.engagement.desc')}
              stat={t('roi.methodology.engagement.stat')}
              statColor="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            />
            <MethodologyCard
              icon={TrendingUp}
              title={t('roi.methodology.conversion.title')}
              description={t('roi.methodology.conversion.desc')}
              stat={t('roi.methodology.conversion.stat')}
              statColor="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            />
            <MethodologyCard
              icon={PiggyBank}
              title={t('roi.methodology.cost.title')}
              description={t('roi.methodology.cost.desc')}
              stat={t('roi.methodology.cost.stat')}
              statColor="bg-amber-500/10 text-amber-400 border border-amber-500/20"
            />
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section
        data-section="cta"
        className="relative py-24 bg-zinc-950 overflow-hidden border-t border-zinc-800/40"
      >
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />

        <div ref={ctaRef} className="reveal relative container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('roi.cta.heading')}
          </h2>
          <p className="text-zinc-400 text-lg mb-10">{t('roi.cta.desc')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/request"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all hover:-translate-y-px hover:shadow-glow"
            >
              {t('cta.getQuote')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
            >
              {t('roi.cta.viewPricing')}
            </Link>
          </div>
          <p className="text-xs text-zinc-600 mt-6">{t('cta.reassurance')}</p>
        </div>
      </section>
    </div>
  );
};

export default ROICalculator;
