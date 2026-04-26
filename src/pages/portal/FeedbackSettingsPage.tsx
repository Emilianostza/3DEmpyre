/**
 * FeedbackSettingsPage — Form Builder for Restaurant Owners
 *
 * Allows owners to customize their customer feedback form:
 * brand color, categories, custom question, incentives, thresholds, etc.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Save,
  Loader2,
  ExternalLink,
  QrCode,
  Eye,
  ToggleLeft,
  ToggleRight,
  BarChart3,
} from 'lucide-react';
import { usePortalContext } from '@/types/portal';
import { useToast } from '@/contexts/ToastContext';
import { FeedbackProvider } from '@/services/dataProvider';
import type {
  FeedbackFormConfig,
  FeedbackFormConfigUpsertDTO,
  FeedbackCategory,
  EmojiRating,
} from '@/types/feedback';
import { ALL_FEEDBACK_CATEGORIES } from '@/types/feedback';
import { CATEGORY_LABELS } from '@/components/feedback/CategoryRating';

const PROJECT_ID = 'PRJ-001'; // TODO: derive from portal context

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] =
  ALL_FEEDBACK_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));

const FeedbackSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { role } = usePortalContext();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<FeedbackFormConfig | null>(null);

  // Form fields
  const [active, setActive] = useState(true);
  const [brandColor, setBrandColor] = useState('#d97706');
  const [categoriesEnabled, setCategoriesEnabled] = useState<FeedbackCategory[]>([
    'food_quality',
    'service',
    'speed',
  ]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [incentiveText, setIncentiveText] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [thankYouMessage, setThankYouMessage] = useState(
    'Thank you for your feedback! We truly appreciate it.'
  );
  const [lowScoreThreshold, setLowScoreThreshold] = useState<EmojiRating>(2);
  const [lowScoreMessage, setLowScoreMessage] = useState(
    "We're sorry about your experience. We'd love to make it right."
  );
  const [highScoreRedirectUrl, setHighScoreRedirectUrl] = useState('');
  const [language, setLanguage] = useState('en');

  // Load config
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await FeedbackProvider.getConfig(PROJECT_ID);
        if (cancelled) return;
        if (cfg) {
          setConfig(cfg);
          setActive(cfg.active);
          setBrandColor(cfg.brand_color);
          setCategoriesEnabled(cfg.categories_enabled);
          setCustomQuestion(cfg.custom_question ?? '');
          setIncentiveText(cfg.incentive_text ?? '');
          setDiscountCode(cfg.discount_code ?? '');
          setThankYouMessage(cfg.thank_you_message);
          setLowScoreThreshold(cfg.low_score_threshold);
          setLowScoreMessage(cfg.low_score_message);
          setHighScoreRedirectUrl(cfg.high_score_redirect_url ?? '');
          setLanguage(cfg.language);
        }
      } catch {
        showError('Failed to load feedback settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showError]);

  const toggleCategory = useCallback((cat: FeedbackCategory) => {
    setCategoriesEnabled((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dto: FeedbackFormConfigUpsertDTO = {
        active,
        brand_color: brandColor,
        categories_enabled: categoriesEnabled,
        custom_question: customQuestion.trim() || undefined,
        incentive_text: incentiveText.trim() || undefined,
        discount_code: discountCode.trim() || undefined,
        thank_you_message: thankYouMessage,
        low_score_threshold: lowScoreThreshold,
        low_score_message: lowScoreMessage,
        high_score_redirect_url: highScoreRedirectUrl.trim() || undefined,
        language,
      };
      const saved = await FeedbackProvider.saveConfig(PROJECT_ID, dto);
      setConfig(saved);
      success(t('portal.toast.settingsSaved', 'Settings saved'));
    } catch {
      showError('Failed to save feedback settings');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm';
  const labelCls = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const feedbackUrl = `${window.location.origin}/project/${PROJECT_ID}/feedback`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            {t('portal.feedback.title', 'Customer Feedback')}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t(
              'portal.feedback.desc',
              'Customize your feedback form and track customer satisfaction.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </Link>
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </a>
        </div>
      </div>

      {/* Active toggle + QR Link */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Form Status
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {active
                ? 'Your feedback form is live and accepting responses.'
                : 'Your feedback form is currently disabled.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className="text-3xl transition-colors"
            aria-label={active ? 'Disable form' : 'Enable form'}
          >
            {active ? (
              <ToggleRight className="w-10 h-10 text-green-500" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-zinc-400" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
          <QrCode className="w-5 h-5 text-zinc-500 flex-shrink-0" />
          <code className="text-xs text-zinc-600 dark:text-zinc-400 break-all flex-1">
            {feedbackUrl}
          </code>
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 hover:text-brand-600 flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Appearance
          </h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label htmlFor="fb-brand-color" className={labelCls}>
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="fb-brand-color"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className={inputCls}
                style={{ maxWidth: '140px' }}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={inputCls}
              style={{ maxWidth: '200px' }}
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Questions
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Step 1 (overall rating) is always shown. Choose which category ratings appear in
            Step 2.
          </p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className={labelCls}>Category Ratings</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(({ value, label }) => {
                const enabled = categoriesEnabled.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleCategory(value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      enabled
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700'
                        : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="fb-custom-q" className={labelCls}>
              Custom Question (optional)
            </label>
            <input
              id="fb-custom-q"
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder='e.g. "How did you hear about us?"'
              maxLength={200}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Incentive */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Incentive
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Show a discount code on the thank-you screen to drive return visits.
          </p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label htmlFor="fb-incentive-text" className={labelCls}>
              Incentive Message
            </label>
            <input
              id="fb-incentive-text"
              type="text"
              value={incentiveText}
              onChange={(e) => setIncentiveText(e.target.value)}
              placeholder="e.g. Get 10% off your next visit!"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="fb-discount-code" className={labelCls}>
              Discount Code
            </label>
            <input
              id="fb-discount-code"
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="e.g. THANKS10"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Thank You & Alerts */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Thank You & Alerts
          </h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label htmlFor="fb-thankyou" className={labelCls}>
              Thank You Message
            </label>
            <textarea
              id="fb-thankyou"
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              rows={2}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="fb-low-threshold" className={labelCls}>
                Low Score Alert Threshold
              </label>
              <select
                id="fb-low-threshold"
                value={lowScoreThreshold}
                onChange={(e) =>
                  setLowScoreThreshold(Number(e.target.value) as EmojiRating)
                }
                className={inputCls}
              >
                <option value={1}>1 — Only the worst</option>
                <option value={2}>2 — Bad and below</option>
                <option value={3}>3 — Neutral and below</option>
              </select>
            </div>
            <div>
              <label htmlFor="fb-redirect" className={labelCls}>
                Google Review URL (optional)
              </label>
              <input
                id="fb-redirect"
                type="url"
                value={highScoreRedirectUrl}
                onChange={(e) => setHighScoreRedirectUrl(e.target.value)}
                placeholder="https://g.page/r/..."
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="fb-low-msg" className={labelCls}>
              Low Score Recovery Message
            </label>
            <textarea
              id="fb-low-msg"
              value={lowScoreMessage}
              onChange={(e) => setLowScoreMessage(e.target.value)}
              rows={2}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackSettingsPage;
