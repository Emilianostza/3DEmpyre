import React from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Scan,
  QrCode,
  LayoutDashboard,
  Users,
  Sparkles,
  BarChart3,
  CreditCard,
  Building2,
  Smartphone,
  Code2,
  CalendarRange,
  Languages,
  Globe,
  Webhook,
  Monitor,
  Leaf,
  CheckCircle2,
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { BreadcrumbSchema } from '@/components/common/StructuredData';

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Status = 'live' | 'in-progress' | 'coming-soon' | 'planned';

interface Feature {
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
}

interface Phase {
  number: string;
  quarter: string;
  year: string;
  status: Status;
  headlineKey: string;
  subKey: string;
  color: {
    glow: string;
    border: string;
    leftBorder: string;
    badge: string;
    badgeText: string;
    badgeBorder: string;
    dot: string;
    iconBg: string;
    iconText: string;
    phaseLabel: string;
  };
  features: Feature[];
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const STATUS_LABEL_KEYS: Record<Status, string> = {
  live: 'roadmap.status.live',
  'in-progress': 'roadmap.status.inProgress',
  'coming-soon': 'roadmap.status.comingSoon',
  planned: 'roadmap.status.planned',
};

const PHASES: Phase[] = [
  {
    number: '01',
    quarter: 'Q1',
    year: '2025',
    status: 'live',
    headlineKey: 'roadmap.phase01.headline',
    subKey: 'roadmap.phase01.sub',
    color: {
      glow: 'bg-emerald-500/20',
      border: 'border-emerald-500/20',
      leftBorder: 'border-l-emerald-500',
      badge: 'bg-emerald-500/15',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-400',
      phaseLabel: 'text-emerald-400',
    },
    features: [
      {
        icon: Scan,
        titleKey: 'roadmap.phase01.feat1.title',
        descKey: 'roadmap.phase01.feat1.desc',
      },
      {
        icon: QrCode,
        titleKey: 'roadmap.phase01.feat2.title',
        descKey: 'roadmap.phase01.feat2.desc',
      },
      {
        icon: LayoutDashboard,
        titleKey: 'roadmap.phase01.feat3.title',
        descKey: 'roadmap.phase01.feat3.desc',
      },
      {
        icon: Users,
        titleKey: 'roadmap.phase01.feat4.title',
        descKey: 'roadmap.phase01.feat4.desc',
      },
    ],
  },
  {
    number: '02',
    quarter: 'Q2',
    year: '2025',
    status: 'in-progress',
    headlineKey: 'roadmap.phase02.headline',
    subKey: 'roadmap.phase02.sub',
    color: {
      glow: 'bg-amber-500/20',
      border: 'border-amber-500/20',
      leftBorder: 'border-l-amber-500',
      badge: 'bg-amber-500/15',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/30',
      dot: 'bg-amber-400',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-400',
      phaseLabel: 'text-amber-400',
    },
    features: [
      {
        icon: Sparkles,
        titleKey: 'roadmap.phase02.feat1.title',
        descKey: 'roadmap.phase02.feat1.desc',
      },
      {
        icon: BarChart3,
        titleKey: 'roadmap.phase02.feat2.title',
        descKey: 'roadmap.phase02.feat2.desc',
      },
      {
        icon: CreditCard,
        titleKey: 'roadmap.phase02.feat3.title',
        descKey: 'roadmap.phase02.feat3.desc',
      },
      {
        icon: Building2,
        titleKey: 'roadmap.phase02.feat4.title',
        descKey: 'roadmap.phase02.feat4.desc',
      },
    ],
  },
  {
    number: '03',
    quarter: 'Q3',
    year: '2025',
    status: 'coming-soon',
    headlineKey: 'roadmap.phase03.headline',
    subKey: 'roadmap.phase03.sub',
    color: {
      glow: 'bg-brand-600/20',
      border: 'border-brand-500/20',
      leftBorder: 'border-l-brand-500',
      badge: 'bg-brand-500/15',
      badgeText: 'text-brand-300',
      badgeBorder: 'border-brand-500/30',
      dot: 'bg-brand-400',
      iconBg: 'bg-brand-500/10',
      iconText: 'text-brand-400',
      phaseLabel: 'text-brand-400',
    },
    features: [
      {
        icon: Smartphone,
        titleKey: 'roadmap.phase03.feat1.title',
        descKey: 'roadmap.phase03.feat1.desc',
      },
      {
        icon: Code2,
        titleKey: 'roadmap.phase03.feat2.title',
        descKey: 'roadmap.phase03.feat2.desc',
      },
      {
        icon: CalendarRange,
        titleKey: 'roadmap.phase03.feat3.title',
        descKey: 'roadmap.phase03.feat3.desc',
      },
      {
        icon: Languages,
        titleKey: 'roadmap.phase03.feat4.title',
        descKey: 'roadmap.phase03.feat4.desc',
      },
    ],
  },
  {
    number: '04',
    quarter: 'Q4',
    year: '2025',
    status: 'planned',
    headlineKey: 'roadmap.phase04.headline',
    subKey: 'roadmap.phase04.sub',
    color: {
      glow: 'bg-zinc-500/10',
      border: 'border-zinc-700/40',
      leftBorder: 'border-l-zinc-600',
      badge: 'bg-zinc-700/30',
      badgeText: 'text-zinc-400',
      badgeBorder: 'border-zinc-600/40',
      dot: 'bg-zinc-500',
      iconBg: 'bg-zinc-700/30',
      iconText: 'text-zinc-400',
      phaseLabel: 'text-zinc-400',
    },
    features: [
      {
        icon: Globe,
        titleKey: 'roadmap.phase04.feat1.title',
        descKey: 'roadmap.phase04.feat1.desc',
      },
      {
        icon: Webhook,
        titleKey: 'roadmap.phase04.feat2.title',
        descKey: 'roadmap.phase04.feat2.desc',
      },
      {
        icon: Monitor,
        titleKey: 'roadmap.phase04.feat3.title',
        descKey: 'roadmap.phase04.feat3.desc',
      },
      {
        icon: Leaf,
        titleKey: 'roadmap.phase04.feat4.title',
        descKey: 'roadmap.phase04.feat4.desc',
      },
    ],
  },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const StatusBadge: React.FC<{ status: Status; color: Phase['color'] }> = ({ status, color }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${color.badge} ${color.badgeText} ${color.badgeBorder}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot} ${status === 'live' ? 'animate-pulse' : ''}`}
      />
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  );
};

const PhaseProgressBar: React.FC = () => {
  const { t } = useTranslation();
  const steps: { labelKey: string; status: Status }[] = [
    { labelKey: 'roadmap.progress.q1', status: 'live' },
    { labelKey: 'roadmap.progress.q2', status: 'in-progress' },
    { labelKey: 'roadmap.progress.q3', status: 'coming-soon' },
    { labelKey: 'roadmap.progress.q4', status: 'planned' },
  ];
  const colors: Record<Status, string> = {
    live: 'bg-emerald-500 text-emerald-300',
    'in-progress': 'bg-amber-500 text-amber-300',
    'coming-soon': 'bg-brand-500 text-brand-300',
    planned: 'bg-zinc-600 text-zinc-400',
  };
  const dotColors: Record<Status, string> = {
    live: 'bg-emerald-400 ring-emerald-400/30',
    'in-progress': 'bg-amber-400 ring-amber-400/30',
    'coming-soon': 'bg-brand-400 ring-brand-400/30',
    planned: 'bg-zinc-600 ring-zinc-600/30',
  };
  return (
    <div className="flex items-center justify-center gap-0 flex-wrap sm:flex-nowrap">
      {steps.map((step, i) => (
        <React.Fragment key={step.labelKey}>
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ring-4 ring-offset-2 ring-offset-zinc-950 ${dotColors[step.status]} ${step.status === 'live' ? 'animate-pulse' : ''}`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${colors[step.status].split(' ')[1]}`}
            >
              {t(step.labelKey)}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="hidden sm:block h-px flex-1 min-w-[32px] max-w-[80px] bg-zinc-700 mx-2 mb-5" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

const Roadmap: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="bg-zinc-950 min-h-screen"
      {...(import.meta.env.DEV && {
        'data-component': 'Roadmap',
        'data-file': 'src/pages/Roadmap.tsx',
      })}
    >
      <SEO title={t('roadmap.seo.title')} description={t('roadmap.seo.desc')} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', path: '/' },
          { name: t('roadmap.seo.title'), path: '/roadmap' },
        ]}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        data-section="hero"
        className="relative overflow-hidden pt-24 pb-20 border-b border-zinc-800"
      >
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-700/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-emerald-700/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-[350px] h-[350px] bg-amber-700/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative container mx-auto px-4 max-w-4xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('roadmap.hero.badge')}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('roadmap.hero.heading')}
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              {t('roadmap.hero.headingHighlight')}
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            {t('roadmap.hero.subtitle')}
          </p>
          <PhaseProgressBar />
        </div>
      </section>

      {/* ── Phases ────────────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/40 via-amber-500/20 to-zinc-800/0 pointer-events-none hidden md:block" />

        {PHASES.map((phase, phaseIndex) => (
          <section
            data-section={`phase-${phase.number}`}
            key={phase.number}
            className={`relative py-20 border-b border-zinc-800/60 overflow-hidden ${phaseIndex % 2 === 0 ? 'bg-zinc-950' : 'bg-zinc-900/30'}`}
          >
            {/* Ambient glow */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] ${phase.color.glow} blur-[100px] rounded-full pointer-events-none opacity-60`}
            />

