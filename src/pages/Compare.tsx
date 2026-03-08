import React from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Check,
  X,
  Minus,
  Camera,
  Smartphone,
  MonitorOff,
  Clock,
  Award,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';

/* ─── Comparison Data ───────────────────────────────────── */

type CellStatus = 'yes' | 'no' | 'partial' | 'text';

interface CompRow {
  feature: string;
  managed: { status: CellStatus; text?: string };
  diy: { status: CellStatus; text?: string };
  none: { status: CellStatus; text?: string };
}

interface CompRowMeta {
  managed: { status: CellStatus };
  diy: { status: CellStatus };
  none: { status: CellStatus };
}

const COMPARISON_ROWS_META: CompRowMeta[] = [
  { managed: { status: 'yes' }, diy: { status: 'partial' }, none: { status: 'no' } },
  { managed: { status: 'yes' }, diy: { status: 'partial' }, none: { status: 'no' } },
  { managed: { status: 'text' }, diy: { status: 'text' }, none: { status: 'text' } },
  { managed: { status: 'text' }, diy: { status: 'text' }, none: { status: 'text' } },
  { managed: { status: 'text' }, diy: { status: 'text' }, none: { status: 'text' } },
  { managed: { status: 'yes' }, diy: { status: 'no' }, none: { status: 'no' } },
  { managed: { status: 'yes' }, diy: { status: 'partial' }, none: { status: 'no' } },
  { managed: { status: 'yes' }, diy: { status: 'partial' }, none: { status: 'no' } },
  { managed: { status: 'yes' }, diy: { status: 'no' }, none: { status: 'no' } },
  { managed: { status: 'yes' }, diy: { status: 'no' }, none: { status: 'no' } },
  { managed: { status: 'yes' }, diy: { status: 'no' }, none: { status: 'text' } },
  { managed: { status: 'yes' }, diy: { status: 'no' }, none: { status: 'no' } },
];

const STATS_META = [
  { icon: TrendingUp, accent: 'brand' },
  { icon: Clock, accent: 'cyan' },
  { icon: Award, accent: 'purple' },
  { icon: ShieldCheck, accent: 'emerald' },
] as const;

const STATUS_ICONS: Record<CellStatus, React.ReactNode> = {
  yes: <Check className="w-4 h-4 text-emerald-400" />,
  no: <X className="w-4 h-4 text-red-400/60" />,
  partial: <Minus className="w-4 h-4 text-amber-400" />,
  text: null,
};

