/**
 * Cloudflare Workers Environment Bindings
 *
 * Plain-text vars are set in wrangler.toml [vars].
 * Secrets are set via `wrangler secret put <NAME>`.
 */
export interface Env {
  /** Cloudflare static-asset binding (auto-injected by [assets] in wrangler.toml). */
  ASSETS: { fetch: (request: Request) => Promise<Response> };

  /** "production" | "preview" | "development" */
  ENVIRONMENT: string;

  /** Supabase project URL (e.g. https://abc123.supabase.co) */
  SUPABASE_URL: string;

  /** Supabase anonymous/public key */
  SUPABASE_ANON_KEY: string;

  /** Supabase service role key — SECRET */
  SUPABASE_SERVICE_ROLE_KEY: string;

  /** Supabase Storage bucket name (default: "assets") */
  SUPABASE_STORAGE_BUCKET: string;

  /** Google Gemini API key — SECRET */
  GEMINI_API_KEY: string;
}
