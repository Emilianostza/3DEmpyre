/**
 * Feedback Types — Customer Feedback Link Feature
 *
 * Types for the customer-facing feedback form, form builder (owner config),
 * and feedback analytics dashboard.
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type FeedbackCategory =
  | 'food_quality'
  | 'service'
  | 'speed'
  | 'ambiance'
  | 'order_accuracy';

export type FeedbackIssueTag =
  | 'long_wait'
  | 'wrong_order'
  | 'cold_food'
  | 'rude_staff'
  | 'dirty'
  | 'noisy'
  | 'overpriced'
  | 'other';

export type EmojiRating = 1 | 2 | 3 | 4 | 5;

export const ALL_FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  'food_quality',
  'service',
  'speed',
  'ambiance',
  'order_accuracy',
];

export const ALL_ISSUE_TAGS: FeedbackIssueTag[] = [
  'long_wait',
  'wrong_order',
  'cold_food',
  'rude_staff',
  'dirty',
  'noisy',
  'overpriced',
  'other',
];

// ============================================================================
// FORM CONFIG (what the restaurant owner sets up)
// ============================================================================

export interface FeedbackFormConfig {
  id: string;
  org_id: string;
  project_id: string;
  active: boolean;
  logo_url?: string;
  brand_color: string;
  categories_enabled: FeedbackCategory[];
  custom_question?: string;
  incentive_text?: string;
  discount_code?: string;
  thank_you_message: string;
  low_score_threshold: EmojiRating;
  low_score_message: string;
  high_score_redirect_url?: string;
  post_completion_redirect_url?: string;
  language: string;
  created_at: string;
  updated_at: string;
}

/** Payload for creating/updating a feedback config (omits server-managed fields). */
export type FeedbackFormConfigUpsertDTO = Omit<
  FeedbackFormConfig,
  'id' | 'org_id' | 'project_id' | 'created_at' | 'updated_at'
>;

// ============================================================================
// FEEDBACK RESPONSE (a single submitted response)
// ============================================================================

export interface FeedbackResponse {
  id: string;
  config_id: string;
  project_id: string;
  overall_rating: EmojiRating;
  category_ratings?: Partial<Record<FeedbackCategory, EmojiRating>>;
  comment?: string;
  issue_tags?: FeedbackIssueTag[];
  custom_answer?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  submitted_at: string;
  user_agent?: string;
  locale?: string;
}

/** Payload the customer submits (omits server-managed fields). */
export type FeedbackSubmitDTO = Omit<
  FeedbackResponse,
  'id' | 'config_id' | 'project_id' | 'submitted_at' | 'user_agent' | 'locale'
>;

// ============================================================================
// DASHBOARD AGGREGATES
// ============================================================================

export interface FeedbackTrendPoint {
  date: string;
  avg_rating: number;
  count: number;
}

export interface FeedbackDashboardData {
  total_responses: number;
  average_overall: number;
  category_averages: Partial<Record<FeedbackCategory, number>>;
  rating_distribution: Record<EmojiRating, number>;
  recent_responses: FeedbackResponse[];
  low_score_alerts: FeedbackResponse[];
  trend_data: FeedbackTrendPoint[];
}
