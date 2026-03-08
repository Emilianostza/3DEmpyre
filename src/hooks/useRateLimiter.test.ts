import { renderHook, act } from '@testing-library/react';
import { useLoginRateLimiter } from './useRateLimiter';

// --------------------------------------------------------------------------
// Setup
// --------------------------------------------------------------------------

const STORAGE_KEY = '__login_rate_limiter_state__';

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('useLoginRateLimiter', () => {
  it('initially allows attempts (canAttempt is true)', () => {
    const { result } = renderHook(() => useLoginRateLimiter());
    expect(result.current.canAttempt).toBe(true);
    expect(result.current.attemptsRemaining).toBe(5);
  });

  it('decrements attempts remaining after failure', () => {
    const { result } = renderHook(() => useLoginRateLimiter());
    act(() => { result.current.recordFailure(); });
    expect(result.current.attemptsRemaining).toBe(4);

    act(() => { result.current.recordFailure(); });
    expect(result.current.attemptsRemaining).toBe(3);
  });

  it('locks out after 5 failures', () => {
    const { result } = renderHook(() => useLoginRateLimiter());

    // Record 5 failures
    for (let i = 0; i < 5; i++) {
      act(() => { result.current.recordFailure(); });
    }

    expect(result.current.canAttempt).toBe(false);
    expect(result.current.remainingLockoutMs).toBeGreaterThan(0);
  });

  it('resets on success', () => {
    const { result } = renderHook(() => useLoginRateLimiter());

    // Record failures
    act(() => { result.current.recordFailure(); });
    act(() => { result.current.recordFailure(); });
    expect(result.current.attemptsRemaining).toBe(3);

    // Record success to reset
    act(() => { result.current.recordSuccess(); });
    expect(result.current.canAttempt).toBe(true);
    expect(result.current.attemptsRemaining).toBe(5);
    expect(result.current.remainingLockoutMs).toBe(0);
  });

  it('persists state across multiple calls', () => {
    const { result } = renderHook(() => useLoginRateLimiter());
    act(() => { result.current.recordFailure(); });
    expect(result.current.attemptsRemaining).toBe(4);

    act(() => { result.current.recordFailure(); });
    expect(result.current.attemptsRemaining).toBe(3);

    // Verify sessionStorage was updated — a new hook instance reads the same state
    const { result: result2 } = renderHook(() => useLoginRateLimiter());
    expect(result2.current.attemptsRemaining).toBe(3);
  });

  it('applies 30-second lockout after 5 attempts', () => {
    const { result } = renderHook(() => useLoginRateLimiter());

    // Record 5 failures (FIRST_THRESHOLD)
    for (let i = 0; i < 5; i++) {
      act(() => { result.current.recordFailure(); });
    }

    expect(result.current.canAttempt).toBe(false);
    // Should be approximately 30 seconds (~30000ms)
    expect(result.current.remainingLockoutMs).toBeGreaterThan(25000);
    expect(result.current.remainingLockoutMs).toBeLessThanOrEqual(30000);
  });

  it('applies 5-minute lockout after 10 attempts', () => {
    const { result } = renderHook(() => useLoginRateLimiter());

    // Record 10 failures (SECOND_THRESHOLD)
    for (let i = 0; i < 10; i++) {
      act(() => { result.current.recordFailure(); });
    }

    expect(result.current.canAttempt).toBe(false);
    // Should be approximately 5 minutes (~300000ms)
    expect(result.current.remainingLockoutMs).toBeGreaterThan(290000);
    expect(result.current.remainingLockoutMs).toBeLessThanOrEqual(300000);
  });

  it('allows attempts again after lockout expires', () => {
    const { result } = renderHook(() => useLoginRateLimiter());

    // Record 5 failures to trigger 30-second lockout
    for (let i = 0; i < 5; i++) {
      act(() => { result.current.recordFailure(); });
    }

    expect(result.current.canAttempt).toBe(false);

    // Manually advance time in sessionStorage to simulate lockout expiry
    const state = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    state.lockoutUntilTime = Date.now() - 1000; // Set to 1 second in the past
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // New hook instance picks up expired lockout and resets via resolveState
    const { result: result2 } = renderHook(() => useLoginRateLimiter());
    expect(result2.current.canAttempt).toBe(true);
    expect(result2.current.attemptsRemaining).toBe(5); // Should be reset
  });

  it('returns 0 remaining lockout time when not locked out', () => {
    const { result } = renderHook(() => useLoginRateLimiter());
    expect(result.current.remainingLockoutMs).toBe(0);
  });

  it('clears state on successful recordSuccess call', () => {
    const { result } = renderHook(() => useLoginRateLimiter());
    act(() => { result.current.recordFailure(); });
    act(() => { result.current.recordFailure(); });
    expect(result.current.attemptsRemaining).toBe(3);

    act(() => { result.current.recordSuccess(); });

    // Verify state is cleared from sessionStorage
    const stored = sessionStorage.getItem(STORAGE_KEY);
    expect(stored).toBeNull();

    expect(result.current.attemptsRemaining).toBe(5);
    expect(result.current.canAttempt).toBe(true);
  });

  it('handles localStorage/sessionStorage errors gracefully', () => {
    const getItemSpy = vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    // Should not throw, returns initial state
    const { result } = renderHook(() => useLoginRateLimiter());
    expect(result.current.canAttempt).toBe(true);
    expect(result.current.attemptsRemaining).toBe(5);

    getItemSpy.mockRestore();
  });

  it('tracks attempts independently per session', () => {
    const { result } = renderHook(() => useLoginRateLimiter());
    act(() => { result.current.recordFailure(); });
    act(() => { result.current.recordFailure(); });
    expect(result.current.attemptsRemaining).toBe(3);

    // Clear sessionStorage to simulate new session
    sessionStorage.clear();

    // New "session" should start fresh
    const { result: result2 } = renderHook(() => useLoginRateLimiter());
    expect(result2.current.attemptsRemaining).toBe(5);
    expect(result2.current.canAttempt).toBe(true);
  });
});
