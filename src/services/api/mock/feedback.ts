/**
 * Mock Feedback API Service
 *
 * Provides in-memory feedback config and response storage for development.
 * Simulates network latency with artificial delays.
 *
 * This service is used when VITE_USE_MOCK_DATA=true.
 */

import type {
  FeedbackFormConfig,
  FeedbackFormConfigUpsertDTO,
  FeedbackResponse,
  FeedbackSubmitDTO,
  FeedbackDashboardData,
  FeedbackCategory,
  EmojiRating,
} from '@/types/feedback';

// ── Helper ────────────────────────────────────────────────────────────────────

const delay = (ms = 200) => new Promise<void>((r) => setTimeout(r, ms));

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

// ── Seed Data ─────────────────────────────────────────────────────────────────

const SEED_CONFIG: FeedbackFormConfig = {
  id: 'fb-cfg-001',
  org_id: 'org-001',
  project_id: 'PRJ-001',
  active: true,
  brand_color: '#d97706',
  categories_enabled: ['food_quality', 'service', 'speed'],
  custom_question: '',
  incentive_text: 'Get 10% off your next visit!',
  discount_code: 'THANKS10',
  thank_you_message: 'Thank you for your feedback! We truly appreciate it.',
  low_score_threshold: 2,
  low_score_message: "We're sorry about your experience. We'd love to make it right.",
  high_score_redirect_url: '',
  language: 'en',
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

function generateSeedResponses(): FeedbackResponse[] {
  const comments = [
    'Amazing food, will definitely come back!',
    'Service was a bit slow but food made up for it.',
    'Best burger I have had in a long time.',
    'The ambiance was perfect for a date night.',
    'Food was cold when it arrived.',
    'Friendly staff, great experience overall.',
    'Portions are generous for the price.',
    'Had to wait 30 minutes for our table despite a reservation.',
    'Everything was excellent!',
    'The truffle fries were incredible.',
    '',
    '',
    '',
    'A bit noisy but the food was worth it.',
    'Would recommend to friends.',
    '',
    'The dessert was outstanding.',
    'Not great, food was overpriced for what we got.',
    '',
    'Perfect evening, loved every dish.',
    'Waiter was very attentive and helpful.',
    '',
    'The salmon was cooked perfectly.',
    'Cocktails were amazing!',
    'Average experience, nothing special.',
  ];

  const categories: FeedbackCategory[] = ['food_quality', 'service', 'speed'];
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  return Array.from({ length: 25 }, (_, i) => {
    // Weight toward positive ratings (realistic distribution)
    const ratingWeights = [0.05, 0.08, 0.15, 0.35, 0.37];
    const rand = Math.random();
    let cumulative = 0;
    let overall: EmojiRating = 4;
    for (let r = 0; r < ratingWeights.length; r++) {
      cumulative += ratingWeights[r];
      if (rand < cumulative) {
        overall = (r + 1) as EmojiRating;
        break;
      }
    }

    const catRatings: Partial<Record<FeedbackCategory, EmojiRating>> = {};
    for (const cat of categories) {
      // Category ratings cluster around overall ±1
      const offset = Math.floor(Math.random() * 3) - 1;
      catRatings[cat] = Math.max(1, Math.min(5, overall + offset)) as EmojiRating;
    }

    const comment = comments[i] || undefined;
    const issueTags =
      overall <= 2
        ? (['long_wait', 'cold_food', 'overpriced'] as const).filter(() => Math.random() > 0.5)
        : undefined;

    const hasContact = overall <= 2 && Math.random() > 0.4;

    return {
      id: `fb-resp-${String(i + 1).padStart(3, '0')}`,
      config_id: 'fb-cfg-001',
      project_id: 'PRJ-001',
      overall_rating: overall,
      category_ratings: catRatings,
      comment,
      issue_tags: issueTags?.length ? [...issueTags] : undefined,
      contact_email: hasContact ? `guest${i + 1}@example.com` : undefined,
      submitted_at: new Date(now - (25 - i) * DAY + Math.random() * DAY * 0.8).toISOString(),
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      locale: 'en',
    };
  });
}

// ── In-Memory Stores ─────────────────────────────────────────────────────────

const configStore = new Map<string, FeedbackFormConfig>();
const responseStore = new Map<string, FeedbackResponse[]>();

// Pre-seed
configStore.set('PRJ-001', SEED_CONFIG);
responseStore.set('PRJ-001', generateSeedResponses());

// ── Public API ───────────────────────────────────────────────────────────────

export async function getFeedbackConfig(
  projectId: string
): Promise<FeedbackFormConfig | null> {
  await delay();
  return configStore.get(projectId) ?? null;
}

export async function upsertFeedbackConfig(
  projectId: string,
  data: FeedbackFormConfigUpsertDTO
): Promise<FeedbackFormConfig> {
  await delay();

  const now = new Date().toISOString();
  const existing = configStore.get(projectId);

  const config: FeedbackFormConfig = {
    id: existing?.id ?? `fb-cfg-${uid()}`,
    org_id: existing?.org_id ?? 'org-001',
    project_id: projectId,
    active: data.active,
    logo_url: data.logo_url,
    brand_color: data.brand_color,
    categories_enabled: data.categories_enabled,
    custom_question: data.custom_question,
    incentive_text: data.incentive_text,
    discount_code: data.discount_code,
    thank_you_message: data.thank_you_message,
    low_score_threshold: data.low_score_threshold,
    low_score_message: data.low_score_message,
    high_score_redirect_url: data.high_score_redirect_url,
    post_completion_redirect_url: data.post_completion_redirect_url,
    language: data.language,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };

  configStore.set(projectId, config);
  return config;
}

export async function submitFeedback(
  projectId: string,
  data: FeedbackSubmitDTO
): Promise<FeedbackResponse> {
  await delay();

  const config = configStore.get(projectId);
  const now = new Date().toISOString();

  const response: FeedbackResponse = {
    id: `fb-resp-${uid()}`,
    config_id: config?.id ?? '',
    project_id: projectId,
    overall_rating: data.overall_rating,
    category_ratings: data.category_ratings,
    comment: data.comment,
    issue_tags: data.issue_tags,
    custom_answer: data.custom_answer,
    contact_name: data.contact_name,
    contact_email: data.contact_email,
    contact_phone: data.contact_phone,
    submitted_at: now,
    user_agent: navigator.userAgent,
    locale: navigator.language,
  };

  const existing = responseStore.get(projectId) ?? [];
  existing.push(response);
  responseStore.set(projectId, existing);

  return response;
}

export async function getFeedbackDashboard(
  projectId: string
): Promise<FeedbackDashboardData> {
  await delay();

  const responses = responseStore.get(projectId) ?? [];
  const config = configStore.get(projectId);
  const threshold = config?.low_score_threshold ?? 2;

  // Overall average
  const total = responses.length;
  const avgOverall =
    total > 0 ? responses.reduce((sum, r) => sum + r.overall_rating, 0) / total : 0;

  // Rating distribution
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<EmojiRating, number>;
  for (const r of responses) dist[r.overall_rating]++;

  // Category averages
  const catSums: Partial<Record<FeedbackCategory, { sum: number; count: number }>> = {};
  for (const r of responses) {
    if (!r.category_ratings) continue;
    for (const [cat, val] of Object.entries(r.category_ratings)) {
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

  // Trend data (group by date)
  const trendMap = new Map<string, { sum: number; count: number }>();
  for (const r of responses) {
    const date = r.submitted_at.slice(0, 10);
    const entry = trendMap.get(date) ?? { sum: 0, count: 0 };
    entry.sum += r.overall_rating;
    entry.count++;
    trendMap.set(date, entry);
  }
  const trendData = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sum, count }]) => ({
      date,
      avg_rating: Math.round((sum / count) * 10) / 10,
      count,
    }));

  // Low score alerts
  const lowScoreAlerts = responses
    .filter((r) => r.overall_rating <= threshold)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));

  // Recent responses (last 10)
  const recent = [...responses].sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)).slice(0, 10);

  return {
    total_responses: total,
    average_overall: Math.round(avgOverall * 10) / 10,
    category_averages: catAvgs,
    rating_distribution: dist,
    recent_responses: recent,
    low_score_alerts: lowScoreAlerts,
    trend_data: trendData,
  };
}

export async function getFeedbackResponses(
  projectId: string
): Promise<FeedbackResponse[]> {
  await delay();
  const responses = responseStore.get(projectId) ?? [];
  return [...responses].sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
}
