import React from 'react';
import type { FeedbackIssueTag } from '@/types/feedback';

const TAG_LABELS: Record<FeedbackIssueTag, { label: string; icon: string }> = {
  long_wait: { label: 'Long wait', icon: '⏳' },
  wrong_order: { label: 'Wrong order', icon: '❌' },
  cold_food: { label: 'Cold food', icon: '🥶' },
  rude_staff: { label: 'Rude staff', icon: '😤' },
  dirty: { label: 'Cleanliness', icon: '🧹' },
  noisy: { label: 'Too noisy', icon: '🔊' },
  overpriced: { label: 'Overpriced', icon: '💰' },
  other: { label: 'Other', icon: '💬' },
};

interface IssueTagsProps {
  selected: FeedbackIssueTag[];
  onChange: (tags: FeedbackIssueTag[]) => void;
  brandColor?: string;
}

const IssueTags: React.FC<IssueTagsProps> = ({ selected, onChange, brandColor }) => {
  const toggle = (tag: FeedbackIssueTag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="What could we improve?">
      {(Object.entries(TAG_LABELS) as [FeedbackIssueTag, { label: string; icon: string }][]).map(
        ([tag, { label, icon }]) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => toggle(tag)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                active
                  ? 'text-white shadow-md scale-105'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
              }`}
              style={
                active
                  ? {
                      backgroundColor: brandColor ?? '#7c3aed',
                      borderColor: brandColor ?? '#7c3aed',
                    }
                  : undefined
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          );
        }
      )}
    </div>
  );
};

export default IssueTags;
