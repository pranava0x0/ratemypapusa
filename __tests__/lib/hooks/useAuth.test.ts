/**
 * Regression tests for useAuth hook.
 *
 * UAT-013: Auth loading spinner stuck when Supabase can't refresh a stale token.
 *   - Fast path: no sb- cookie → loading resolves immediately, getUser never called.
 *   - Catch handler: getUser rejects → loading still resolves to false.
 *   - Timeout safety net: getUser hangs → loading resolves after 5 s.
 *
 * UAT-011: Create/join form rendered prematurely while authLoading=true.
 *   - Covered implicitly: loading must be true on mount and only false after
 *     the effect resolves (fast path or slow path completes).
 */
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth } from '@/lib/hooks/useAuth'

// ── Supabase client mock ──────────────────────────────────────────────────────

const mockGetUser = jest.fn()
const mockSignOut = jest.fn()
const mockSingle   = jest.fn()
const mockEq       = jest.fn(() => ({ single: mockSingle }))
const mockSelect   = jest.fn(() => ({ eq: mockEq }))
const mockFrom     = jest.fn(() => ({ select: mockSelect }))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser, signOut: mockSignOut },
    from: mockFrom,
  })),
}))

// ── Server action mocks ───────────────────────────────────────────────────────

jest.mock('@/lib/actions/auth', () => ({
  sendOtp: jest.fn(),
  verifyOtp: jest.fn(),
  updateDisplayName: jest.fn(),
}))

// ── document.cookie control ───────────────────────────────────────────────────

let cookieValue = ''

beforeAll(() => {
  Object.defineProperty(document, 'cookie', {
    get: () => cookieValue,
    configurable: true,
  })
})

beforeEach(() => {
  jest.clearAllMocks()
  cookieValue = ''
})

// ─────────────────────────────────────────────────────────────────────────────

describe('useAuth — fast path (no sb- cookie)', () => {
  it('resolves loading=false immediately without calling getUser — UAT-013', async () => {
    cookieValue = 'other-cookie=value; analytics=abc'

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGetUser).not.toHaveBeenCalled()
    expect(result.current.user).toBeNull()
  })

  it('resolves loading=false when cookie jar is empty', async () => {
    cookieValue = ''

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  it('user is null after fast path resolves', async () => {
    cookieValue = ''

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })
})

describe('useAuth — slow path (sb- cookie present)', () => {
  beforeEach(() => {
    cookieValue = 'sb-fbjnafeamrmejporunjn-auth-token=eyJ; other=x'
  })

  it('calls getUser when an sb- cookie is present', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGetUser).toHaveBeenCalledTimes(1)
  })

  it('sets user state when getUser returns a valid user', async () => {
    const fakeUser = { id: 'u-1', phone: '+15555550101' }
    mockGetUser.mockResolvedValueOnce({ data: { user: fakeUser } })
    mockSingle.mockResolvedValueOnce({ data: { id: 'u-1', display_name: 'Alice', phone: '+15555550101' } })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual(fakeUser)
  })

  it('resolves loading=false even when getUser rejects (network failure) — UAT-013', async () => {
    mockGetUser.mockRejectedValueOnce(
      new TypeError('fetch failed: getaddrinfo ENOTFOUND fbjnafeamrmejporunjn.supabase.co')
    )

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('resolves loading=false after 5 s timeout when getUser never resolves — UAT-013', async () => {
    jest.useFakeTimers()
    // Return a promise that never settles (simulates Supabase retry loop)
    mockGetUser.mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)

    act(() => { jest.advanceTimersByTime(5001) })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()

    jest.useRealTimers()
  })

  it('does not call getUser more than once on mount', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGetUser).toHaveBeenCalledTimes(1)
  })
})

describe('useAuth — signOut', () => {
  it('clears user and profile on signOut', async () => {
    cookieValue = 'sb-test=token'
    const fakeUser = { id: 'u-1', phone: '+15555550101' }
    mockGetUser.mockResolvedValueOnce({ data: { user: fakeUser } })
    mockSingle.mockResolvedValueOnce({ data: { id: 'u-1', display_name: 'Alice', phone: '+15555550101' } })
    mockSignOut.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual(fakeUser)

    await act(async () => { await result.current.signOut() })

    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })
})
