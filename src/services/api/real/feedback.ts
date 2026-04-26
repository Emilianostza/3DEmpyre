/**
 * Real Feedback API Service
 *
 * Connects to Supabase backend for feedback config and response CRUD.
 * Uses feedback_configs and feedback_responses tables.
 *
 * This service is used when VITE_USE_MOCK_DATA=false.
 */

import { supabase } from '@/services/supabase/client';
import type {
  FeedbackFormConfig,
  FeedbackFormConfigUpsertDTO,
  FeedbackResponse,
  FeedbackSubmitDTO,
  FeedbackDashboardData,
  FeedbackCategory,
  EmojiRating,
} from '@/types/feedback';

export async function getFeedbackConfig(
  projectId: string
): Promise<FeedbackFormConfig | null> {
  try {
    const { data, error } = await supabase
      .from('feedback_configs')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch feedback config: ${error.message}`);
    return data;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[FeedbackAPI] GetConfig failed:', err);
    throw err;
  }
}

export async function upsertFeedbackConfig(
  projectId: string,
  data: FeedbackFormConfigUpsertDTO
): Promise<FeedbackFormConfig> {
  try {
    const { data: result, error } = await supabase
      .from('feedback_configs')
      .upsert(
        { project_id: projectId, ...data },
        { onConflict: 'project_id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to save feedback config: ${error.message}`);
    return result;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[FeedbackAPI] UpsertConfig failed:', err);
    throw err;
  }
}

export async function submitFeedback(
  projectId: string,
  data: FeedbackSubmitDTO
): Promise<FeedbackResponse> {
  try {
    const { data: result, error } = await supabase
      .from('feedback_responses')
      .insert({
        project_id: projectId,
        ...data,
        user_agent: navigator.userAgent,
        locale: navigator.language,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to submit feedback: ${error.message}`);
    return result;
  } catch (err) {
    if (import.meta.env.DEV) console.error('[FeedbackAPI] Submit failed:', err);
    throw err;
  }
}

export async function getFeedbackDashboard(
  projectId: string
): Promise<FeedbackDashboardData> {
  try {
    const { data: responses, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('project_id', projectId)
      .order('submitted_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch feedback: ${error.message}`);

    const all = responses ?? [];
    const total = all.length;
    const avgOverall =
      total > 0 ? all.reduce((s, r) => s + r.overall_rating, 0) / total : 0;

    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<EmojiRating, number>;
    for (const r of all) dist[r.overall_rating as EmojiRating]++;

    const catSums: Partial<Record<FeedbackCategory, { sum: number; count: number }>> = {};
    for (const r of all) {
      if (!r.category_ratings) continue;
      for (const [cat, val] of Object.entries(r.category_ratings as Record<string, number>)) {
        const key = cat as FeedbackCategory;
        if (!catSums[key]) catSums[key] = { sum: 0, count: 0 };
        catSums[key]!.sum += val;
        catSums[key]!.count++;
      }
    }
    const catAvgs: Partial<Record<FeedbackCategory, number>> = {};
    for (const [cat, { sum, count }] of Object.entries(catSums)) {
      catAvgs[cat as FeedbackCategory] = Math.round((sum / count) * 10) / 10;
    }

    const config = await getFeedbackConfig(projectId);
    const threshold = config?.low_score_threshold ?? 2;

    const trendMap = new Map<string, { sum: number; count: number }>();
    for (const r of all) {
      const date = r.submitted_at.slice(0, 10);
      const entry = trendMap.get(date) ?? { sum: 0, count: 0 };
      entry.sum += r.overall_rating;
      entry.count++;
      trendMap.set(date, entry);
    }

    return {
      total_responses: total,
      average_overall: Math.round(avgOverall * 10) / 10,
      category_averages: catAvgs,
      rating_distribution: dist,
      recent_responses: all.slice(0, 10),
      low_score_alerts: all.filter((r) => r.overall_rating <= threshold),
      trend_data: Array.from(trendMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { sum, count }]) => ({
          date,
          avg_rating: Math.round((sum / count) * 10) / 10,
          count,
        })),
    };
  } catch (err) {
    if (import.meta.env.DEV) console.error('[FeedbackAPI] Dashboard failed:', err);
    throw err;
  }
}

export async function getFeedbackResponses(
  projectId: string
): Promise<FeedbackResponse[]> {
  try {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('project_id', projectId)
      .order('submitted_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch feedback responses: ${error.message}`);
    return data ?? [];
  } catch (err) {
    if (import.meta.env.DEV) console.error('[FeedbackAPI] GetResponses failed:', err);
    throw err;
  }
}
