import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { timeAgo, getInitials, i18nToLocale } from './formatters';

// ---------------------------------------------------------------------------
// timeAgo
// ---------------------------------------------------------------------------
describe('timeAgo', () => {
  const NOW = new Date('2026-02-22T12:00:00.000Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- undefined / empty / falsy -------------------------------------------
  describe('returns "Unknown" for missing or empty input', () => {
    it('returns "Unknown" when iso is undefined', () => {
      expect(timeAgo(undefined)).toBe('Unknown');
    });

    it('returns "Unknown" when iso is an empty string', () => {
      expect(timeAgo('')).toBe('Unknown');
    });
  });

  // --- "Just now" cases ----------------------------------------------------
  describe('returns "Just now"', () => {
    it('returns "Just now" for a date equal to now (0 diff)', () => {
      expect(timeAgo('2026-02-22T12:00:00.000Z')).toBe('Just now');
    });

    it('returns "Just now" for a date 30 seconds ago (< 1 min)', () => {
      expect(timeAgo('2026-02-22T11:59:30.000Z')).toBe('Just now');
    });

    it('returns "Just now" for a date 59 seconds ago', () => {
      expect(timeAgo('2026-02-22T11:59:01.000Z')).toBe('Just now');
    });

    it('returns "Just now" for a future date (negative diff)', () => {
      expect(timeAgo('2026-02-22T13:00:00.000Z')).toBe('Just now');
    });

    it('returns "Just now" for a far-future date', () => {
      expect(timeAgo('2030-01-01T00:00:00.000Z')).toBe('Just now');
    });

    it('returns "Just now" for an invalid date string (NaN diff)', () => {
      expect(timeAgo('not-a-date')).toBe('Just now');
    });
  });

  // --- minutes -------------------------------------------------------------
  describe('returns minutes ago', () => {
    it('returns "1m ago" for exactly 1 minute ago', () => {
      expect(timeAgo('2026-02-22T11:59:00.000Z')).toBe('1m ago');
    });

    it('returns "1m ago" for 90 seconds ago (floors to 1 min)', () => {
      expect(timeAgo('2026-02-22T11:58:30.000Z')).toBe('1m ago');
    });

    it('returns "30m ago" for 30 minutes ago', () => {
      expect(timeAgo('2026-02-22T11:30:00.000Z')).toBe('30m ago');
    });

    it('returns "59m ago" for 59 minutes ago', () => {
      expect(timeAgo('2026-02-22T11:01:00.000Z')).toBe('59m ago');
    });
  });

  // --- hours ---------------------------------------------------------------
  describe('returns hours ago', () => {
    it('returns "1h ago" for exactly 1 hour ago', () => {
      expect(timeAgo('2026-02-22T11:00:00.000Z')).toBe('1h ago');
    });

    it('returns "1h ago" for 1 hour and 30 minutes ago (floors to 1h)', () => {
      expect(timeAgo('2026-02-22T10:30:00.000Z')).toBe('1h ago');
    });

    it('returns "12h ago" for 12 hours ago', () => {
      expect(timeAgo('2026-02-22T00:00:00.000Z')).toBe('12h ago');
    });

    it('returns "23h ago" for 23 hours ago', () => {
      expect(timeAgo('2026-02-21T13:00:00.000Z')).toBe('23h ago');
    });
  });

  // --- days ----------------------------------------------------------------
  describe('returns days ago', () => {
    it('returns "1 day ago" for exactly 24 hours ago', () => {
      expect(timeAgo('2026-02-21T12:00:00.000Z')).toBe('1 day ago');
    });

    it('returns "7 days ago" for 7 days ago', () => {
      expect(timeAgo('2026-02-15T12:00:00.000Z')).toBe('7 days ago');
    });

    it('returns "30 days ago" for exactly 30 days ago', () => {
      expect(timeAgo('2026-01-23T12:00:00.000Z')).toBe('30 days ago');
    });
  });

  // --- months --------------------------------------------------------------
  describe('returns months ago', () => {
    it('returns "1mo ago" for 31 days ago', () => {
      expect(timeAgo('2026-01-22T12:00:00.000Z')).toBe('1mo ago');
    });

    it('returns "2mo ago" for 61 days ago', () => {
      expect(timeAgo('2025-12-23T12:00:00.000Z')).toBe('2mo ago');
    });

    it('returns "12mo ago" for ~365 days ago', () => {
      expect(timeAgo('2025-02-22T12:00:00.000Z')).toBe('12mo ago');
    });
  });

  // --- boundary transitions ------------------------------------------------
  describe('boundary transitions', () => {
    it('transitions from "Just now" to "1m ago" at exactly 60 000 ms', () => {
      // 59 999 ms ago → Just now
      const almostOneMin = new Date(NOW - 59_999).toISOString();
      expect(timeAgo(almostOneMin)).toBe('Just now');

      // 60 000 ms ago → 1m ago
      const exactlyOneMin = new Date(NOW - 60_000).toISOString();
      expect(timeAgo(exactlyOneMin)).toBe('1m ago');
    });

    it('transitions from minutes to hours at 3 600 000 ms', () => {
      // 59 min 59 sec → 59m ago
      const almostOneHour = new Date(NOW - 3_599_000).toISOString();
      expect(timeAgo(almostOneHour)).toBe('59m ago');

      // exactly 1 hour → 1h ago
      const exactlyOneHour = new Date(NOW - 3_600_000).toISOString();
      expect(timeAgo(exactlyOneHour)).toBe('1h ago');
    });

    it('transitions from hours to days at 86 400 000 ms', () => {
      // 23h 59m 59s → 23h ago
      const almostOneDay = new Date(NOW - 86_399_000).toISOString();
      expect(timeAgo(almostOneDay)).toBe('23h ago');

      // exactly 1 day → 1 day ago
      const exactlyOneDay = new Date(NOW - 86_400_000).toISOString();
      expect(timeAgo(exactlyOneDay)).toBe('1 day ago');
    });

    it('transitions from days to months at >30 days', () => {
      // exactly 30 days → 30 days ago
      const exactly30Days = new Date(NOW - 30 * 86_400_000).toISOString();
      expect(timeAgo(exactly30Days)).toBe('30 days ago');

      // 31 days → 1mo ago
      const exactly31Days = new Date(NOW - 31 * 86_400_000).toISOString();
      expect(timeAgo(exactly31Days)).toBe('1mo ago');
    });
  });
});

// ---------------------------------------------------------------------------
// getInitials
// ---------------------------------------------------------------------------
describe('getInitials', () => {
  // --- happy path ----------------------------------------------------------
  describe('happy path', () => {
    it('returns two-letter initials for "John Doe"', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns single initial for a single word', () => {
      expect(getInitials('Alice')).toBe('A');
    });

    it('returns two-letter initials for three words (max 2)', () => {
      expect(getInitials('Mary Jane Watson')).toBe('MJ');
    });

    it('returns uppercase initials for lowercase input', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('handles mixed case input', () => {
      expect(getInitials('jOhn dOe')).toBe('JD');
    });
  });

  // --- edge cases ----------------------------------------------------------
  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(getInitials('')).toBe('');
    });

    it('handles a single character', () => {
      expect(getInitials('A')).toBe('A');
    });

    it('handles names with extra spaces between words', () => {
      // "John  Doe" → split(' ') → ["John", "", "Doe"]
      // map(w => w[0]) → ["J", undefined, "D"]
      // join('') → "JD" (Array.join converts undefined to "")
      // slice(0,2).toUpperCase() → "JD"
      expect(getInitials('John  Doe')).toBe('JD');
    });

    it('handles leading space', () => {
      // " John" → split(' ') → ["", "John"]
      // map(w => w[0]) → [undefined, "J"]
      // join('') → "J" (undefined becomes "")
      // slice(0,2).toUpperCase() → "J"
      expect(getInitials(' John')).toBe('J');
    });

    it('handles trailing space', () => {
      // "John " → split(' ') → ["John", ""]
      // map(w => w[0]) → ["J", undefined]
      // join('') → "J" (undefined becomes "")
      // slice(0,2).toUpperCase() → "J"
      expect(getInitials('John ')).toBe('J');
    });

    it('handles names with numbers', () => {
      expect(getInitials('Room 42')).toBe('R4');
    });

    it('handles names with special characters', () => {
      expect(getInitials('$pecial !')).toBe('$!');
    });

    it('limits output to 2 characters for many words', () => {
      const result = getInitials('A B C D E F');
      expect(result).toBe('AB');
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });
});

