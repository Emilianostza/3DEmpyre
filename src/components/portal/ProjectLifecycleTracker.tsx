import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, UserCheck, Camera, Cpu, Shield, CheckCircle2, Truck } from 'lucide-react';

// ── Lifecycle stages ────────────────────────────────────────────

interface Stage {
  key: string;
  i18nKey: string;
  icon: React.ElementType;
  /** Statuses that map to this stage (any match = this stage or earlier) */
  statuses: string[];
}

const LIFECYCLE_STAGES: Stage[] = [
  {
    key: 'requested',
    i18nKey: 'lifecycle.requested',
    icon: MessageSquare,
    statuses: ['pending', 'requested'],
  },
  {
    key: 'assigned',
    i18nKey: 'lifecycle.assigned',
    icon: UserCheck,
    statuses: ['assigned'],
  },
  {
    key: 'captured',
    i18nKey: 'lifecycle.captured',
    icon: Camera,
    statuses: ['captured', 'in_progress'],
  },
  {
    key: 'processing',
    i18nKey: 'lifecycle.processing',
    icon: Cpu,
    statuses: ['processing'],
  },
  {
    key: 'qa',
    i18nKey: 'lifecycle.qa',
    icon: Shield,
    statuses: ['qa'],
  },
  {
    key: 'approved',
    i18nKey: 'lifecycle.approved',
    icon: CheckCircle2,
    statuses: ['approved'],
  },
  {
    key: 'delivered',
    i18nKey: 'lifecycle.delivered',
    icon: Truck,
    statuses: ['delivered'],
  },
];

// ── Helpers ─────────────────────────────────────────────────────

function getStageIndex(status: string): number {
  for (let i = 0; i < LIFECYCLE_STAGES.length; i++) {
    if (LIFECYCLE_STAGES[i].statuses.includes(status)) return i;
  }
  return 0;
}

type StepState = 'completed' | 'current' | 'upcoming';

function getStepState(stepIndex: number, currentIndex: number): StepState {
  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
}

// ── Component ───────────────────────────────────────────────────

interface ProjectLifecycleTrackerProps {
  currentStatus: string;
  className?: string;
}

export const ProjectLifecycleTracker: React.FC<ProjectLifecycleTrackerProps> = ({
  currentStatus,
  className = '',
}) => {
  const { t } = useTranslation();
  const currentIndex = getStageIndex(currentStatus);

  return (
    <div
      role="group"
      aria-label={t('lifecycle.label', 'Project lifecycle: currently at {{status}}', {
        status: t(LIFECYCLE_STAGES[currentIndex].i18nKey, LIFECYCLE_STAGES[currentIndex].key),
      })}
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 md:p-6 ${className}`}
    >
      {/* Desktop: horizontal stepper */}
      <div className="flex items-center justify-between w-full">
        {LIFECYCLE_STAGES.map((stage, index) => {
          const state = getStepState(index, currentIndex);
          const Icon = stage.icon;
          const isLast = index === LIFECYCLE_STAGES.length - 1;

          return (
            <React.Fragment key={stage.key}>
              {/* Step circle + label */}
              <div
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                {...(state === 'current' ? { 'aria-current': 'step' as const } : {})}
              >
                {/* Circle */}
                <div
                  className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all
                    ${
                      state === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : state === 'current'
                          ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 ring-2 ring-brand-400/50 dark:ring-brand-500/40'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'
                    }
                  `}
                >
                  {state === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[10px] md:text-xs font-medium text-center leading-tight max-w-[60px] md:max-w-none
                    ${
                      state === 'completed'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : state === 'current'
                          ? 'text-brand-600 dark:text-brand-400 font-semibold'
                          : 'text-zinc-400 dark:text-zinc-600'
                    }
                  `}
                >
                  {t(stage.i18nKey, stage.key)}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-1 md:mx-2 rounded-full
                    ${
                      index < currentIndex
                        ? 'bg-emerald-300 dark:bg-emerald-700'
                        : 'bg-zinc-200 dark:bg-zinc-700 border-t border-dashed border-zinc-300 dark:border-zinc-600 h-0'
                    }
                  `}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
