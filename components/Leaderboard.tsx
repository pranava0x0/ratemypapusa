'use client'

import { useState } from 'react'
import { SpotAggregate, RatingFactor, Rating, Participant } from '@/lib/types'
import { RATING_FACTORS } from '@/lib/constants'
import { formatScore, getScoreColor } from '@/lib/utils'

interface LeaderboardProps {
  aggregates: SpotAggregate[]
  participants: Participant[]
  ratings: Rating[]
}

const MEDAL_COLORS = ['#F59E0B', '#A8A29E', '#92400E']

export default function Leaderboard({ aggregates, participants, ratings }: LeaderboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (aggregates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🫓</p>
        <p className="text-lg font-semibold text-papusa-brown">No spots yet</p>
        <p className="text-sm text-papusa-medium mt-1">
          Add spots and start rating to see the leaderboard
        </p>
      </div>
    )
  }

  const ratedSpots = aggregates.filter((agg) => agg.raterCount > 0)
  const unratedSpots = aggregates.filter((agg) => agg.raterCount === 0)

  const getParticipantScore = (
    participantId: string,
    spotId: string,
    factor: RatingFactor
  ): number | null => {
    const r = ratings.find(
      (r) => r.participant_id === participantId && r.spot_id === spotId && r.factor === factor
    )
    return r?.score ?? null
  }

  const getParticipantOverall = (participantId: string, spotId: string): number | null => {
    const personRatings = ratings.filter(
      (r) => r.participant_id === participantId && r.spot_id === spotId
    )
    if (personRatings.length === 0) return null
    return personRatings.reduce((sum, r) => sum + r.score, 0) / personRatings.length
  }

  const renderSpotCard = (agg: SpotAggregate, rank: number | null) => {
    const isExpanded = expandedId === agg.spot.id
    const score = agg.overallAverage
    const isRated = agg.raterCount > 0

    return (
      <div key={agg.spot.id}>
        <button
          onClick={() => setExpandedId(isExpanded ? null : agg.spot.id)}
          className="w-full spot-card rounded-2xl border border-papusa-border bg-papusa-surface p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left"
        >
          <div className="flex items-center gap-3">
            {/* Rank badge */}
            {isRated && rank !== null ? (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0"
                style={
                  rank <= 3
                    ? { backgroundColor: MEDAL_COLORS[rank - 1], color: rank === 2 ? '#1C1917' : '#FFF' }
                    : { backgroundColor: '#F5F5F4', color: '#57534E' }
                }
              >
                {rank}
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm shrink-0 bg-papusa-cream text-papusa-light">
                —
              </div>
            )}

            {/* Spot info */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-papusa-brown truncate">
                {agg.spot.name}
              </h3>
              <p className="text-xs text-papusa-light">
                {isRated
                  ? `${agg.raterCount} rater${agg.raterCount !== 1 ? 's' : ''}`
                  : 'Not yet rated'}
              </p>
            </div>

            {/* Score + chevron */}
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {formatScore(score)}
              </span>
              <svg
                className={`w-4 h-4 text-papusa-light transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Expanded: per-person, per-factor breakdown */}
        {isExpanded && (
          <div className="expand-in mt-1 ml-11 mr-1 rounded-xl bg-white border border-papusa-border p-3 space-y-3">
            {/* Per-person overall scores */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-papusa-border/50">
              {participants.map((p) => {
                const pOverall = getParticipantOverall(p.id, agg.spot.id)
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 rounded-full bg-papusa-cream px-2.5 py-1"
                  >
                    <span className="text-xs font-medium text-papusa-brown">
                      {p.name}
                    </span>
                    <span className={`text-xs font-bold ${getScoreColor(pOverall)}`}>
                      {pOverall !== null ? pOverall.toFixed(1) : '—'}
                    </span>
                  </div>
                )
              })}
              {isRated && (
                <div className="flex items-center gap-1.5 rounded-full bg-papusa-gold/15 px-2.5 py-1">
                  <span className="text-xs font-medium text-papusa-brown">Avg</span>
                  <span className={`text-xs font-bold ${getScoreColor(score)}`}>
                    {formatScore(score)}
                  </span>
                </div>
              )}
            </div>

            {/* Per-factor breakdown */}
            {RATING_FACTORS.map((factor) => {
              const factorAvg = agg.averageByFactor[factor.key as RatingFactor]
              return (
                <div key={factor.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-papusa-medium">
                      {factor.emoji} {factor.label}
                    </span>
                    <span className={`text-xs font-bold ${getScoreColor(factorAvg ?? null)}`}>
                      {formatScore(factorAvg ?? null)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {participants.map((p) => {
                      const pScore = getParticipantScore(p.id, agg.spot.id, factor.key)
                      return (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 rounded-md bg-papusa-cream/80 px-2 py-0.5 text-xs"
                        >
                          <span className="text-papusa-medium">{p.name}:</span>
                          <span className={`font-semibold ${pScore !== null ? getScoreColor(pScore) : 'text-papusa-light'}`}>
                            {pScore !== null ? pScore : '—'}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-papusa-medium mb-4">
        Ranked by average across {participants.length} taster{participants.length !== 1 ? 's' : ''}
      </p>
      <div className="space-y-3">
        {ratedSpots.map((agg, index) => renderSpotCard(agg, index + 1))}

        {unratedSpots.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-papusa-light pt-2">
              Not Yet Rated
            </p>
            {unratedSpots.map((agg) => renderSpotCard(agg, null))}
          </>
        )}
      </div>
    </div>
  )
}
