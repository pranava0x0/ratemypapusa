import { RATING_FACTORS, ALL_FACTORS, SHARE_CODE_CHARS } from '@/lib/constants'

describe('RATING_FACTORS', () => {
  it('has exactly 6 entries', () => {
    expect(RATING_FACTORS).toHaveLength(6)
  })

  it('each entry has key, label, and emoji', () => {
    for (const factor of RATING_FACTORS) {
      expect(factor).toHaveProperty('key')
      expect(factor).toHaveProperty('label')
      expect(factor).toHaveProperty('emoji')
      expect(typeof factor.key).toBe('string')
      expect(typeof factor.label).toBe('string')
      expect(typeof factor.emoji).toBe('string')
    }
  })
})

describe('ALL_FACTORS', () => {
  it('matches RATING_FACTORS keys', () => {
    const keys = RATING_FACTORS.map((f) => f.key)
    expect(ALL_FACTORS).toEqual(keys)
  })

  it('contains the expected factor names', () => {
    expect(ALL_FACTORS).toContain('taste')
    expect(ALL_FACTORS).toContain('texture')
    expect(ALL_FACTORS).toContain('filling')
    expect(ALL_FACTORS).toContain('value')
    expect(ALL_FACTORS).toContain('authenticity')
    expect(ALL_FACTORS).toContain('overall')
  })
})

describe('SHARE_CODE_CHARS', () => {
  it('does not contain ambiguous characters 0, O, 1, I, L', () => {
    expect(SHARE_CODE_CHARS).not.toContain('0')
    expect(SHARE_CODE_CHARS).not.toContain('O')
    expect(SHARE_CODE_CHARS).not.toContain('1')
    expect(SHARE_CODE_CHARS).not.toContain('I')
    expect(SHARE_CODE_CHARS).not.toContain('L')
  })

  it('contains only uppercase letters and digits', () => {
    expect(SHARE_CODE_CHARS).toMatch(/^[A-Z0-9]+$/)
  })
})
