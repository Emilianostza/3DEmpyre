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

export function useLoginRateLimiter() {
  let state = getStoredState();
  const now = Date.now();

  // Check if lockout period has expired
  if (state.lockoutUntilTime > 0 && now >= state.lockoutUntilTime) {
    if (import.meta.env.DEV) {
      console.warn('[useLoginRateLimiter] Lockout period expired, resetting state');
    }
    clearState();
    state = {
      attemptCount: 0,
      lastAttemptTime: 0,
      lockoutUntilTime: 0,
    };
  }

  const canAttempt = state.lockoutUntilTime === 0 || now >= state.lockoutUntilTime;
  const remainingLockoutMs = Math.max(0, state.lockoutUntilTime - now);
  const attemptsRemaining = Math.max(0, FIRST_THRESHOLD - state.attemptCount);

  const recordFailure = () => {
    state.attemptCount += 1;
    state.lastAttemptTime = Date.now();

    // Determine lockout duration based on attempt count
    if (state.attemptCount >= SECOND_THRESHOLD) {
      state.lockoutUntilTime = Date.now() + EXTENDED_LOCKOUT_MS;
      if (import.meta.env.DEV) {
        console.warn(
          `[useLoginRateLimiter] Lockout triggered after ${state.attemptCount} attempts (5 minutes)`
        );
      }
    } else if (state.attemptCount >= FIRST_THRESHOLD) {
      state.lockoutUntilTime = Date.now() + INITIAL_LOCKOUT_MS;
      if (import.meta.env.DEV) {
        console.warn(
          `[useLoginRateLimiter] Lockout triggered after ${state.attemptCount} attempts (30 seconds)`
        );
      }
    }

    saveState(state);
  };

  const recordSuccess = () => {
    if (import.meta.env.DEV) {
      console.warn('[useLoginRateLimiter] Login successful, resetting rate limiter');
    }
    clearState();
    state = {
      attemptCount: 0,
      lastAttemptTime: 0,
      lockoutUntilTime: 0,
    };
  };

  return {
    canAttempt,
    remainingLockoutMs,
    recordFailure,
    recordSuccess,
    attemptsRemaining,
  };
}
