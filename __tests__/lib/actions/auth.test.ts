/**
 * Regression tests for sendOtp / verifyOtp server actions.
 *
 * UAT-014: Production OTP sending failed when Supabase project was paused.
 *   - When signInWithOtp returns a network-level error, sendOtp must return
 *     a typed error object — it must never throw or surface an unhandled
 *     rejection to the client.
 *   - Validates all error-message classification branches.
 */

// Mock the server-side Supabase client.
// The factory must not reference outer `const`/`let` variables directly
// (jest.mock is hoisted before their initialization). Instead we configure
// the mock in beforeEach via the createClient mock return value.
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

import { sendOtp, verifyOtp, updateDisplayName } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/server'

const mockCreateClient = createClient as jest.Mock

let mockSignInWithOtp: jest.Mock
let mockVerifyOtp: jest.Mock
let mockGetUser: jest.Mock
let mockUpsert: jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockSignInWithOtp = jest.fn()
  mockVerifyOtp     = jest.fn()
  mockGetUser       = jest.fn()
  mockUpsert        = jest.fn()

  mockCreateClient.mockResolvedValue({
    auth: {
      signInWithOtp: mockSignInWithOtp,
      verifyOtp: mockVerifyOtp,
      getUser: mockGetUser,
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
      upsert: mockUpsert,
    })),
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('sendOtp', () => {
  describe('phone validation', () => {
    it('rejects numbers shorter than 10 digits without calling Supabase', async () => {
      const result = await sendOtp('123456')
      expect(result).toEqual({ error: 'Invalid phone number. Enter a 10-digit US number.' })
      expect(mockSignInWithOtp).not.toHaveBeenCalled()
    })

    it('rejects empty string without calling Supabase', async () => {
      const result = await sendOtp('')
      expect(result).toEqual({ error: 'Invalid phone number. Enter a 10-digit US number.' })
      expect(mockSignInWithOtp).not.toHaveBeenCalled()
    })

    it('accepts a valid 10-digit number and formats it to E.164', async () => {
      mockSignInWithOtp.mockResolvedValueOnce({ error: null })
      await sendOtp('7037327984')
      expect(mockSignInWithOtp).toHaveBeenCalledWith({ phone: '+17037327984' })
    })
  })

  describe('Supabase error handling — UAT-014 regression', () => {
    it('returns a generic error when signInWithOtp returns a network failure — does not throw', async () => {
      // Simulates Supabase project paused: DNS fails → fetch failed error object
      mockSignInWithOtp.mockResolvedValueOnce({
        error: { message: 'fetch failed: getaddrinfo ENOTFOUND', status: 503 },
      })

      const result = await sendOtp('7037327984')

      expect(result).toEqual({ error: 'Failed to send verification code. Please try again.' })
    })

    it('returns rate-limit message when error mentions "rate"', async () => {
      mockSignInWithOtp.mockResolvedValueOnce({
        error: { message: 'For security purposes, you can only request this after a rate limit', status: 429 },
      })

      const result = await sendOtp('7037327984')

      expect(result).toEqual({ error: 'Too many attempts. Try again later.' })
    })

    it('returns rate-limit message when error mentions "limit"', async () => {
      mockSignInWithOtp.mockResolvedValueOnce({
        error: { message: 'OTP send limit exceeded', status: 429 },
      })

      const result = await sendOtp('7037327984')

      expect(result).toEqual({ error: 'Too many attempts. Try again later.' })
    })

    it('returns "Unable to send SMS" message when error mentions "unverified"', async () => {
      mockSignInWithOtp.mockResolvedValueOnce({
        error: { message: 'The number is unverified for this project', status: 400 },
      })

      const result = await sendOtp('7037327984')

      expect(result).toEqual({
        error: 'Unable to send SMS to this number. The service may be temporarily unavailable — please try again later.',
      })
    })

    it('returns "Unable to send SMS" message when error status is 500', async () => {
      mockSignInWithOtp.mockResolvedValueOnce({
        error: { message: 'Internal server error', status: 500 },
      })

      const result = await sendOtp('7037327984')

      expect(result).toEqual({
        error: 'Unable to send SMS to this number. The service may be temporarily unavailable — please try again later.',
      })
    })
  })

  describe('success', () => {
    it('returns { success: true } when OTP sends successfully', async () => {
      mockSignInWithOtp.mockResolvedValueOnce({ error: null })

      const result = await sendOtp('7037327984')

      expect(result).toEqual({ success: true })
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('verifyOtp', () => {
  it('rejects non-6-digit tokens', async () => {
    const result = await verifyOtp('7037327984', '12345')
    expect(result).toEqual({ error: 'OTP must be 6 digits.' })
    expect(mockVerifyOtp).not.toHaveBeenCalled()
  })

  it('returns invalid-code error when Supabase rejects the OTP', async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      error: { message: 'Invalid OTP token' },
    })

    const result = await verifyOtp('7037327984', '123456')

    expect(result).toEqual({ error: 'Invalid code. Please try again.' })
  })

  it('returns expired-code error when error message includes "expired"', async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      error: { message: 'OTP has expired' },
    })

    const result = await verifyOtp('7037327984', '123456')

    expect(result).toEqual({ error: 'Code expired. Request a new one.' })
  })

  it('returns { success: true } on valid OTP — UAT-014 regression (Supabase must be reachable)', async () => {
    mockVerifyOtp.mockResolvedValueOnce({ error: null })

    const result = await verifyOtp('7037327984', '123456')

    expect(result).toEqual({ success: true })
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('updateDisplayName', () => {
  it('rejects empty display name', async () => {
    const result = await updateDisplayName('   ')
    expect(result).toEqual({ error: 'Name must be 1-50 characters.' })
  })

  it('rejects names over 50 characters', async () => {
    const result = await updateDisplayName('a'.repeat(51))
    expect(result).toEqual({ error: 'Name must be 1-50 characters.' })
  })

  it('returns not-authenticated error when no user session', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const result = await updateDisplayName('Alice')

    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns { success: true } when upsert succeeds', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u-1', phone: '+17037327984' } } })
    mockUpsert.mockResolvedValueOnce({ error: null })

    const result = await updateDisplayName('Alice')

    expect(result).toEqual({ success: true })
  })
})