// ---------------------------------------------------------------------------
// i18nToLocale
// ---------------------------------------------------------------------------
describe('i18nToLocale', () => {
  // --- mapped languages ----------------------------------------------------
  describe('mapped languages', () => {
    it('maps "en" to "en-US"', () => {
      expect(i18nToLocale('en')).toBe('en-US');
    });

    it('maps "es" to "es-ES"', () => {
      expect(i18nToLocale('es')).toBe('es-ES');
    });

    it('maps "de" to "de-DE"', () => {
      expect(i18nToLocale('de')).toBe('de-DE');
    });

    it('maps "ru" to "ru-RU"', () => {
      expect(i18nToLocale('ru')).toBe('ru-RU');
    });
  });

  // --- fallback ------------------------------------------------------------
  describe('fallback to en-US for unknown codes', () => {
    it('returns "en-US" for "fr"', () => {
      expect(i18nToLocale('fr')).toBe('en-US');
    });

    it('returns "en-US" for "ja"', () => {
      expect(i18nToLocale('ja')).toBe('en-US');
    });

    it('returns "en-US" for "zh"', () => {
      expect(i18nToLocale('zh')).toBe('en-US');
    });

    it('returns "en-US" for an empty string', () => {
      expect(i18nToLocale('')).toBe('en-US');
    });

    it('returns "en-US" for a random string', () => {
      expect(i18nToLocale('xyz')).toBe('en-US');
    });

    it('returns "en-US" for uppercase variant "EN"', () => {
      // The map keys are lowercase, so "EN" won't match
      expect(i18nToLocale('EN')).toBe('en-US');
    });

    it('returns "en-US" for a full locale code "en-US"', () => {
      // "en-US" is not a key in the map (only "en" is)
      expect(i18nToLocale('en-US')).toBe('en-US');
    });
  });
});
