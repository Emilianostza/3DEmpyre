import React from 'react';
import type { EmojiRating as EmojiRatingType } from '@/types/feedback';

const EMOJIS: { value: EmojiRatingType; emoji: string; label: string }[] = [
  { value: 1, emoji: '😡', label: 'Terrible' },
  { value: 2, emoji: '😞', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😍', label: 'Loved it' },
];

interface EmojiRatingProps {
  value: EmojiRatingType | null;
  onChange: (value: EmojiRatingType) => void;
  size?: 'sm' | 'md' | 'lg';
  brandColor?: string;
}

const EmojiRating: React.FC<EmojiRatingProps> = ({
  value,
  onChange,
  size = 'lg',
  brandColor,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-16 h-16 text-4xl',
  };

  return (
    <div className="flex items-center justify-center gap-3" role="radiogroup" aria-label="Rate your experience">
      {EMOJIS.map(({ value: v, emoji, label }) => {
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            onClick={() => onChange(v)}
            className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              selected
                ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 shadow-lg'
                : 'opacity-60 hover:opacity-100 hover:scale-110'
            }`}
            style={
              selected
                ? { boxShadow: brandColor ? `0 0 16px ${brandColor}40` : undefined }
                : undefined
            }
          >
            <span className="select-none">{emoji}</span>
          </button>
        );
      })}
    </div>
  );
};

export default EmojiRating;
export { EMOJIS };
