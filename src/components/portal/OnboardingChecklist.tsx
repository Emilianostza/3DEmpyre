import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  X,
  Rocket,
  FolderPlus,
  UserCheck,
  ClipboardCheck,
  Truck,
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
} from 'lucide-react';
import { Project, Asset } from '@/types';
import { staggerContainer, staggerItem } from '@/components/motion/presets';

// ── Types ───────────────────────────────────────────────────────

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  action?: { label: string; path: string };
}

interface OnboardingChecklistProps {
  role: 'employee' | 'customer';
  projects: Project[];
  assets: Asset[];
  onDismiss: () => void;
}

// ── Storage key ─────────────────────────────────────────────────

const STORAGE_PREFIX = 'portal_onboarding_dismissed_';

export function isOnboardingDismissed(role: string): boolean {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${role}`) === 'true';
  } catch {
    return false;
  }
}

export function dismissOnboarding(role: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${role}`, 'true');
  } catch {
    // localStorage may be unavailable
  }
}

// ── Component ───────────────────────────────────────────────────

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  role,
  projects,
  assets,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  // Auto-hide if already dismissed
  useEffect(() => {
    if (isOnboardingDismissed(role)) {
      setVisible(false);
    }
  }, [role]);

  if (!visible) return null;

  // Build steps based on role
  const steps: OnboardingStep[] =
    role === 'employee'
      ? [
          {
            id: 'create',
            label: t('onboarding.employee.step1', 'Create your first project'),
            description: t(
              'onboarding.employee.step1.desc',
              'Start by creating a new capture project for your client'
            ),
            icon: FolderPlus,
            completed: projects.length > 0,
            action: { label: t('onboarding.createProject', 'New Project'), path: 'projects' },
          },
          {
            id: 'assign',
            label: t('onboarding.employee.step2', 'Assign a technician'),
            description: t(
              'onboarding.employee.step2.desc',
              'Choose a technician to handle the on-site capture'
            ),
            icon: UserCheck,
            completed: projects.some((p) => p.assigned_to),
          },
          {
            id: 'approve',
            label: t('onboarding.employee.step3', 'Review & approve'),
            description: t(
              'onboarding.employee.step3.desc',
              'Review captured assets and approve for delivery'
            ),
            icon: ClipboardCheck,
            completed: projects.some((p) => p.status === 'approved' || p.status === 'delivered'),
          },
          {
            id: 'deliver',
            label: t('onboarding.employee.step4', 'Deliver to customer'),
            description: t(
              'onboarding.employee.step4.desc',
              'Ship the finished 3D experience to your client'
            ),
            icon: Truck,
            completed: projects.some((p) => p.status === 'delivered'),
          },
        ]
      : [
          {
            id: 'explore',
            label: t('onboarding.customer.step1', 'Explore your dashboard'),
            description: t(
              'onboarding.customer.step1.desc',
              'Take a look around your project overview'
            ),
            icon: LayoutDashboard,
            completed: true, // Always completed once they're on the dashboard
          },
          {
            id: 'browse',
            label: t('onboarding.customer.step2', 'Browse your menus'),
            description: t(
              'onboarding.customer.step2.desc',
              'View your 3D menu assets and share them'
            ),
            icon: UtensilsCrossed,
            completed: assets.length > 0,
            action: { label: t('onboarding.viewProjects', 'View Projects'), path: 'projects' },
          },
          {
            id: 'share',
            label: t('onboarding.customer.step3', 'Share via QR code'),
            description: t(
              'onboarding.customer.step3.desc',
              'Generate a QR code to share with your customers'
            ),
            icon: QrCode,
            completed: false,
          },
        ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleDismiss = () => {
    dismissOnboarding(role);
    setVisible(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-950/20 dark:to-violet-950/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {t('onboarding.title', 'Getting started')}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('onboarding.subtitle', 'Complete these steps to set up your workspace')}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label={t('onboarding.dismiss', 'Dismiss')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t('onboarding.progress', '{{completed}} of {{total}} complete', {
                  completed: completedCount,
                  total: totalCount,
                })}
              </span>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="px-5 py-3 space-y-1"
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  variants={staggerItem}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    step.completed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/10'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                  }`}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${step.completed ? 'text-emerald-500' : 'text-zinc-400 dark:text-zinc-500'}`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-sm font-medium ${
                          step.completed
                            ? 'text-emerald-700 dark:text-emerald-400 line-through'
                            : 'text-zinc-900 dark:text-white'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 ml-6">
                      {step.description}
                    </p>
                  </div>

                  {/* Action CTA */}
                  {!step.completed && step.action && (
                    <button
                      onClick={() => navigate(step.action?.path ?? '/')}
                      className="flex-shrink-0 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20"
                    >
                      {step.action.label}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
