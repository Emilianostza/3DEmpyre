import React from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CalendarClock,
  ScanFace,
  Cpu,
  Rocket,
  Store,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HOW_IT_WORKS_STEPS } from '@/constants';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';

/* ─── Timeline icons & colors (static) ─────────────────── */
const TIMELINE_META = [
  { icon: ClipboardList, color: 'brand' },
  { icon: CalendarClock, color: 'cyan' },
  { icon: ScanFace, color: 'purple' },
  { icon: Cpu, color: 'orange' },
  { icon: Rocket, color: 'green' },
];

const colorMap: Record<string, { icon: string; ring: string; label: string }> = {
  brand: {
    icon: 'text-brand-400',
    ring: 'group-hover:ring-brand-500/10',
    label: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
  },
  cyan: {
    icon: 'text-cyan-400',
    ring: 'group-hover:ring-cyan-500/10',
    label: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  },
  purple: {
    icon: 'text-purple-400',
    ring: 'group-hover:ring-purple-500/10',
    label: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
  orange: {
    icon: 'text-orange-400',
    ring: 'group-hover:ring-orange-500/10',
    label: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  },
  green: {
    icon: 'text-emerald-400',
    ring: 'group-hover:ring-emerald-500/10',
    label: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
};

/* ─── Component ─────────────────────────────────────────── */
const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  const TIMELINE = TIMELINE_META.map((meta, idx) => ({
    ...meta,
    day: t(`howItWorks.timeline.step${idx + 1}.day`),
    label: t(`howItWorks.timeline.step${idx + 1}.label`),
    description: t(`howItWorks.timeline.step${idx + 1}.desc`),
  }));

  const INCLUDES = Array.from({ length: 8 }, (_, i) => t(`howItWorks.includes.item${i + 1}`));

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'How It Works',
        'data-file': 'src/pages/HowItWorks.tsx',
      })}
    >
      <SEO title={t('howItWorks.seo.title')} description={t('howItWorks.seo.desc')} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: t('howItWorks.seo.title'), path: '/how-it-works' },
        ]}
      />
      {/* ── Hero ─────────────────────────────────────────── */}
      <section data-section="hero" className="relative bg-zinc-950 overflow-hidden pt-24 pb-28">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative container mx-auto px-4 max-w-3xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('howItWorks.badge')}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('howItWorks.hero.line1')}
            <br />
            <span className="text-gradient">{t('howItWorks.hero.line2')}</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            {t('howItWorks.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/request"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all hover:-translate-y-px hover:shadow-glow"
            >
              {t('cta.getQuote')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/library"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
            >
              {t('howItWorks.hero.viewSamples')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4-step overview ──────────────────────────────── */}
      <section
        data-section="overview"
        className="relative py-20 bg-zinc-950 border-b border-zinc-800"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-brand-800 hover:shadow-hover transition-all duration-300"
              >
                {/* Large ghost step number */}
                <span className="text-4xl font-display font-bold text-zinc-800 select-none absolute top-4 right-5 group-hover:text-brand-950 transition-colors leading-none">
                  0{idx + 1}
                </span>

                <div className="w-12 h-12 rounded-xl bg-brand-950/40 flex items-center justify-center text-brand-400 mb-5 group-hover:bg-brand-900/40 transition-colors relative z-10">
                  <span className="[&>svg]:w-5 [&>svg]:h-5">{step.icon}</span>
                </div>

                <h3 className="font-semibold text-white mb-2 relative z-10">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Detailed Timeline ─────────────────────────────── */}
      <section data-section="timeline" className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t('howItWorks.timeline.heading')}
            </h2>
            <p className="text-zinc-400">{t('howItWorks.timeline.desc')}</p>
          </div>

          <div className="relative">
            {/* Vertical spine */}
            <div className="absolute left-[21px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-500/60 via-brand-400/20 to-transparent pointer-events-none" />

            <div className="space-y-0">
              {TIMELINE.map((item, idx) => {
                const c = colorMap[item.color];
                const Icon = item.icon;
                const isLast = idx === TIMELINE.length - 1;

                return (
                  <div key={idx} className="relative flex gap-6 group">
                    {/* Icon dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`relative z-10 w-11 h-11 rounded-full bg-zinc-900 border-2 border-zinc-700 group-hover:border-brand-400 flex items-center justify-center ring-4 ring-transparent ${c.ring} transition-all duration-300 shadow-card`}
                      >
                        <Icon className={`w-5 h-5 ${c.icon} transition-colors`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-10'}`}>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${c.label}`}
                        >
                          {item.day}
                        </span>
                        <h3 className="text-base font-semibold text-white">{item.label}</h3>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>

                      {isLast && (
                        <div className="mt-4 inline-flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">
                            {t('howItWorks.timeline.complete')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── What's included ───────────────────────────────── */}
      <section data-section="includes" className="py-20 bg-zinc-900 border-y border-zinc-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-12">
            {t('howItWorks.includes.heading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INCLUDES.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 border border-zinc-800"
              >
                <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <span className="text-sm font-medium text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Model Library callout ──────────────────────────── */}
      <section data-section="library" className="py-12 bg-zinc-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-emerald-800/60 transition-all">
            <div className="w-14 h-14 rounded-xl bg-emerald-950/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Store className="w-7 h-7" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-white mb-1">
                {t('howItWorks.library.heading')}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {t('howItWorks.library.desc')}
              </p>
            </div>
            <Link
              to="/library"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all whitespace-nowrap"
            >
              {t('howItWorks.library.cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section data-section="cta" className="relative py-24 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />

        <div className="relative container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('howItWorks.cta.heading')}
          </h2>
          <p className="text-zinc-400 text-lg mb-10">{t('howItWorks.cta.desc')}</p>
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
              {t('howItWorks.cta.viewPricing')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
