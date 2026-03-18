/**
 * Framer Motion presets — shared animation variants, springs, and helpers.
 *
 * Usage:
 *   import { pageVariants, springs, staggerContainer } from '@/components/motion/presets';
 */
import { type Transition, type Variants, useReducedMotion } from 'framer-motion';

// ─── Springs ──────────────────────────────────────────────────────────────────

export const springs = {
  /** Route transitions — smooth but purposeful */
  page: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  /** UI feedback — snappy interactions */
  snappy: { type: 'spring', stiffness: 500, damping: 35 } as Transition,
  /** Modals, sheets — gentle float-in */
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  /** Playful bounce — toasts, badges */
  bounce: { type: 'spring', stiffness: 400, damping: 15 } as Transition,
} as const;

// ─── Page Transition Variants ─────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 60,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springs.page,
  },
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.96,
    transition: { ...springs.page, duration: 0.25 },
  },
};

/** Reverse direction for back navigation */
export const pageVariantsBack: Variants = {
  initial: {
    opacity: 0,
    x: -60,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springs.page,
  },
  exit: {
    opacity: 0,
    x: 40,
    scale: 0.96,
    transition: { ...springs.page, duration: 0.25 },
  },
};

// ─── Stagger Variants ─────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.snappy,
  },
};

// ─── Modal / Sheet Variants ───────────────────────────────────────────────────

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.97,
    transition: { duration: 0.2 },
  },
};

export const sheetFromBottom: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: springs.gentle },
  exit: { y: '100%', transition: { duration: 0.25 } },
};

export const sheetFromRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: springs.gentle },
  exit: { x: '100%', transition: { duration: 0.25 } },
};

export const sheetFromLeft: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: springs.gentle },
  exit: { x: '-100%', transition: { duration: 0.25 } },
};

// ─── Portal-specific Variants ────────────────────────────────────────────────

export const portalFadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const portalCardEnter: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: springs.snappy },
};

// ─── Toast Variants ───────────────────────────────────────────────────────────

export const toastVariants: Variants = {
  initial: { opacity: 0, x: 80, scale: 0.85 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springs.bounce,
  },
  exit: {
    opacity: 0,
    x: 80,
    scale: 0.85,
    transition: { duration: 0.2 },
  },
};

// ─── Dropdown Variants ────────────────────────────────────────────────────────

export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scaleY: 0.8,
    scaleX: 0.95,
    y: -4,
    transformOrigin: 'top',
  },
  visible: {
    opacity: 1,
    scaleY: 1,
    scaleX: 1,
    y: 0,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scaleY: 0.8,
    scaleX: 0.95,
    y: -4,
    transition: { duration: 0.12 },
  },
};

// ─── Interactive Presets (hover / tap) ────────────────────────────────────────

export const buttonInteraction = {
  whileHover: { scale: 1.04, transition: { type: 'spring', stiffness: 500, damping: 20 } },
  whileTap: { scale: 0.96, transition: { duration: 0.1 } },
} as const;

export const cardInteraction = {
  whileHover: { y: -4, transition: springs.snappy },
};

// ─── Accessibility Helper ─────────────────────────────────────────────────────

/**
 * Returns animation props that are disabled when user prefers reduced motion.
 * Wrap any motion component's animate/transition props through this.
 */
export { useReducedMotion };

/** Instant variants for reduced-motion users */
export const instantTransition: Transition = { duration: 0 };
