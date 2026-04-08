'use client'

import { useState } from 'react'
import { SpotAggregate, RatingFactor } from '@/lib/types'
import { RATING_FACTORS } from '@/lib/constants'
import { formatScore, getScoreColor } from '@/lib/utils'
import StarRating from './StarRating'

interface LeaderboardProps {
  aggregates: SpotAggregate[]
  totalParticipants: number
}

const MEDAL_COLORS = ['#F59E0B', '#A8A29E', '#92400E']

export default function Leaderboard({ aggregates, totalParticipants }: LeaderboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (aggregates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🫓</p>
        <p className="text-lg font-semibold text-papusa-brown">No ratings yet</p>
        <p className="text-sm text-papusa-medium mt-1">
          Start rating spots to see the leaderboard
        </p>
      </div>
    )
  }

  const ratedSpots = aggregates.filter((agg) => agg.raterCount > 0)
  const unratedSpots = aggregates.filter((agg) => agg.raterCount === 0)

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
            {/* Rank badge — only show numbered/medal badge for rated spots */}
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

            {/* Score */}
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {formatScore(score)}
              </span>
              {isRated && (
                <svg
                  className={`w-4 h-4 text-papusa-light transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Expanded factor breakdown — only for rated spots */}
        {isExpanded && isRated && (
          <div className="expand-in mt-1 ml-11 mr-4 rounded-xl bg-white border border-papusa-border p-3 space-y-2">
            {RATING_FACTORS.map((factor) => {
              const factorScore = agg.averageByFactor[factor.key as RatingFactor]
              return (
                <div key={factor.key} className="flex items-center justify-between">
                  <span className="text-sm text-papusa-medium">
                    {factor.emoji} {factor.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <StarRating value={Math.round(factorScore ?? 0)} readonly size="sm" />
                    <span className={`text-sm font-semibold w-8 text-right ${getScoreColor(factorScore ?? null)}`}>
                      {formatScore(factorScore ?? null)}
                    </span>
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
        Based on ratings from {totalParticipants} taster{totalParticipants !== 1 ? 's' : ''}
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
