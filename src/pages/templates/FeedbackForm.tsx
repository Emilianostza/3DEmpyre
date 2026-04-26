/**
 * FeedbackForm — Customer-facing feedback page
 *
 * Public page accessed via QR code at /project/:id/feedback.
 * 3-step wizard: Overall rating → Category ratings → Comment + contact.
 * Mobile-first, no auth required.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { FeedbackProvider } from '@/services/dataProvider';
import type {
  FeedbackFormConfig,
  FeedbackSubmitDTO,
  FeedbackCategory,
  FeedbackIssueTag,
  EmojiRating,
} from '@/types/feedback';
import EmojiRatingComponent from '@/components/feedback/EmojiRating';
import CategoryRating from '@/components/feedback/CategoryRating';
import IssueTags from '@/components/feedback/IssueTags';
import StepIndicator from '@/components/feedback/StepIndicator';
import ThankYouScreen from '@/components/feedback/ThankYouScreen';

// ── State ─────────────────────────────────────────────────────────────────────

interface FormState {
  overall_rating: EmojiRating | null;
  category_ratings: Partial<Record<FeedbackCategory, EmojiRating>>;
  issue_tags: FeedbackIssueTag[];
  comment: string;
  custom_answer: string;
  contact_name: string;
  contact_email: string;
}

const INITIAL_STATE: FormState = {
  overall_rating: null,
  category_ratings: {},
  issue_tags: [],
  comment: '',
  custom_answer: '',
  contact_name: '',
  contact_email: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

const FeedbackForm: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [config, setConfig] = useState<FeedbackFormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  const totalSteps = config?.categories_enabled.length ? 3 : 2;
  const brandColor = config?.brand_color ?? '#7c3aed';

  // Load config
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const cfg = await FeedbackProvider.getConfig(projectId);
        if (cancelled) return;
        if (!cfg || !cfg.active) {
          setError('This feedback form is not available.');
        } else {
          setConfig(cfg);
        }
      } catch {
        if (!cancelled) setError('Failed to load feedback form.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Handlers
  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setCategoryRating = useCallback(
    (cat: FeedbackCategory, val: EmojiRating) => {
      setForm((prev) => ({
        ...prev,
        category_ratings: { ...prev.category_ratings, [cat]: val },
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!projectId || !form.overall_rating) return;
    setSubmitting(true);
    try {
      const data: FeedbackSubmitDTO = {
        overall_rating: form.overall_rating,
        category_ratings: Object.keys(form.category_ratings).length
          ? form.category_ratings
          : undefined,
        comment: form.comment.trim() || undefined,
        issue_tags: form.issue_tags.length ? form.issue_tags : undefined,
        custom_answer: form.custom_answer.trim() || undefined,
        contact_name: form.contact_name.trim() || undefined,
        contact_email: form.contact_email.trim() || undefined,
      };
      await FeedbackProvider.submit(projectId, data);
      setSubmitted(true);
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [projectId, form]);

  const canAdvance = step === 1 ? form.overall_rating !== null : true;

  const next = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };
  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center space-y-3">
          <p className="text-4xl">😔</p>
          <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!config) return null;

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="w-full max-w-sm mx-auto">
          <ThankYouScreen
            rating={form.overall_rating!}
            thankYouMessage={config.thank_you_message}
            lowScoreThreshold={config.low_score_threshold}
            lowScoreMessage={config.low_score_message}
            highScoreRedirectUrl={config.high_score_redirect_url}
            incentiveText={config.incentive_text}
            discountCode={config.discount_code}
            brandColor={brandColor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          {config.logo_url && (
            <img
              src={config.logo_url}
              alt=""
              className="w-12 h-12 rounded-xl mx-auto mb-3 object-contain"
            />
          )}
          <StepIndicator current={step} total={totalSteps} brandColor={brandColor} />
        </div>

        {/* Step 1: Overall rating */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                How was your experience?
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Tap to rate — it only takes a moment
              </p>
            </div>
            <EmojiRatingComponent
              value={form.overall_rating}
              onChange={(v) => setField('overall_rating', v)}
              brandColor={brandColor}
            />
          </div>
        )}

        {/* Step 2: Category ratings (only if categories enabled) */}
        {step === 2 && config.categories_enabled.length > 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                A bit more detail
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Rate each area — skip any you like
              </p>
            </div>
            <CategoryRating
              categories={config.categories_enabled}
              values={form.category_ratings}
              onChange={setCategoryRating}
              brandColor={brandColor}
            />
          </div>
        )}

        {/* Step 3 (or 2 if no categories): Comment + tags + contact */}
        {step === totalSteps && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {form.overall_rating && form.overall_rating <= 3
                  ? 'What could we improve?'
                  : 'Anything else?'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                This step is optional
              </p>
            </div>

            {/* Issue tags (shown for neutral/negative ratings) */}
            {form.overall_rating && form.overall_rating <= 3 && (
              <IssueTags
                selected={form.issue_tags}
                onChange={(tags) => setField('issue_tags', tags)}
                brandColor={brandColor}
              />
            )}

            {/* Comment */}
            <textarea
              value={form.comment}
              onChange={(e) => setField('comment', e.target.value)}
              placeholder="Share your thoughts (optional)"
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
            />

            {/* Custom question */}
            {config.custom_question && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {config.custom_question}
                </label>
                <input
                  type="text"
                  value={form.custom_answer}
                  onChange={(e) => setField('custom_answer', e.target.value)}
                  maxLength={200}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                />
              </div>
            )}

            {/* Contact info (especially for low scores) */}
            {form.overall_rating && form.overall_rating <= (config.low_score_threshold ?? 2) ? (
              <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Want us to follow up? Leave your details below.
                </p>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => setField('contact_name', e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                />
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setField('contact_email', e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <button
            type="button"
            onClick={next}
            disabled={!canAdvance || submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 shadow-md"
            style={{ backgroundColor: brandColor }}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step === totalSteps ? (
              <>
                Submit
                <Send className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Submit error */}
        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