            <div className="relative container mx-auto px-4 max-w-5xl">
              {/* Phase header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-12">
                <div className="flex items-center gap-5">
                  {/* Phase number circle */}
                  <div
                    className={`w-14 h-14 rounded-2xl border ${phase.color.border} ${phase.color.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={`font-display text-lg font-bold ${phase.color.phaseLabel}`}>
                      {phase.number}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        {phase.quarter} {phase.year}
                      </span>
                      <StatusBadge status={phase.status} color={phase.color} />
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                      Phase {phase.number} — {t(phase.headlineKey)}
                    </h2>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed md:max-w-xs md:text-right">
                  {t(phase.subKey)}
                </p>
              </div>

              {/* Feature cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {phase.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.titleKey}
                      className={`group relative p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 border-l-4 ${phase.color.leftBorder} backdrop-blur-sm hover:bg-zinc-900/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl ${phase.color.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <Icon className={`w-5 h-5 ${phase.color.iconText}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-bold text-white text-sm leading-snug">
                              {t(feature.titleKey)}
                            </h3>
                            {phase.status === 'live' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 leading-relaxed">
                            {t(feature.descKey)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        data-section="cta"
        className="relative py-20 overflow-hidden border-t border-zinc-800"
      >
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-brand-700/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative container mx-auto px-4 max-w-2xl text-center">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">
            {t('roadmap.cta.label')}
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
            {t('roadmap.cta.heading')}
          </h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{t('roadmap.cta.desc')}</p>
          <Link
            to="/request"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-xs hover:shadow-glow hover:-translate-y-px active:translate-y-0"
          >
            {t('roadmap.cta.button')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Roadmap;