/* ─── Component ─────────────────────────────────────────── */
const Compare: React.FC = () => {
  const { t } = useTranslation();
  const heroRef = useScrollReveal<HTMLDivElement>();
  const tableRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  /* Build translated rows inside component */
  const comparisonRows: CompRow[] = COMPARISON_ROWS_META.map((meta, idx) => {
    const i = idx + 1;
    return {
      feature: t(`compare.table.row${i}.feature`),
      managed: {
        status: meta.managed.status,
        ...(t(`compare.table.row${i}.managed`, { defaultValue: '' })
          ? { text: t(`compare.table.row${i}.managed`) }
          : {}),
      },
      diy: {
        status: meta.diy.status,
        ...(t(`compare.table.row${i}.diy`, { defaultValue: '' })
          ? { text: t(`compare.table.row${i}.diy`) }
          : {}),
      },
      none: {
        status: meta.none.status,
        ...(t(`compare.table.row${i}.none`, { defaultValue: '' })
          ? { text: t(`compare.table.row${i}.none`) }
          : {}),
      },
    };
  });

  const stats = STATS_META.map((meta, idx) => ({
    icon: meta.icon,
    accent: meta.accent,
    value: t(`compare.stats.s${idx + 1}.value`),
    label: t(`compare.stats.s${idx + 1}.label`),
    desc: t(`compare.stats.s${idx + 1}.desc`),
  }));

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'Compare',
        'data-file': 'src/pages/Compare.tsx',
      })}
    >
      <SEO title={t('compare.seo.title')} description={t('compare.seo.description')} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: t('compare.hero.badge'), path: '/compare' },
        ]}
      />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section data-section="hero" className="relative bg-zinc-950 overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div ref={heroRef} className="reveal relative container mx-auto px-4 max-w-3xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('compare.hero.badge')}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('compare.hero.heading')}
            <br />
            <span className="text-gradient">{t('compare.hero.headingHighlight')}</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {t('compare.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ── Three Approaches ───────────────────────────────── */}
      <section data-section="approaches" className="py-16 bg-zinc-950 border-t border-zinc-800/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Managed */}
            <div className="relative p-6 rounded-2xl border-2 border-brand-500/40 bg-brand-500/5">
              <div className="absolute -top-3 left-6">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-brand-600 text-white">
                  {t('compare.approaches.recommended')}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                <Camera className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                {t('compare.approaches.managed.title')}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {t('compare.approaches.managed.desc')}
              </p>
            </div>

            {/* DIY */}
            <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5 text-zinc-500" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                {t('compare.approaches.diy.title')}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {t('compare.approaches.diy.desc')}
              </p>
            </div>

            {/* No 3D */}
            <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center mb-4">
                <MonitorOff className="w-5 h-5 text-zinc-500" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                {t('compare.approaches.none.title')}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {t('compare.approaches.none.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ────────────────────────────────── */}
      <section data-section="comparison-table" className="py-20 bg-zinc-950">
        <div ref={tableRef} className="reveal container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              {t('compare.table.heading')}
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">{t('compare.table.subtitle')}</p>
          </div>

          <div className="relative overflow-x-auto rounded-2xl border border-zinc-800/80">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 w-[40%]">
                    {t('compare.table.colFeature')}
                  </th>
                  <th scope="col" className="text-center px-4 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
                        {t('compare.table.colManaged')}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {t('compare.table.colManagedSub')}
                      </span>
                    </div>
                  </th>
                  <th scope="col" className="text-center px-4 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                        {t('compare.table.colDiy')}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {t('compare.table.colDiySub')}
                      </span>
                    </div>
                  </th>
                  <th scope="col" className="text-center px-4 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                        {t('compare.table.colNone')}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {t('compare.table.colNoneSub')}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-zinc-800/50 last:border-0 ${
                      i % 2 === 0 ? 'bg-zinc-900/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-zinc-300 font-medium">{row.feature}</td>
                    {(['managed', 'diy', 'none'] as const).map((col) => {
                      const cell = row[col];
                      return (
                        <td
                          key={col}
                          className={`text-center px-4 py-4 ${
                            col === 'managed' ? 'bg-brand-500/[0.03]' : ''
                          }`}
                        >
                          {cell.status === 'text' ? (
                            <span
                              className={`text-xs font-medium ${
                                col === 'managed' ? 'text-brand-400' : 'text-zinc-500'
                              }`}
                            >
                              {cell.text}
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              {STATUS_ICONS[cell.status]}
                              {cell.text && (
                                <span className="text-xs text-zinc-500">{cell.text}</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Impact Stats ───────────────────────────────────── */}
      <section data-section="stats" className="py-16 bg-zinc-950 border-t border-zinc-800/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {t('compare.stats.badge')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              {t('compare.stats.heading')}
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">{t('compare.stats.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ icon: Icon, value, label, desc, accent }) => (
              <div
                key={label}
                className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 text-center"
              >
                <div
                  className={`w-9 h-9 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                    accent === 'brand'
                      ? 'bg-brand-500/10 border border-brand-500/20'
                      : accent === 'cyan'
                        ? 'bg-cyan-500/10 border border-cyan-500/20'
                        : accent === 'purple'
                          ? 'bg-purple-500/10 border border-purple-500/20'
                          : 'bg-emerald-500/10 border border-emerald-500/20'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      accent === 'brand'
                        ? 'text-brand-400'
                        : accent === 'cyan'
                          ? 'text-cyan-400'
                          : accent === 'purple'
                            ? 'text-purple-400'
                            : 'text-emerald-400'
                    }`}
                  />
                </div>
                <span
                  className={`font-display text-2xl font-bold block ${
                    accent === 'brand'
                      ? 'text-brand-400'
                      : accent === 'cyan'
                        ? 'text-cyan-400'
                        : accent === 'purple'
                          ? 'text-purple-400'
                          : 'text-emerald-400'
                  }`}
                >
                  {value}
                </span>
                <p className="text-xs text-zinc-400 mt-1">{label}</p>
                <p className="text-[10px] text-zinc-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── More Comparisons ─────────────────────────────────── */}
      <section
        data-section="more-comparisons"
        className="py-16 bg-zinc-950 border-t border-zinc-800/40"
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-white mb-3">
              {t('compare.more.heading')}
            </h2>
            <p className="text-zinc-400 text-sm">{t('compare.more.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/compare/ar-code"
              className="group p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all"
            >
              <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1.5">
                {t('compare.more.arCode.title')}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {t('compare.more.arCode.desc')}
              </p>
            </Link>
            <Link
              to="/compare/menus"
              className="group p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all"
            >
              <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors mb-1.5">
                {t('compare.more.menus.title')}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {t('compare.more.menus.desc')}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section
        data-section="cta"
        className="relative py-24 bg-zinc-950 overflow-hidden border-t border-zinc-800/40"
      >
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />

        <div ref={ctaRef} className="reveal relative container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('compare.cta.heading')}
          </h2>
          <p className="text-zinc-400 text-lg mb-10">{t('compare.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/request"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all hover:-translate-y-px hover:shadow-glow"
            >
              {t('cta.getQuote')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/case-studies"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
            >
              {t('compare.cta.caseStudies')}
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-6">{t('cta.reassurance')}</p>
        </div>
      </section>
    </div>
  );
};

export default Compare;
