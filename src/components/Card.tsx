import React from 'react';

export type CardVariant = 'default' | 'glass' | 'flat' | 'elevated' | 'bordered' | 'gradient';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  onClick,
  padding = 'none',
}) => {
  const base = 'rounded-2xl transition-all duration-200 ease-spring will-change-transform';

  const variants: Record<CardVariant, string> = {
    // Clean dark card — primary surface
    default: 'bg-zinc-900 border border-zinc-800 shadow-card',

    // Frosted glass — enhanced glassmorphism for overlays, hero sections, feature cards
    glass: 'bg-zinc-900/60 backdrop-blur-xl border border-white/[0.06] shadow-lg shadow-black/10',

    // Flat — zero shadow, subtle border — for dense UI / portals
    flat: 'bg-zinc-900 border border-zinc-800',

    // Elevated — stronger presence, pricing / feature highlight
    elevated: 'bg-zinc-900 border border-zinc-700 shadow-hover',

    // Bordered — outline emphasis, no shadow
    bordered: 'bg-transparent border-2 border-zinc-700',

    // Gradient — premium background with gradient, for feature highlights
    gradient: 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/60 shadow-card',
  };

  const hoverStyles: Partial<Record<CardVariant, string>> = {
    default: 'hover:shadow-hover hover:-translate-y-0.5 hover:border-zinc-700',
    glass: 'hover:shadow-xl hover:border-white/[0.1] hover:-translate-y-0.5 hover:bg-zinc-900/70',
    flat: 'hover:bg-zinc-800 hover:border-zinc-700',
    elevated: 'hover:shadow-glow hover:-translate-y-1',
    bordered: 'hover:border-brand-700 hover:bg-brand-950/20',
    gradient: 'hover:shadow-hover hover:-translate-y-0.5 hover:border-zinc-600',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hover ? (hoverStyles[variant] ?? '') : '';
  const clickableClass = onClick ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950' : '';

  const handleKeyDown = onClick
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }
    : undefined;

  return (
    <div
      className={`${base} ${variants[variant]} ${hoverClass} ${clickableClass} ${paddings[padding]} ${className}`}
      onClick={onClick}
      {...(onClick ? { role: 'button', tabIndex: 0, onKeyDown: handleKeyDown } : {})}
    >
      {children}
    </div>
  );
};

export default React.memo(Card);
