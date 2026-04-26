import React from 'react';
import type { FeedbackCategory, EmojiRating } from '@/types/feedback';
import { Star } from 'lucide-react';

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  food_quality: 'Food Quality',
  service: 'Service',
  speed: 'Speed',
  ambiance: 'Ambiance',
  order_accuracy: 'Order Accuracy',
};

const CATEGORY_ICONS: Record<FeedbackCategory, string> = {
  food_quality: '🍽️',
  service: '🤝',
  speed: '⚡',
  ambiance: '✨',
  order_accuracy: '✅',
};

interface CategoryRatingProps {
  categories: FeedbackCategory[];
  values: Partial<Record<FeedbackCategory, EmojiRating>>;
  onChange: (category: FeedbackCategory, value: EmojiRating) => void;
  brandColor?: string;
}

const CategoryRating: React.FC<CategoryRatingProps> = ({
  categories,
  values,
  onChange,
  brandColor,
}) => {
  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const current = values[cat] ?? 0;
        return (
          <div key={cat} className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-36 flex-shrink-0">
              <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {CATEGORY_LABELS[cat]}
              </span>
            </div>
            <div
              className="flex gap-1"
              role="radiogroup"
              aria-label={`Rate ${CATEGORY_LABELS[cat]}`}
            >
              {([1, 2, 3, 4, 5] as EmojiRating[]).map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={current === star}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  onClick={() => onChange(cat, star)}
                  className="p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= current
                        ? 'fill-current'
                        : 'text-zinc-300 dark:text-zinc-600'
                    }`}
                    style={
                      star <= current && brandColor
                        ? { color: brandColor }
                        : star <= current
                          ? { color: '#f59e0b' }
                          : undefined
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryRating;
export { CATEGORY_LABELS, CATEGORY_ICONS };
