/**
 * HTTP Client for backend API communication
 *
 * This is the single point of contact between frontend and backend.
 * All data flows through this client.
 *
 * Features:
 * - Automatic 401 token refresh & request retry
 * - Request timeout with AbortController
 * - Retry with exponential backoff for transient failures
 * - Proper handling of 204 No Content responses
 * - Request tracking via X-Request-Id header
 * - Organization-scoped requests via X-Organization-Id header
 */

import { env } from '@/config/env';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

type TokenRefresher = () => Promise<string | null>;
type OnUnauthorized = () => void;

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private orgId: string | null = null;
  private tokenRefresher: TokenRefresher | null = null;
  private onUnauthorized: OnUnauthorized | null = null;
  private isRefreshing = false;
  private refreshQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor() {
    this.baseUrl = env.apiBaseUrl;
  }

  /** Set JWT token for authenticated requests */
  setToken(token: string | null): void {
    this.token = token;
  }

  /** Get current token */
  getToken(): string | null {
    return this.token;
  }

  /** Set organization context for org-scoped requests */
  setOrgId(orgId: string | null): void {
    this.orgId = orgId;
  }

  /** Get current organization ID */
  getOrgId(): string | null {
    return this.orgId;
  }

  /**
   * Register a token refresh callback.
   * Called automatically on 401 responses to get a fresh token.
   */
  setTokenRefresher(refresher: TokenRefresher): void {
    this.tokenRefresher = refresher;
  }

  /**
   * Register a callback for when the user is fully unauthorized
   * (i.e., token refresh also failed). Typically triggers logout.
   */
  setOnUnauthorized(callback: OnUnauthorized): void {
    this.onUnauthorized = callback;
  }

  /**
   * Attempt to refresh the token, deduplicating concurrent refresh requests.
   * If a refresh is already in progress, new callers wait for the same result.
   */
  private async refreshTokenOnce(): Promise<string | null> {
    if (!this.tokenRefresher) return null;

    if (this.isRefreshing) {
      // Queue this caller — they'll get the result of the in-flight refresh
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.tokenRefresher();
      this.token = newToken;

      // Resolve all queued callers
      this.refreshQueue.forEach(({ resolve }) => resolve(newToken));
      this.refreshQueue = [];

      return newToken;
    } catch (error) {
      // Reject all queued callers
      this.refreshQueue.forEach(({ reject }) => reject(error));
      this.refreshQueue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Build request headers with auth, org context, and tracking.
   */
  private buildHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge custom headers
    if (customHeaders) {
      if (typeof customHeaders === 'object' && !(customHeaders instanceof Headers)) {
        Object.assign(headers, customHeaders);
      }
    }

    // JWT auth
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Organization context for org-scoped queries
    if (this.orgId) {
      headers['X-Organization-Id'] = this.orgId;
    }

    // Request tracking for audit trail
    headers['X-Request-Id'] = crypto.randomUUID();

    return headers;
  }

  /**
   * Core fetch wrapper with:
   * - Timeout via AbortController
   * - Automatic 401 → token refresh → retry (once)
   * - Retry with backoff for 5xx and network errors
   * - Proper 204 No Content handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & {
      timeout?: number;
      _retryCount?: number;
      _isRetryAfterRefresh?: boolean;
    } = {}
  ): Promise<T> {
    const {
      timeout: timeoutMs = 30000,
      _retryCount = 0,
      _isRetryAfterRefresh = false,
      ...fetchOptions
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.buildHeaders(fetchOptions.headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized — attempt token refresh & retry once
      if (response.status === 401 && !_isRetryAfterRefresh && this.tokenRefresher) {
        try {
          const newToken = await this.refreshTokenOnce();
          if (newToken) {
            // Retry the original request with the new token
            return this.request<T>(endpoint, {
              ...options,
              _isRetryAfterRefresh: true,
            });
          }
        } catch {
          // Refresh failed — trigger unauthorized callback
        }

        // Token refresh failed or returned null — user is unauthorized
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }

        throw {
          status: 401,
          message: 'Session expired. Please log in again.',
          code: 'UNAUTHORIZED',
        } as ApiError;
      }

      // Handle error responses
      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        try {
          errorData = await response.json();
        } catch {
          // Response wasn't valid JSON — that's OK
        }

        const apiError: ApiError = {
          status: response.status,
          message: (errorData.message as string) || response.statusText,
          code: errorData.code as string | undefined,
          details: errorData.details as Record<string, unknown> | undefined,
        };

        // Retry 5xx errors with exponential backoff (max 2 retries)
        if (response.status >= 500 && _retryCount < 2) {
          const delay = Math.min(1000 * Math.pow(2, _retryCount), 8000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.request<T>(endpoint, {
            ...options,
            _retryCount: _retryCount + 1,
          });
        }

        throw apiError;
      }

      // Handle 204 No Content — return empty object instead of parsing JSON
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      // Parse successful JSON response
      const data: T = await response.json();
      return data;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      // Timeout (AbortController signal)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw {
          status: 0,
          message: `Request timed out after ${timeoutMs}ms`,
          code: 'TIMEOUT_ERROR',
        } as ApiError;
      }

      // Network errors — retry once for transient failures
      if (error instanceof TypeError && _retryCount < 1) {
        const delay = 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request<T>(endpoint, {
          ...options,
          _retryCount: _retryCount + 1,
        });
      }

      if (error instanceof TypeError) {
        throw {
          status: 0,
          message: 'Network error: ' + error.message,
          code: 'NETWORK_ERROR',
        } as ApiError;
      }

      // Already formatted API error — rethrow
      if (typeof error === 'object' && error !== null && 'status' in error) {
        throw error as ApiError;
      }

      // Unknown error
      throw {
        status: 0,
        message: String(error),
        code: 'UNKNOWN_ERROR',
      } as ApiError;
    }
  }

  /** GET request */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /** POST request */
  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /** PUT request */
  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /** PATCH request */
  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /** DELETE request */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
