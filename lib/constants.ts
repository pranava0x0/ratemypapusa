import { FactorConfig, RatingFactor } from './types'

export const RATING_FACTORS: FactorConfig[] = [
  { key: 'taste', label: 'Taste', emoji: '👅' },
  { key: 'value', label: 'Value', emoji: '💰' },
  { key: 'curtido', label: 'Curtido', emoji: '🫙' },
  { key: 'other', label: 'Other (drinks, authenticity, vibes, x-factor)', emoji: '🥤' },
]

export const ALL_FACTORS: RatingFactor[] = RATING_FACTORS.map((f) => f.key)

export const SHARE_CODE_LENGTH = 5
// Uppercase alphanumeric minus ambiguous chars (0/O, 1/I/L)
export const SHARE_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
