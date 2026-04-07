export interface Spot {
  id: string
  name: string
  address: string | null
  is_default: boolean
  created_at: string
}

export interface Session {
  id: string
  name: string
  share_code: string
  created_at: string
}

export interface Participant {
  id: string
  session_id: string
  name: string
  created_at: string
}

export interface Rating {
  id: string
  session_id: string
  participant_id: string
  spot_id: string
  factor: RatingFactor
  score: number
  notes: string | null
  created_at: string
}

export type RatingFactor =
  | 'taste'
  | 'texture'
  | 'filling'
  | 'value'
  | 'authenticity'
  | 'overall'

export interface FactorConfig {
  key: RatingFactor
  label: string
  emoji: string
}

export interface SpotAggregate {
  spot: Spot
  averageByFactor: Record<RatingFactor, number | null>
  overallAverage: number | null
  raterCount: number
}
