import React from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import type { EmojiRating } from '@/types/feedback';

interface ThankYouScreenProps {
  rating: EmojiRating;
  thankYouMessage: string;
  lowScoreThreshold: EmojiRating;
  lowScoreMessage: string;
  highScoreRedirectUrl?: string;
  incentiveText?: string;
  discountCode?: string;
  brandColor?: string;
}

const ThankYouScreen: React.FC<ThankYouScreenProps> = ({
  rating,
  thankYouMessage,
  lowScoreThreshold,
  lowScoreMessage,
  highScoreRedirectUrl,
  incentiveText,
  discountCode,
  brandColor,
}) => {
  const isLowScore = rating <= lowScoreThreshold;
  const isHighScore = rating >= 4;
  const accentColor = brandColor ?? '#7c3aed';

  return (
    <div className="text-center space-y-6 py-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <CheckCircle2 className="w-8 h-8" style={{ color: accentColor }} />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {isLowScore ? 'We hear you' : 'Thank you!'}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xs mx-auto">
          {isLowScore ? lowScoreMessage : thankYouMessage}
        </p>
      </div>

      {incentiveText && discountCode && !isLowScore && (
        <div
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: `${accentColor}08`,
            borderColor: `${accentColor}30`,
          }}
        >
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {incentiveText}
          </p>
          <div
            className="inline-block px-4 py-2 rounded-lg font-mono font-bold text-lg tracking-wider"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor,
            }}
          >
            {discountCode}
          </div>
        </div>
      )}

      {isHighScore && highScoreRedirectUrl && (
        <a
          href={highScoreRedirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-md"
          style={{ backgroundColor: accentColor }}
        >
          Leave us a Google review
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
};

export default ThankYouScreen;
