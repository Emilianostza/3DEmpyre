import React from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { ArrowRight, Target, Eye, Sparkles, Globe, Shield, Zap, MapPin, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';

/* ─── Static icon/layout data ───────────────────────────── */
const VALUE_ICONS = [Target, Eye, Sparkles, Shield, Zap, Globe];
const MILESTONE_YEARS = ['2024', '2024', '2025', '2026'];

/* ─── Component ─────────────────────────────────────────── */
const About: React.FC = () => {
  const { t } = useTranslation();
  const heroRef = useScrollReveal<HTMLDivElement>();
  const valuesRef = useScrollReveal<HTMLDivElement>();
  const storyRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  const VALUES = VALUE_ICONS.map((icon, idx) => ({
    icon,
    title: t(`about.values.v${idx + 1}.title`),
    desc: t(`about.values.v${idx + 1}.desc`),
  }));

  const STATS = [
    { value: '3', label: t('about.stats.countries') },
    { value: '<10', label: t('about.stats.delivery') },
    { value: '100%', label: t('about.stats.retention') },
    { value: '24h', label: t('about.stats.response') },
  ];

  const MILESTONES = MILESTONE_YEARS.map((year, idx) => ({
    year,
    title: t(`about.journey.m${idx + 1}.title`),
    desc: t(`about.journey.m${idx + 1}.desc`),
  }));

  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'About',
        'data-file': 'src/pages/About.tsx',
      })}
    >
      <SEO title={t('about.seo.title')} description={t('about.seo.desc')} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: t('about.seo.title'), path: '/about' },
        ]}
      />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section data-section="hero" className="relative bg-zinc-950 overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-600/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] bg-cyan-700/8 blur-[100px] rounded-full pointer-events-none" />

        <div ref={heroRef} className="reveal relative container mx-auto px-4 max-w-3xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('about.badge')}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('about.hero.line1')}{' '}
            <span className="text-gradient">{t('about.hero.highlight')}</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section data-section="stats" className="py-14 bg-zinc-950 border-t border-zinc-800/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-display text-3xl md:text-4xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-zinc-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Values ─────────────────────────────────────── */}
      <section data-section="values" className="relative py-24 bg-zinc-950">
        <div ref={valuesRef} className="reveal-stagger container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('about.values.badge')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t('about.values.heading')}
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">{t('about.values.desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  style={{ '--stagger-index': idx } as React.CSSProperties}
                  className="group p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center mb-4 group-hover:border-brand-500/30 transition-colors">
                    <Icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Our Story / Timeline ────────────────────────────── */}
      <section
        data-section="story"
        className="relative py-24 bg-zinc-950 border-t border-zinc-800/40"
      >
        <div ref={storyRef} className="reveal container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              {t('about.journey.badge')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t('about.journey.heading')}
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">{t('about.journey.desc')}</p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800" />

            <div className="space-y-10">
              {MILESTONES.map((milestone, idx) => (
                <div key={idx} className="relative flex gap-6">
                  {/* Dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center z-10 relative">
                      <span className="text-xs font-bold text-zinc-400">{milestone.year}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pb-2 pt-1">
                    <h3 className="font-semibold text-white mb-1">{milestone.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Where We Operate ───────────────────────────────── */}
      <section data-section="coverage" className="py-20 bg-zinc-950 border-t border-zinc-800/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              {t('about.coverage.badge')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              {t('about.coverage.heading')}
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">{t('about.coverage.desc')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                region: t('about.coverage.western'),
                cities: ['Paris', 'Berlin', 'Amsterdam'],
                status: t('about.coverage.active'),
                statusKey: 'Active',
              },
              {
                region: t('about.coverage.southern'),
                cities: ['Athens', 'Barcelona', 'Milan'],
                status: t('about.coverage.active'),
                statusKey: 'Active',
              },
              {
                region: t('about.coverage.northern'),
                cities: ['Tallinn', 'Stockholm', 'Warsaw'],
                status: t('about.coverage.expanding'),
                statusKey: 'Expanding',
              },
            ].map((area) => (
              <div
                key={area.region}
                className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-white text-sm">{area.region}</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {area.cities.map((city) => (
                    <p key={city} className="text-xs text-zinc-500">
                      {city}
                    </p>
                  ))}
                </div>
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    area.statusKey === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {area.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section
        data-section="cta"
        className="relative py-24 bg-zinc-950 overflow-hidden border-t border-zinc-800/40"
      >
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />

        <div ref={ctaRef} className="reveal relative container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            <Award className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-300">
              {t('about.cta.badge')}
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('about.cta.heading')}
          </h2>
          <p className="text-zinc-400 text-lg mb-10">{t('about.cta.desc')}</p>
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
              {t('about.cta.caseStudies')}
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-6">{t('cta.reassurance')}</p>
        </div>
      </section>
    </div>
  );
};

export default About;
