import { RATING_FACTORS } from '@/lib/constants'
import { RatingFactor } from '@/lib/types'

describe('RATING_FACTORS label lookup (UAT-005)', () => {
  const factors: RatingFactor[] = ['taste', 'texture', 'filling', 'value', 'authenticity', 'overall']

  it.each(factors)('has a capitalized label for factor key "%s"', (key) => {
    const config = RATING_FACTORS.find((f) => f.key === key)
    expect(config).toBeDefined()
    // Label should start with uppercase
    expect(config!.label[0]).toBe(config!.label[0].toUpperCase())
  })

  it('returns correct label for "taste" (not the raw key)', () => {
    const label = RATING_FACTORS.find((f) => f.key === 'taste')?.label
    expect(label).toBe('Taste')
  })

  it('all factor keys have corresponding configs', () => {
    for (const key of factors) {
      expect(RATING_FACTORS.find((f) => f.key === key)).toBeDefined()
    }
  })
})
