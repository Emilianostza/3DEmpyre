import React from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import {
  Check,
  X,
  Minus,
  ArrowRight,
  Camera,
  Smartphone,
  BarChart3,
  Shield,
  Zap,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';

/* ─── Types ────────────────────────────────────────────── */

type CellStatus = 'yes' | 'no' | 'partial' | 'text';

interface ComparisonRow {
  feature: string;
  mc3d: { status: CellStatus; note?: string };
  arcode: { status: CellStatus; note?: string };
}

/* ─── Status Icons ─────────────────────────────────────── */

const STATUS_ICONS: Record<CellStatus, (note?: string) => React.ReactNode> = {
  yes: (note?: string) => (
    <span className="inline-flex items-center gap-1.5 text-emerald-400">
      <Check className="w-4 h-4" />
      {note && <span className="text-xs text-zinc-400">{note}</span>}
    </span>
  ),
  no: (note?: string) => (
    <span className="inline-flex items-center gap-1.5 text-red-400">
      <X className="w-4 h-4" />
      {note && <span className="text-xs text-zinc-400">{note}</span>}
    </span>
  ),
  partial: (note?: string) => (
    <span className="inline-flex items-center gap-1.5 text-amber-400">
      <Minus className="w-4 h-4" />
      {note && <span className="text-xs text-zinc-400">{note}</span>}
    </span>
  ),
  text: (note?: string) => <span className="text-sm text-zinc-300">{note}</span>,
};

/* ─── Non-translatable META arrays ────────────────────── */

interface CompRowMeta {
  mc3d: { status: CellStatus };
  arcode: { status: CellStatus };
}

const COMPARISON_ROWS_META: CompRowMeta[] = [
  { mc3d: { status: 'yes' }, arcode: { status: 'no' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'no' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'yes' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'partial' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'partial' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'yes' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'partial' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'no' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'partial' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'no' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'no' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'no' } },
  { mc3d: { status: 'yes' }, arcode: { status: 'text' } },
  { mc3d: { status: 'text' }, arcode: { status: 'text' } },
  { mc3d: { status: 'text' }, arcode: { status: 'text' } },
];

const WHY_CARDS_META = [
  { icon: Zap, accent: 'cyan' },
  { icon: Shield, accent: 'emerald' },
  { icon: BarChart3, accent: 'purple' },
] as const;

const accentMap: Record<string, { icon: string; bg: string; border: string }> = {
  cyan: {
    icon: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  emerald: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  purple: {
    icon: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
};

/* ─── Component ────────────────────────────────────────── */

const CompareARCode: React.FC = () => {
  const { t } = useTranslation();
  const heroRef = useScrollReveal<HTMLDivElement>();
  const tableRef = useScrollReveal<HTMLDivElement>();
  const whyRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  /* Build translated rows inside component */
  const comparisonRows: ComparisonRow[] = COMPARISON_ROWS_META.map((meta, idx) => {
    const i = idx + 1;
    return {
      feature: t(`compareAR.table.row${i}.feature`),
      mc3d: {
        status: meta.mc3d.status,
        ...(t(`compareAR.table.row${i}.mc3d`, { defaultValue: '' })
          ? { note: t(`compareAR.table.row${i}.mc3d`) }
          : {}),
      },
      arcode: {
        status: meta.arcode.status,
        ...(t(`compareAR.table.row${i}.arcode`, { defaultValue: '' })
          ? { note: t(`compareAR.table.row${i}.arcode`) }
          : {}),
      },
    };
  });

  const whyCards = WHY_CARDS_META.map((meta, idx) => ({
    icon: meta.icon,
    accent: meta.accent,
    title: t(`compareAR.why.card${idx + 1}.title`),
    description: t(`compareAR.why.card${idx + 1}.desc`),
  }));

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'CompareARCode',
        'data-file': 'src/pages/CompareARCode.tsx',
      })}
    >
      <SEO title={t('compareAR.seo.title')} description={t('compareAR.seo.description')} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: t('compare.hero.badge'), path: '/compare' },
          { name: t('compare.more.arCode.title'), path: '/compare/ar-code' },
        ]}
      />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section data-section="hero" className="relative bg-zinc-950 overflow-hidden pt-24 pb-28">
        <div className="absolute inset-0 bg-grid opacity-[0.35] pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div ref={heroRef} className="reveal relative container mx-auto px-4 max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-semibold text-zinc-300 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            {t('compareAR.hero.badge')}
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('compareAR.hero.heading')}{' '}
            <span className="text-gradient">{t('compareAR.hero.headingHighlight')}</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {t('compareAR.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ── Approach Cards ─────────────────────────────────── */}
      <section data-section="approaches" className="relative py-20 bg-zinc-950">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3D Empyre */}
            <div className="relative p-6 rounded-2xl border-2 border-brand-500 bg-zinc-900/40 backdrop-blur-sm">
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-bold uppercase tracking-wider">
                  {t('compareAR.approaches.recommended')}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">
                  {t('compareAR.approaches.mc3d.title')}
                </h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {t('compareAR.approaches.mc3d.desc')}
              </p>
            </div>

            {/* AR Code */}
            <div className="relative p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-zinc-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">
                  {t('compareAR.approaches.arcode.title')}
                </h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {t('compareAR.approaches.arcode.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ───────────────────────────────── */}
      <section data-section="comparison-table" className="relative py-20 bg-zinc-950">
        <div className="absolute inset-0 bg-grid opacity-[0.2] pointer-events-none" />

        <div ref={tableRef} className="reveal relative container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('compareAR.table.badge')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              {t('compareAR.table.heading')}
            </h2>
          </div>

          <div className="relative overflow-x-auto rounded-2xl border border-zinc-800/80">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/60">
                  <th scope="col" className="py-4 px-6 text-sm font-semibold text-zinc-400 w-[40%]">
                    {t('compareAR.table.colFeature')}
                  </th>
                  <th scope="col" className="py-4 px-6 text-center w-[30%]">
                    <div className="text-sm font-bold text-brand-400">
                      {t('compareAR.table.colMC3D')}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {t('compareAR.table.colMC3DSub')}
                    </div>
                  </th>
                  <th scope="col" className="py-4 px-6 text-center w-[30%]">
                    <div className="text-sm font-bold text-zinc-400">
                      {t('compareAR.table.colARCode')}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {t('compareAR.table.colARCodeSub')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-zinc-800/40 ${
                      idx % 2 === 0 ? 'bg-zinc-900/20' : 'bg-zinc-900/40'
                    } hover:bg-zinc-800/30 transition-colors`}
                  >
                    <td className="py-3.5 px-6 text-sm text-zinc-300">{row.feature}</td>
                    <td className="py-3.5 px-6 text-center">
                      {STATUS_ICONS[row.mc3d.status](row.mc3d.note)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {STATUS_ICONS[row.arcode.status](row.arcode.note)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Why Businesses Choose Us ───────────────────────── */}
      <section data-section="why-choose-us" className="relative py-24 bg-zinc-950 overflow-hidden">
        <div className="absolute -top-32 right-1/4 w-[400px] h-[400px] bg-purple-700/10 blur-[100px] rounded-full pointer-events-none" />

        <div ref={whyRef} className="reveal relative container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('compareAR.why.badge')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              {t('compareAR.why.heading')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyCards.map((card) => {
              const a = accentMap[card.accent];
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/80 transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center mb-5`}
                  >
                    <Icon className={`w-6 h-6 ${a.icon}`} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section data-section="cta" className="relative py-24 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />

        <div ref={ctaRef} className="reveal relative container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('compareAR.cta.heading')}
          </h2>
          <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
            {t('compareAR.cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/request"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all duration-200 hover:-translate-y-px hover:shadow-glow"
            >
              {t('cta.getQuote')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/case-studies"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-base transition-all duration-200 backdrop-blur-sm"
            >
              {t('compareAR.cta.caseStudies')}
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
            </Link>
          </div>

          <p className="text-xs text-zinc-500 mt-6">{t('cta.reassurance')}</p>
        </div>
      </section>
    </div>
  );
};

export default CompareARCode;
