import React from 'react';
import { type HTMLMotionProps, motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { buttonInteraction } from '@/components/motion/presets';

export type ButtonVariant =
  | 'primary'
  | 'gradient'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'ghost-brand'
  | 'danger'
  | 'danger-outline';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isIconOnly = !children && Boolean(icon);

  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 ease-spring focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants: Record<ButtonVariant, string> = {
    // Solid indigo — workhorse CTA
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500 shadow-xs hover:shadow-soft hover:-translate-y-px active:translate-y-0',

    // Gradient — hero / signature CTA
    gradient:
      'bg-gradient-brand text-white hover:opacity-90 active:opacity-100 focus-visible:ring-brand-500 shadow-xs hover:shadow-glow hover:-translate-y-px active:translate-y-0',

    // Zinc — secondary actions (dark-only)
    secondary:
      'bg-zinc-800 border border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-600 hover:text-white focus-visible:ring-zinc-400 shadow-xs hover:shadow-card',

    // Outlined brand
    outline:
      'bg-transparent border-2 border-brand-400 text-brand-400 hover:bg-brand-950/30 hover:border-brand-500 focus-visible:ring-brand-500',

    // Transparent — no border
    ghost:
      'bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:ring-zinc-400',

    // Transparent — brand tint on hover
    'ghost-brand':
      'bg-transparent text-brand-400 hover:bg-brand-950/40 hover:text-brand-300 focus-visible:ring-brand-500',

    // Danger — destructive solid
    danger:
      'bg-error text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500 shadow-xs hover:shadow-soft hover:-translate-y-px active:translate-y-0',

    // Danger — outlined
    'danger-outline':
      'bg-transparent border-2 border-error text-error hover:bg-red-950/30 hover:text-red-400 focus-visible:ring-red-500',
  };

  const sizes: Record<ButtonSize, string> = {
    xs: isIconOnly ? 'p-1.5' : 'px-3 py-1.5 text-xs',
    sm: isIconOnly ? 'p-2' : 'px-4 py-2 text-sm',
    md: isIconOnly ? 'p-2.5' : 'px-5 py-2.5 text-sm',
    lg: isIconOnly ? 'p-3' : 'px-6 py-3 text-base',
    xl: isIconOnly ? 'p-3.5' : 'px-8 py-4 text-lg',
  };

  const iconSizes: Record<ButtonSize, string> = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  };

  const spinner = loading ? (
    <Loader2 className={`${iconSizes[size]} animate-spin flex-shrink-0`} />
  ) : null;

  const iconEl =
    icon && !loading ? (
      <span className={`${iconSizes[size]} flex-shrink-0 flex items-center justify-center`}>
        {icon}
      </span>
    ) : null;

  return (
    <motion.button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...(!disabled && !loading && !prefersReducedMotion ? buttonInteraction : {})}
      {...props}
    >
      {loading && spinner}
      {!loading && icon && iconPosition === 'left' && iconEl}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && iconEl}
    </motion.button>
  );
};

export default React.memo(Button);
