import React from 'react';

interface StepIndicatorProps {
  current: number;
  total: number;
  brandColor?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total, brandColor }) => {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const filled = step <= current;
        return (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === current ? 'w-8' : 'w-4'
            } ${!filled ? 'bg-zinc-300 dark:bg-zinc-600' : ''}`}
            style={filled ? { backgroundColor: brandColor ?? '#7c3aed' } : undefined}
          />
        );
      })}
    </div>
  );
};

export default StepIndicator;
