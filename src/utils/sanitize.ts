/**
 * Sanitizes user input by removing HTML tags and trimming whitespace.
 * Uses a simple regex-based approach without external dependencies.
 *
 * @param input - The user input string to sanitize
 * @returns Sanitized string with HTML tags removed and whitespace trimmed
 */
export function sanitizeInput(input: string): string {
  // Remove HTML tags using regex
  const withoutTags = input.replace(/<[^>]*>/g, '');
  // Trim leading and trailing whitespace
  return withoutTags.trim();
}

/**
 * Sanitizes email addresses by lowercasing and trimming whitespace.
 * Does not validate email format, only performs basic normalization.
 *
 * @param email - The email string to sanitize
 * @returns Sanitized email string (lowercased and trimmed)
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
