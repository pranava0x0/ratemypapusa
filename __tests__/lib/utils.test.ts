import { generateShareCode, formatScore, getScoreColor } from '@/lib/utils'
import { SHARE_CODE_CHARS, SHARE_CODE_LENGTH } from '@/lib/constants'

describe('generateShareCode', () => {
  it('returns a string of SHARE_CODE_LENGTH characters', () => {
    const code = generateShareCode()
    expect(code).toHaveLength(SHARE_CODE_LENGTH)
  })

  it('only contains characters from SHARE_CODE_CHARS', () => {
    // Run multiple times to reduce flakiness from randomness
    for (let i = 0; i < 50; i++) {
      const code = generateShareCode()
      for (const char of code) {
        expect(SHARE_CODE_CHARS).toContain(char)
      }
    }
  })

  it('returns different codes on successive calls (probabilistic)', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 20; i++) {
      codes.add(generateShareCode())
    }
    // With 30^5 possible codes, 20 calls should almost never collide
    expect(codes.size).toBeGreaterThan(1)
  })
})

describe('formatScore', () => {
  it('returns "—" for null', () => {
    expect(formatScore(null)).toBe('—')
  })

  it('returns "—" for NaN', () => {
    expect(formatScore(NaN)).toBe('—')
  })

  it('formats a whole number with one decimal place', () => {
    expect(formatScore(4)).toBe('4.0')
  })

  it('formats a decimal number to one decimal place', () => {
    expect(formatScore(3.75)).toBe('3.8')
  })

  it('formats zero correctly', () => {
    expect(formatScore(0)).toBe('0.0')
  })
})

describe('getScoreColor', () => {
  it('returns gray for null', () => {
    expect(getScoreColor(null)).toBe('text-gray-400')
  })

  it('returns green for scores >= 4', () => {
    expect(getScoreColor(4)).toBe('text-green-600')
    expect(getScoreColor(5)).toBe('text-green-600')
    expect(getScoreColor(4.5)).toBe('text-green-600')
  })

  it('returns yellow for scores >= 3 and < 4', () => {
    expect(getScoreColor(3)).toBe('text-yellow-600')
    expect(getScoreColor(3.9)).toBe('text-yellow-600')
  })

  it('returns red for scores < 3', () => {
    expect(getScoreColor(2.9)).toBe('text-red-500')
    expect(getScoreColor(1)).toBe('text-red-500')
    expect(getScoreColor(0)).toBe('text-red-500')
  })
})
