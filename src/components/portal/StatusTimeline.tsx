import React from 'react';
import { Check } from 'lucide-react';

interface TimelineStage {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

interface StatusTimelineProps {
  stages: TimelineStage[];
  orientation?: 'horizontal' | 'vertical';
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  stages,
  orientation = 'horizontal',
}) => {
  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col gap-0">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex gap-3">
            {/* Dot + connector */}
            <div className="flex flex-col items-center">
              <StageIndicator status={stage.status} />
              {i < stages.length - 1 && (
                <div className={`w-0.5 flex-1 min-h-[24px] ${
                  stage.status === 'completed' ? 'bg-brand-600 dark:bg-brand-400' : 'bg-zinc-200 dark:bg-zinc-700'
                }`} />
              )}
            </div>
            {/* Label */}
            <div className="pb-4">
              <p className={`text-sm font-medium ${
                stage.status === 'current'
                  ? 'text-brand-700 dark:text-brand-300'
                  : stage.status === 'completed'
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-400 dark:text-zinc-500'
              }`}>
                {stage.label}
              </p>
              {stage.date && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{stage.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal
  return (
    <div className="flex items-start gap-0 w-full">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full">
            {i > 0 && (
              <div className={`flex-1 h-0.5 ${
                stages[i - 1].status === 'completed' ? 'bg-brand-600 dark:bg-brand-400' : 'bg-zinc-200 dark:bg-zinc-700'
              }`} />
            )}
            <StageIndicator status={stage.status} />
            {i < stages.length - 1 && (
              <div className={`flex-1 h-0.5 ${
                stage.status === 'completed' ? 'bg-brand-600 dark:bg-brand-400' : 'bg-zinc-200 dark:bg-zinc-700'
              }`} />
            )}
          </div>
          <p className={`text-xs font-medium mt-2 text-center ${
            stage.status === 'current'
              ? 'text-brand-700 dark:text-brand-300'
              : stage.status === 'completed'
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-400 dark:text-zinc-500'
          }`}>
            {stage.label}
          </p>
          {stage.date && (
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{stage.date}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const StageIndicator: React.FC<{ status: TimelineStage['status'] }> = ({ status }) => {
  if (status === 'completed') {
    return (
      <div className="w-6 h-6 rounded-full bg-brand-600 dark:bg-brand-500 flex items-center justify-center flex-shrink-0">
        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
      </div>
    );
  }
  if (status === 'current') {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-brand-600 dark:border-brand-400 flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex-shrink-0" />
  );
};
