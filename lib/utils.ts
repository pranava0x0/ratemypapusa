import { SHARE_CODE_CHARS, SHARE_CODE_LENGTH } from './constants'

export function generateShareCode(): string {
  let code = ''
  for (let i = 0; i < SHARE_CODE_LENGTH; i++) {
    code += SHARE_CODE_CHARS[Math.floor(Math.random() * SHARE_CODE_CHARS.length)]
  }
  return code
}

export function formatScore(score: number | null): string {
  if (score === null || isNaN(score)) return '—'
  return score.toFixed(1)
}

export function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 4) return 'text-green-600'
  if (score >= 3) return 'text-yellow-600'
  return 'text-red-500'
}
