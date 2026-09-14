const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

// Accepts digits with common separators (+, -, spaces, parentheses) and
// requires 7-15 digits overall — permissive enough for international
// numbers while still catching obvious typos (letters, too short/long).
const PHONE_ALLOWED_CHARS = /^[0-9+()\-\s]+$/

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim()
  if (!PHONE_ALLOWED_CHARS.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}
