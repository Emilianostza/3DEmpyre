import { useLoginRateLimiter } from './useRateLimiter';

// --------------------------------------------------------------------------
// Setup
// --------------------------------------------------------------------------

const STORAGE_KEY = '__login_rate_limiter_state__';

beforeEach(() => {
  // Clear sessionStorage before each test
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
    const { canAttempt, attemptsRemaining } = useLoginRateLimiter();
    expect(canAttempt).toBe(true);
    expect(attemptsRemaining).toBe(5);
  });

  it('decrements attempts remaining after failure', () => {
    let result = useLoginRateLimiter();
    result.recordFailure();

    result = useLoginRateLimiter();
    expect(result.attemptsRemaining).toBe(4);

    result.recordFailure();
    result = useLoginRateLimiter();
    expect(result.attemptsRemaining).toBe(3);
  });

  it('locks out after 5 failures', () => {
    let result = useLoginRateLimiter();

    // Record 5 failures
    for (let i = 0; i < 5; i++) {
      result.recordFailure();
    }

    result = useLoginRateLimiter();
    expect(result.canAttempt).toBe(false);
    expect(result.remainingLockoutMs).toBeGreaterThan(0);
  });

  it('resets on success', () => {
    let result = useLoginRateLimiter();

    // Record failures
    result.recordFailure();
    result.recordFailure();

    result = useLoginRateLimiter();
    expect(result.attemptsRemaining).toBe(3);

    // Record success to reset
    result.recordSuccess();

    result = useLoginRateLimiter();
    expect(result.canAttempt).toBe(true);
    expect(result.attemptsRemaining).toBe(5);
    expect(result.remainingLockoutMs).toBe(0);
  });

  it('persists state across multiple calls', () => {
    let result = useLoginRateLimiter();
    result.recordFailure();

    // Simulate new hook instance (simulating component re-render)
    result = useLoginRateLimiter();
    expect(result.attemptsRemaining).toBe(4);

    result.recordFailure();

    // Another new instance
    result = useLoginRateLimiter();
    expect(result.attemptsRemaining).toBe(3);
  });

  it('applies 30-second lockout after 5 attempts', () => {
    let result = useLoginRateLimiter();

    // Record 5 failures (FIRST_THRESHOLD)
    for (let i = 0; i < 5; i++) {
      result.recordFailure();
    }

    result = useLoginRateLimiter();
    expect(result.canAttempt).toBe(false);
    // Should be approximately 30 seconds (~30000ms)
    expect(result.remainingLockoutMs).toBeGreaterThan(25000);
    expect(result.remainingLockoutMs).toBeLessThanOrEqual(30000);
  });

  it('applies 5-minute lockout after 10 attempts', () => {
    let result = useLoginRateLimiter();

    // Record 10 failures (SECOND_THRESHOLD)
    for (let i = 0; i < 10; i++) {
      result.recordFailure();
    }

    result = useLoginRateLimiter();
    expect(result.canAttempt).toBe(false);
    // Should be approximately 5 minutes (~300000ms)
    expect(result.remainingLockoutMs).toBeGreaterThan(290000);
    expect(result.remainingLockoutMs).toBeLessThanOrEqual(300000);
  });

  it('allows attempts again after lockout expires', async () => {
    let result = useLoginRateLimiter();

    // Record 5 failures to trigger 30-second lockout
    for (let i = 0; i < 5; i++) {
      result.recordFailure();
    }

    result = useLoginRateLimiter();
    expect(result.canAttempt).toBe(false);

    // Manually advance time in sessionStorage to simulate lockout expiry
    const state = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    state.lockoutUntilTime = Date.now() - 1000; // Set to 1 second in the past
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    result = useLoginRateLimiter();
    expect(result.canAttempt).toBe(true);
    expect(result.attemptsRemaining).toBe(5); // Should be reset
  });

  it('returns 0 remaining lockout time when not locked out', () => {
    const result = useLoginRateLimiter();
    expect(result.remainingLockoutMs).toBe(0);
  });

  it('clears state on successful recordSuccess call', () => {
    let result = useLoginRateLimiter();
    result.recordFailure();
    result.recordFailure();

    result = useLoginRateLimiter();
    expect(result.attemptsRemaining).toBe(3);

    result.recordSuccess();

    // Verify state is cleared from sessionStorage
    const stored = sessionStorage.getItem(STORAGE_KEY);
    expect(stored).toBeNull();

    result = useLoginRateLimiter();
    expect(result.attemptsRemaining).toBe(5);
    expect(result.canAttempt).toBe(true);
  });

  it('handles localStorage/sessionStorage errors gracefully', () => {
    const getItemSpy = vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    // Should not throw, returns initial state
    const result = useLoginRateLimiter();
    expect(result.canAttempt).toBe(true);
    expect(result.attemptsRemaining).toBe(5);

    getItemSpy.mockRestore();
  });

  it('tracks attempts independently per session', () => {
    // First "session"
    let result = useLoginRateLimiter();
    result.recordFailure();
    result.recordFailure();

    result = useLoginRateLimiter();
    expect(result.attemptsRemaining).toBe(3);

    // Clear sessionStorage to simulate new session
    sessionStorage.clear();

    // New "session" should start fresh
    result = useLoginRateLimiter();
    expect(result.attemptsRemaining).toBe(5);
    expect(result.canAttempt).toBe(true);
  });
});
