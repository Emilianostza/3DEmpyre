/**
 * FeedbackDashboardPage — Analytics dashboard for feedback responses
 *
 * Shows: overall score, rating distribution, category breakdown,
 * trend over time, recent responses, and low-score alerts.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  Star,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  Mail,
  Clock,
} from 'lucide-react';
import { FeedbackProvider } from '@/services/dataProvider';
import type { FeedbackDashboardData, FeedbackCategory, EmojiRating } from '@/types/feedback';
import { CATEGORY_LABELS } from '@/components/feedback/CategoryRating';
import { EMOJIS } from '@/components/feedback/EmojiRating';

const PROJECT_ID = 'PRJ-001'; // TODO: derive from portal context

// ── Small chart helpers (pure CSS/Tailwind, no library) ──────────────────────

const RatingBar: React.FC<{ rating: EmojiRating; count: number; max: number }> = ({
  rating,
  count,
  max,
}) => {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const emoji = EMOJIS.find((e) => e.value === rating);
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-center text-lg">{emoji?.emoji}</span>
      <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-amber-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-zinc-500 w-8 text-right">{count}</span>
    </div>
  );
};

const CategoryBar: React.FC<{ label: string; avg: number }> = ({ label, avg }) => {
  const pct = (avg / 5) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="font-semibold text-zinc-900 dark:text-white">{avg.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-brand-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Time formatting ──────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Component ────────────────────────────────────────────────────────────────

const FeedbackDashboardPage: React.FC = () => {
  const [data, setData] = useState<FeedbackDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await FeedbackProvider.getDashboard(PROJECT_ID);
        if (!cancelled) setData(d);
      } catch {
        // silently fail for now
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-zinc-500">Failed to load dashboard data.</div>
    );
  }

  const maxDist = Math.max(...Object.values(data.rating_distribution));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/portal/feedback"
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Feedback Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {data.total_responses} total responses
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Avg Rating
            </span>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">
            {data.average_overall.toFixed(1)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Responses
            </span>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">
            {data.total_responses}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              5-Star Rate
            </span>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">
            {data.total_responses > 0
              ? `${Math.round((data.rating_distribution[5] / data.total_responses) * 100)}%`
              : '—'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Low Scores
            </span>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">
            {data.low_score_alerts.length}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {([5, 4, 3, 2, 1] as EmojiRating[]).map((r) => (
              <RatingBar key={r} rating={r} count={data.rating_distribution[r]} max={maxDist} />
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            Category Averages
          </h3>
          <div className="space-y-4">
            {(Object.entries(data.category_averages) as [FeedbackCategory, number][]).map(
              ([cat, avg]) => (
                <CategoryBar key={cat} label={CATEGORY_LABELS[cat]} avg={avg} />
              )
            )}
            {Object.keys(data.category_averages).length === 0 && (
              <p className="text-sm text-zinc-400">No category data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Trend */}
      {data.trend_data.length > 1 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            Rating Trend (last 30 days)
          </h3>
          <div className="flex items-end gap-1 h-32">
            {data.trend_data.map((point) => {
              const heightPct = (point.avg_rating / 5) * 100;
              return (
                <div
                  key={point.date}
                  className="flex-1 flex flex-col items-center justify-end gap-1"
                  title={`${point.date}: ${point.avg_rating} avg (${point.count} responses)`}
                >
                  <div
                    className="w-full rounded-t bg-brand-500/80 transition-all duration-300 min-h-[2px]"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-zinc-400">
              {data.trend_data[0]?.date}
            </span>
            <span className="text-[10px] text-zinc-400">
              {data.trend_data[data.trend_data.length - 1]?.date}
            </span>
          </div>
        </div>
      )}

      {/* Recent Responses */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Recent Responses
          </h3>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.recent_responses.map((resp) => {
            const emoji = EMOJIS.find((e) => e.value === resp.overall_rating);
            return (
              <div key={resp.id} className="p-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{emoji?.emoji}</span>
                <div className="flex-1 min-w-0">
                  {resp.comment && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-1">
                      {resp.comment}
                    </p>
                  )}
                  {resp.issue_tags && resp.issue_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {resp.issue_tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(resp.submitted_at)}
                    </span>
                    {resp.contact_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {resp.contact_email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {data.recent_responses.length === 0 && (
            <div className="p-8 text-center text-sm text-zinc-400">
              No responses yet. Share your feedback link to start collecting data.
            </div>
          )}
        </div>
      </div>

      {/* Low Score Alerts */}
      {data.low_score_alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 overflow-hidden">
          <div className="p-6 border-b border-red-200 dark:border-red-900/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
                Low Score Alerts ({data.low_score_alerts.length})
              </h3>
            </div>
          </div>
          <div className="divide-y divide-red-100 dark:divide-red-900/20">
            {data.low_score_alerts.slice(0, 5).map((resp) => {
              const emoji = EMOJIS.find((e) => e.value === resp.overall_rating);
              return (
                <div key={resp.id} className="p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{emoji?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    {resp.comment && (
                      <p className="text-sm text-red-800 dark:text-red-300 mb-1">
                        {resp.comment}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-red-400">
                      <span>{timeAgo(resp.submitted_at)}</span>
                      {resp.contact_email && (
                        <a
                          href={`mailto:${resp.contact_email}`}
                          className="underline hover:text-red-600"
                        >
                          {resp.contact_email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDashboardPage;
