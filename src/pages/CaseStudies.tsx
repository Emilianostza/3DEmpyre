import React from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import {
  ArrowRight,
  TrendingUp,
  UtensilsCrossed,
  Hotel,
  ShoppingBag,
  Clock,
  Quote,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';

/* ─── Static case study metadata ───────────────────────── */
const CASE_STUDY_META = [
  { id: 'restaurant-paris', icon: UtensilsCrossed, accentColor: 'brand', key: 'study1' },
  { id: 'hotel-athens', icon: Hotel, accentColor: 'cyan', key: 'study2' },
  { id: 'market-tallinn', icon: ShoppingBag, accentColor: 'purple', key: 'study3' },
];

const accentMap: Record<string, { tag: string; glow: string; border: string; metric: string }> = {
  brand: {
    tag: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
    glow: 'bg-brand-600/8',
    border: 'group-hover:border-brand-700/40',
    metric: 'text-brand-400',
  },
  cyan: {
    tag: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    glow: 'bg-cyan-600/8',
    border: 'group-hover:border-cyan-700/40',
    metric: 'text-cyan-400',
  },
  purple: {
    tag: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    glow: 'bg-purple-600/8',
    border: 'group-hover:border-purple-700/40',
    metric: 'text-purple-400',
  },
};

/* ─── Component ────────────────────────────────────────── */
const CaseStudies: React.FC = () => {
  const { t } = useTranslation();
  const heroRef = useScrollReveal<HTMLDivElement>();
  const cardsRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  const CASE_STUDIES = CASE_STUDY_META.map((meta) => ({
    ...meta,
    industry: t(`caseStudies.${meta.key}.industry`),
    company: t(`caseStudies.${meta.key}.company`),
    location: t(`caseStudies.${meta.key}.location`),
    challenge: t(`caseStudies.${meta.key}.challenge`),
    solution: t(`caseStudies.${meta.key}.solution`),
    quote: t(`caseStudies.${meta.key}.quote`),
    quotePerson: t(`caseStudies.${meta.key}.quotePerson`),
    timeline: t(`caseStudies.${meta.key}.timeline`),
    results: [1, 2, 3].map((r) => ({
      value: t(`caseStudies.${meta.key}.result${r}.value`),
      label: t(`caseStudies.${meta.key}.result${r}.label`),
    })),
  }));

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'Case Studies',
        'data-file': 'src/pages/CaseStudies.tsx',
      })}
    >
      <SEO title={t('caseStudies.seo.title')} description={t('caseStudies.seo.desc')} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: t('caseStudies.seo.title'), path: '/case-studies' },
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section data-section="hero" className="relative bg-zinc-950 overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-600/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-purple-700/10 blur-[100px] rounded-full pointer-events-none" />

        <div ref={heroRef} className="reveal relative container mx-auto px-4 max-w-3xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('caseStudies.badge')}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('caseStudies.hero.line1')}
            <br />
            <span className="text-gradient">{t('caseStudies.hero.line2')}</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {t('caseStudies.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ── Case Study Cards ─────────────────────────────── */}
      <section data-section="case-studies" className="relative py-20 bg-zinc-950">
        <div ref={cardsRef} className="reveal-stagger container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col gap-16">
            {CASE_STUDIES.map((study, idx) => {
              const accent = accentMap[study.accentColor];
              const Icon = study.icon;

              return (
                <article
                  key={study.id}
                  style={{ '--stagger-index': idx } as React.CSSProperties}
                  className={`group relative rounded-3xl border border-zinc-800/80 ${accent.border} bg-zinc-900/60 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:shadow-hover`}
                >
                  {/* Subtle glow */}
                  <div
                    className={`absolute -top-20 -right-20 w-[300px] h-[300px] ${accent.glow} blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                  />

                  <div className="relative p-8 md:p-10">
                    {/* Header row */}
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${accent.metric}`} />
                      </div>
                      <span
                        className={`text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${accent.tag}`}
                      >
                        {study.industry}
                      </span>
                      <span className="text-xs text-zinc-600">&middot;</span>
                      <span className="text-sm font-medium text-white">{study.company}</span>
                      <span className="text-xs text-zinc-500">{study.location}</span>
                    </div>

                    {/* Content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
                      {/* Left: narrative */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                            {t('caseStudies.theChallenge')}
                          </h3>
                          <p className="text-sm text-zinc-400 leading-relaxed">{study.challenge}</p>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                            {t('caseStudies.ourSolution')}
                          </h3>
                          <p className="text-sm text-zinc-400 leading-relaxed">{study.solution}</p>
                        </div>

                        {/* Quote */}
                        <div className="relative pl-5 border-l-2 border-zinc-700">
                          <Quote className="absolute -left-2.5 -top-1 w-5 h-5 text-zinc-700 bg-zinc-900" />
                          <p className="text-sm text-zinc-300 italic leading-relaxed">
                            &ldquo;{study.quote}&rdquo;
                          </p>
                          <p className="text-xs text-zinc-500 mt-2">{study.quotePerson}</p>
                        </div>

                        {/* Timeline chip */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/40">
                          <Clock className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          <span className="text-xs text-zinc-400">{study.timeline}</span>
                        </div>
                      </div>

                      {/* Right: metrics */}
                      <div className="flex flex-col gap-4 lg:border-l lg:border-zinc-800 lg:pl-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">
                          {t('caseStudies.results')}
                        </h3>
                        {study.results.map((result, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex flex-col gap-1 p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/30"
                          >
                            <span
                              className={`font-display text-3xl font-bold ${accent.metric} leading-none`}
                            >
                              {result.value}
                            </span>
                            <span className="text-xs text-zinc-500">{result.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card number watermark */}
                  <span className="absolute top-6 right-8 text-6xl font-display font-bold text-zinc-800/30 select-none leading-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Summary Stats ────────────────────────────────── */}
      <section data-section="stats" className="py-16 bg-zinc-950 border-t border-zinc-800/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {
                value: t('caseStudies.summary.stat1.value'),
                label: t('caseStudies.summary.stat1.label'),
              },
              {
                value: t('caseStudies.summary.stat2.value'),
                label: t('caseStudies.summary.stat2.label'),
              },
              {
                value: t('caseStudies.summary.stat3.value'),
                label: t('caseStudies.summary.stat3.label'),
              },
              {
                value: t('caseStudies.summary.stat4.value'),
                label: t('caseStudies.summary.stat4.label'),
              },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-display text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-zinc-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section data-section="cta" className="relative py-24 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />

        <div ref={ctaRef} className="reveal relative container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              {t('caseStudies.cta.badge')}
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('caseStudies.cta.heading')}
          </h2>
          <p className="text-zinc-400 text-lg mb-10">{t('caseStudies.cta.desc')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/request"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all hover:-translate-y-px hover:shadow-glow"
            >
              {t('cta.getQuote')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
            >
              {t('caseStudies.cta.seeHow')}
            </Link>
          </div>
          <p className="text-xs text-zinc-600 mt-6">{t('cta.reassurance')}</p>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;
