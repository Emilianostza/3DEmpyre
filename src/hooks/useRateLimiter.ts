import { useState, useCallback } from 'react';

interface RateLimiterState {
  attemptCount: number;
  lastAttemptTime: number;
  lockoutUntilTime: number;
}

const STORAGE_KEY = '__login_rate_limiter_state__';
const INITIAL_LOCKOUT_MS = 30 * 1000; // 30 seconds
const EXTENDED_LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes
const FIRST_THRESHOLD = 5;
const SECOND_THRESHOLD = 10;

function getStoredState(): RateLimiterState {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // If parsing fails, start fresh
  }
  return {
    attemptCount: 0,
    lastAttemptTime: 0,
    lockoutUntilTime: 0,
  };
}

function saveState(state: RateLimiterState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // If storage fails, continue silently
  }
}

function clearState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // If removal fails, continue silently
  }
}

/**
 * Resolves the effective state — clears lockout if expired.
 * Returns a fresh RateLimiterState without side-effects on storage.
 */
function resolveState(): RateLimiterState {
  const state = getStoredState();
  const now = Date.now();

  if (state.lockoutUntilTime > 0 && now >= state.lockoutUntilTime) {
    clearState();
    return { attemptCount: 0, lastAttemptTime: 0, lockoutUntilTime: 0 };
  }

  return state;
}

export function useLoginRateLimiter() {
  // React state so the component re-renders when rate-limit changes
  const [state, setState] = useState<RateLimiterState>(resolveState);

  const now = Date.now();
  const canAttempt = state.lockoutUntilTime === 0 || now >= state.lockoutUntilTime;
  const remainingLockoutMs = Math.max(0, state.lockoutUntilTime - now);
  const attemptsRemaining = Math.max(0, FIRST_THRESHOLD - state.attemptCount);

  const recordFailure = useCallback(() => {
    setState((prev) => {
      const next = { ...prev };
      next.attemptCount += 1;
      next.lastAttemptTime = Date.now();

      // Determine lockout duration based on attempt count
      if (next.attemptCount >= SECOND_THRESHOLD) {
        next.lockoutUntilTime = Date.now() + EXTENDED_LOCKOUT_MS;
        if (import.meta.env.DEV) {
          console.warn(
            `[useLoginRateLimiter] Lockout triggered after ${next.attemptCount} attempts (5 minutes)`
          );
        }
      } else if (next.attemptCount >= FIRST_THRESHOLD) {
        next.lockoutUntilTime = Date.now() + INITIAL_LOCKOUT_MS;
        if (import.meta.env.DEV) {
          console.warn(
            `[useLoginRateLimiter] Lockout triggered after ${next.attemptCount} attempts (30 seconds)`
          );
        }
      }

      saveState(next);
      return next;
    });
  }, []);

  const recordSuccess = useCallback(() => {
    if (import.meta.env.DEV) {
      console.warn('[useLoginRateLimiter] Login successful, resetting rate limiter');
    }
    clearState();
    setState({ attemptCount: 0, lastAttemptTime: 0, lockoutUntilTime: 0 });
  }, []);

  return {
    canAttempt,
    remainingLockoutMs,
    recordFailure,
    recordSuccess,
    attemptsRemaining,
  };
}
