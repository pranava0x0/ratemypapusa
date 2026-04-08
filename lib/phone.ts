/**
 * Phone number validation and formatting for Twilio Verify.
 * US-only: accepts 10-digit numbers, auto-prepends +1.
 */

/** Strip all non-digit characters from a phone string */
function stripNonDigits(raw: string): string {
  return raw.replace(/\D/g, '')
}

/**
 * Format a raw phone input to E.164 for Supabase Auth.
 * - 10 digits → +1XXXXXXXXXX (US)
 * - 11 digits starting with 1 → +1XXXXXXXXXX
 * Returns null if invalid.
 */
export function formatPhoneForAuth(raw: string): string | null {
  const digits = stripNonDigits(raw)

  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  return null
}

/**
 * Format E.164 phone for display: +12025551234 → (202) 555-1234
 */
export function formatPhoneDisplay(e164: string): string {
  const digits = stripNonDigits(e164)
  // Remove country code (1) for US numbers
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (local.length === 10) {
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
  }
  return e164
}

/**
 * Check if a raw phone input can be formatted to a valid E.164 number.
 */
export function isValidPhone(raw: string): boolean {
  return formatPhoneForAuth(raw) !== null
}
