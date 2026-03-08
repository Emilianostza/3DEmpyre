import React, { useState, useEffect, useRef } from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Smartphone,
  Maximize2,
} from 'lucide-react';
import { HOW_IT_WORKS_STEPS, PLATFORM_CAPABILITIES } from '@/constants';
import Accordion from '@/components/Accordion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useCountUp } from '@/hooks/useCountUp';
import { SEO } from '@/components/common/SEO';
import {
  OrganizationSchema,
  WebSiteSchema,
  LocalBusinessSchema,
  FAQSchema,
} from '@/components/common/StructuredData';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { DEMO_MODELS, PLACEHOLDER_BEFORE, PLACEHOLDER_AFTER } from '@/config/site';

/** Animated stat that counts up when the hero loads */
const AnimatedStat: React.FC<{
  end: number;
  prefix?: string;
  suffix?: string;
  label: string;
  delay?: number;
}> = ({ end, prefix = '', suffix = '', label, delay = 0 }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setEnabled(true), delay + 500);
    return () => clearTimeout(timer);
  }, [delay]);

  const display = useCountUp({ end, prefix, suffix, enabled, duration: 1800 });

  return (
    <div className="flex flex-col">
      <span className="font-display text-2xl font-bold text-white tabular-nums">
        {enabled ? display : `${prefix}0${suffix}`}
      </span>
      <span className="text-xs text-zinc-500 mt-0.5">{label}</span>
    </div>
  );
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const howItWorksRef = useScrollReveal<HTMLDivElement>();
  const howItWorksGridRef = useScrollReveal<HTMLDivElement>();
  const beforeAfterRef = useScrollReveal<HTMLDivElement>();
  const liveDemoRef = useScrollReveal<HTMLDivElement>();
  const liveDemoViewerRef = useScrollReveal<HTMLDivElement>();
  const capabilitiesRef = useScrollReveal<HTMLDivElement>();
  const capabilitiesGridRef = useScrollReveal<HTMLDivElement>();
  const faqRef = useScrollReveal<HTMLDivElement>();
  const trustRef = useScrollReveal<HTMLDivElement>();
  const roadmapRef = useScrollReveal<HTMLDivElement>();
  const [showScrollCue, setShowScrollCue] = useState(true);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  // Load model-viewer web component
  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  // Hide scroll cue after user scrolls
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100) setShowScrollCue(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      {...(import.meta.env.DEV && {
        'data-component': 'Home Page',
        'data-file': 'src/pages/Home.tsx',
      })}
    >
      <SEO
        title="Home"
        description="Expert 3D capture services delivered to your door. We create production-ready 3D & AR assets for restaurants, retail, and enterprise in under a week."
      />
      <OrganizationSchema />
      <WebSiteSchema />
      <LocalBusinessSchema />
      <FAQSchema
        items={[
          { question: t('home.faq.q1'), answer: t('home.faq.a1') },
          { question: t('home.faq.q2'), answer: t('home.faq.a2') },
          { question: t('home.faq.q3'), answer: t('home.faq.a3') },
          { question: t('home.faq.q4'), answer: t('home.faq.a4') },
        ]}
      />
      {/* Hero */}
      <section
        data-section="hero"
        className="relative bg-zinc-950 text-white overflow-hidden min-h-[92vh] flex items-center"
      >
        {/* Background layers */}
        <div className="absolute inset-0 bg-grid opacity-[0.35] pointer-events-none" />
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-50" />

        {/* Ambient glow orbs - more vivid */}
        <div className="absolute -top-40 -left-32 w-[500px] h-[500px] bg-brand-600/25 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-[400px] h-[400px] bg-purple-700/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-[300px] h-[300px] bg-cyan-700/15 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative container mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* ── Left: Copy ─────────────────────── */}
          <div className="flex flex-col gap-7 z-10">
            {/* Announcement badge */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-semibold text-zinc-300 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              {t('home.badge')}
            </div>

            {/* Headline */}
            <div className="animate-slide-up">
              <h1 className="font-display text-5xl md:text-[4.5rem] font-bold tracking-tight leading-[1.08] text-white">
                {t('home.hero.line1')}
                <br />
                <span className="text-gradient">{t('home.hero.line2')}</span>
              </h1>
            </div>

            {/* Subheading */}
            <p
              className="text-lg md:text-xl text-zinc-400 max-w-md leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '150ms' }}
            >
              {t('home.hero.subtitle')}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in-up"
              style={{ animationDelay: '250ms' }}
            >
              <Link
                to="/request"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all duration-200 hover:-translate-y-px hover:shadow-glow shadow-xs"
              >
                {t('cta.getQuote')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/industries/restaurants"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-base transition-all duration-200 backdrop-blur-sm"
              >
                {t('home.hero.seeExamples')}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
              </Link>
            </div>

            {/* No credit card reassurance */}
            <p
              className="text-xs text-zinc-500 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              {t('cta.reassurance')}
            </p>

            {/* Stats strip — animated counters in glass card */}
            <div
              className="glass-card rounded-xl px-6 py-4 flex flex-wrap gap-8 animate-fade-in-up"
              style={{ animationDelay: '350ms' }}
            >
              <AnimatedStat
                end={10}
                prefix="<"
                suffix=" days"
                label={t('home.stats.delivery')}
                delay={0}
              />
              <AnimatedStat end={100} suffix="%" label={t('home.stats.retention')} delay={150} />
              <AnimatedStat end={3} label={t('home.stats.countries')} delay={300} />
            </div>
          </div>

          {/* ── Right: 3D Viewer ───────────────── */}
          <div
            className="relative h-[520px] w-full flex items-center justify-center animate-blur-in"
            style={{ animationDelay: '200ms' }}
          >
            {/* Viewer frame with animated border */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/8 shadow-modal bg-zinc-900/40 backdrop-blur-sm ring-1 ring-white/5 animated-border">
              <model-viewer
                src={DEMO_MODELS.astronaut.glb}
                ios-src={DEMO_MODELS.astronaut.usdz}
                poster={DEMO_MODELS.astronaut.poster}
                alt="3D astronaut statue showcase — rotate to explore"
                shadow-intensity="1"
                camera-controls
                disable-zoom
                auto-rotate
                ar
                loading="eager"
                reveal="auto"
                touch-action="pan-y"
                style={{ width: '100%', height: '100%' } as React.CSSProperties}
              />

              {/* Viewer UI chrome */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-zinc-400 whitespace-nowrap">
                {t('home.viewer.heroHint')}
              </div>
            </div>

            {/* Floating glow behind the viewer */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-brand-600/10 blur-[60px]" />
          </div>
        </div>

        {/* Scroll-down cue */}
        {showScrollCue && (
          <div
            ref={scrollCueRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-fade-in cursor-pointer z-10 transition-opacity duration-500"
            style={{ animationDelay: '1.2s' }}
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Scroll down"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
              {t('home.hero.scroll')}
            </span>
            <ChevronDown className="w-4 h-4 text-zinc-500 animate-bounce-soft" />
          </div>
        )}

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
      </section>

      {/* Trust Bar */}
      <section data-section="trust-bar" className="py-10 bg-zinc-900/50 border-t border-zinc-800/40 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-brand-500/30 before:to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>{t('home.trust.soc2')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>{t('home.trust.gdpr')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>{t('home.trust.enterprise')}</span>
              </div>
            </div>
            <p className="text-xs text-zinc-600 tracking-wider uppercase">
              {t('home.trust.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story — Why "3D Empyre"? */}
      <section
        data-section="brand-story"
        className="py-20 bg-zinc-950 border-t border-zinc-800/40 relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-brand-600/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative container mx-auto px-4 max-w-2xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('home.brandStory.badge')}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            {t('home.brandStory.heading')}{' '}
            <span className="text-gradient">{t('home.brandStory.headingHighlight')}</span>
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            {t('home.brandStory.p1')}
          </p>
          <p className="text-zinc-500 leading-relaxed text-sm">
            {t('home.brandStory.p2')}
          </p>
        </div>
      </section>

      {/* Before / After — interactive demo */}
      <section
        data-section="before-after"
        className="py-20 bg-zinc-950 border-t border-zinc-800/40 overflow-hidden relative"
      >
        {/* Purple glow behind slider */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full" />
        </div>

        <div ref={beforeAfterRef} className="reveal container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-10">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('home.beforeAfter.badge')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.beforeAfter.heading')}{' '}
              <span className="text-gradient">{t('home.beforeAfter.headingHighlight')}</span>
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">{t('home.beforeAfter.desc')}</p>
          </div>

          <div className="glass-card rounded-2xl p-1 overflow-hidden">
            <BeforeAfterSlider
              beforeSrc={PLACEHOLDER_BEFORE}
              beforeAlt={t('home.beforeAfter.before')}
              afterSrc={PLACEHOLDER_AFTER}
              afterAlt={t('home.beforeAfter.after')}
              beforeLabel={t('home.beforeAfter.before')}
              afterLabel={t('home.beforeAfter.after')}
              className="aspect-[8/5]"
            />
          </div>

          <p className="text-center text-xs text-zinc-600 mt-4">{t('home.beforeAfter.caption')}</p>
        </div>
      </section>

      {/* Live Demo — Try Our 3D Viewer */}
      <section
        data-section="live-demo"
        className="relative py-24 bg-zinc-950 border-t border-zinc-800/40 overflow-hidden"
      >
        {/* Background texture */}
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-700/10 blur-[120px] rounded-full pointer-events-none" />

        <div ref={liveDemoRef} className="reveal relative container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('home.demo.badge')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.demo.heading')}{' '}
              <span className="text-gradient">{t('home.demo.headingHighlight')}</span>{' '}
              {t('home.demo.headingSuffix')}
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">{t('home.demo.desc')}</p>
          </div>

          {/* Viewer + Feature highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* 3D Viewer — takes 3/5 on large screens */}
            <div ref={liveDemoViewerRef} className="reveal-scale lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900/60 shadow-modal">
                {/* Title bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">3dempyre.com/viewer</span>
                  <div className="w-12" />
                </div>

                {/* model-viewer */}
                <div className="aspect-[4/3] bg-zinc-950">
                  <model-viewer
                    src={DEMO_MODELS.materialSuite.glb}
                    poster={DEMO_MODELS.materialSuite.poster}
                    alt="3D material suite product render — interactive viewer with AR"
                    shadow-intensity="1.2"
                    camera-controls
                    disable-zoom
                    auto-rotate
                    ar
                    loading="lazy"
                    reveal="auto"
                    environment-image="neutral"
                    touch-action="pan-y"
                    style={{ width: '100%', height: '100%' } as React.CSSProperties}
                  />
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/60 bg-zinc-900/80">
                  <span className="text-[10px] text-zinc-500">{t('home.viewer.demoHint')}</span>
                  <span className="text-[10px] text-brand-400 font-medium">
                    {t('home.viewer.arReady')}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature highlights — takes 2/5 */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="glass-card p-5 rounded-2xl hover:border-brand-500/40 transition-colors group">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-600/20 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 text-brand-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                    {t('home.demo.feature1.title')}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {t('home.demo.feature1.desc')}
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl hover:border-brand-500/40 transition-colors group">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-purple-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {t('home.demo.feature2.title')}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {t('home.demo.feature2.desc')}
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl hover:border-brand-500/40 transition-colors group">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-cyan-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {t('home.demo.feature3.title')}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {t('home.demo.feature3.desc')}
                </p>
              </div>

              <Link
                to="/request"
                className="group mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-glow shadow-xs w-full"
              >
                {t('home.demo.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-center text-[11px] text-zinc-600">{t('cta.reassurance')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section
        data-section="capabilities"
        className="relative py-24 bg-zinc-950 border-t border-zinc-800/40 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-40 right-1/4 w-[400px] h-[400px] bg-purple-700/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-[350px] h-[350px] bg-brand-700/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative container mx-auto px-4 max-w-6xl">
          <div ref={capabilitiesRef} className="reveal text-center mb-16">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('home.capabilities.badge')}
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
              {t('home.capabilities.heading')}{' '}
              <span className="text-gradient">{t('home.capabilities.headingHighlight')}</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {t('home.capabilities.desc')}
            </p>
          </div>

          <div
            ref={capabilitiesGridRef}
            className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {PLATFORM_CAPABILITIES.map((cap, idx) => {
              const colorMap: Record<string, { iconBg: string; iconText: string; hoverBorder: string }> = {
                brand: { iconBg: 'bg-brand-500/10', iconText: 'text-brand-400', hoverBorder: 'hover:border-brand-500/40' },
                purple: { iconBg: 'bg-purple-500/10', iconText: 'text-purple-400', hoverBorder: 'hover:border-purple-500/40' },
                cyan: { iconBg: 'bg-cyan-500/10', iconText: 'text-cyan-400', hoverBorder: 'hover:border-cyan-500/40' },
                green: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', hoverBorder: 'hover:border-emerald-500/40' },
                amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-400', hoverBorder: 'hover:border-amber-500/40' },
                rose: { iconBg: 'bg-rose-500/10', iconText: 'text-rose-400', hoverBorder: 'hover:border-rose-500/40' },
                emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', hoverBorder: 'hover:border-emerald-500/40' },
                orange: { iconBg: 'bg-orange-500/10', iconText: 'text-orange-400', hoverBorder: 'hover:border-orange-500/40' },
              };
              const c = colorMap[cap.color] || colorMap.brand;

              return (
                <div
                  key={cap.id}
                  className={`group relative p-6 rounded-2xl glass-card ${c.hoverBorder} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20`}
                  style={{ '--stagger-index': idx } as React.CSSProperties}
                >
                  <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center mb-4`}>
                    <span className={c.iconText}>{cap.icon}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-brand-300 transition-colors">
                    {t(`home.capabilities.${cap.id}.title`)}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {t(`home.capabilities.${cap.id}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section data-section="how-it-works" className="relative py-28 bg-zinc-950 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        {/* Gradient glow top-center */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div ref={howItWorksRef} className="reveal text-center mb-20">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('home.howItWorks.badge')}
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
              {t('home.howItWorks.heading')}{' '}
              <span className="text-gradient">{t('home.howItWorks.headingHighlight')}</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {t('home.howItWorks.desc')}
            </p>
          </div>

          {/* Steps grid */}
          <div
            ref={howItWorksGridRef}
            className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          >
            {/* Connecting line — desktop only */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-700/50 to-transparent pointer-events-none" />

            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div key={idx} className="relative group flex flex-col items-center text-center" style={{ '--stagger-index': idx } as React.CSSProperties}>
                {/* Icon bubble */}
                <div className="relative mb-6 z-10">
                  <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center text-brand-400 group-hover:text-brand-300 group-hover:border-brand-600/60 transition-all duration-300 shadow-lg group-hover:shadow-glow">
                    <span className="[&>svg]:w-7 [&>svg]:h-7">{step.icon}</span>
                  </div>
                  {/* Step number chip - larger with gradient */}
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {idx + 1}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-brand-300 transition-colors">
                  {t(`home.howItWorks.step${idx + 1}.title`)}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-[180px]">
                  {t(`home.howItWorks.step${idx + 1}.desc`)}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 flex flex-col items-center gap-3">
            <p className="text-zinc-500 text-sm">
              {t('home.howItWorks.turnaround')}{' '}
              <span className="text-zinc-300 font-medium">
                {t('home.howItWorks.turnaroundValue')}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
              <Link
                to="/request"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all duration-200 hover:-translate-y-px hover:shadow-glow"
              >
                {t('cta.getQuote')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm text-zinc-500 hover:text-zinc-300 underline underline-offset-4 transition-colors"
              >
                {t('home.howItWorks.seeProcess')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section data-section="faq" className="py-24 bg-zinc-950 border-t border-zinc-800/40 relative overflow-hidden">
        {/* Subtle background gradient mesh */}
        <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-30" />

        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <div ref={faqRef} className="reveal text-center mb-12">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              {t('home.faq.badge')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">{t('home.faq.heading')}</h2>
          </div>
          <Accordion
            items={[
              {
                title: t('home.faq.q1'),
                content: <p>{t('home.faq.a1')}</p>,
              },
              {
                title: t('home.faq.q2'),
                content: <p>{t('home.faq.a2')}</p>,
              },
              {
                title: t('home.faq.q3'),
                content: <p>{t('home.faq.a3')}</p>,
              },
              {
                title: t('home.faq.q4'),
                content: <p>{t('home.faq.a4')}</p>,
              },
            ]}
          />
          <div className="mt-10 text-center">
            <Link
              to="/pricing"
              className="text-sm text-brand-400 font-semibold hover:text-brand-300 underline underline-offset-4 transition-colors"
            >
              {t('home.faq.moreLink')}
            </Link>
          </div>
        </div>
      </section>

      {/* Roadmap teaser */}
      <section
        data-section="roadmap"
        className="py-16 bg-zinc-950 relative overflow-hidden border-t border-zinc-800"
      >
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[160px] bg-brand-700/15 blur-[80px] rounded-full pointer-events-none" />
        <div
          ref={roadmapRef}
          className="reveal relative container mx-auto px-4 max-w-3xl text-center"
        >
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('home.roadmap.badge')}
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
            {t('home.roadmap.line1')}
            <br className="hidden sm:block" /> {t('home.roadmap.line2')}
          </h2>
          <p className="text-zinc-400 text-sm mb-8 max-w-lg mx-auto">{t('home.roadmap.desc')}</p>
          <Link
            to="/roadmap"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-xs hover:shadow-glow hover:-translate-y-px active:translate-y-0"
          >
            {t('home.roadmap.cta')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section
        data-section="testimonials"
        className="py-20 bg-zinc-950 border-t border-zinc-800/40"
      >
        <div className="container mx-auto px-4 max-w-2xl">
          <div ref={trustRef} className="reveal">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-600 mb-10">
              {t('home.testimonial.label')}
            </p>
            <div className="glass-card flex flex-col p-6 rounded-2xl hover:shadow-hover transition-shadow duration-300 border-t-2 border-t-brand-500/30 relative">
              {/* Quotation mark decoration */}
              <span className="absolute top-2 left-2 text-7xl text-brand-500/15 font-serif select-none pointer-events-none leading-none">&quot;</span>

              <p className="text-sm text-zinc-400 leading-relaxed italic flex-1">
                &ldquo;{t('home.testimonial.quote')}&rdquo;
              </p>
              <div className="mt-5 pt-4 border-t border-zinc-800">
                <p className="text-sm font-semibold text-white">{t('home.testimonial.name')}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{t('home.testimonial.title')}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{t('home.testimonial.location')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
