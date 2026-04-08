'use client'

import Link from 'next/link'
import { Spot, Rating } from '@/lib/types'
import { ALL_FACTORS } from '@/lib/constants'
import { formatScore, getScoreColor } from '@/lib/utils'
import StarRating from './StarRating'

interface SpotCardProps {
  spot: Spot
  ratings: Rating[]
  participantId: string
  sessionCode: string
}

export default function SpotCard({
  spot,
  ratings,
  participantId,
  sessionCode,
}: SpotCardProps) {
  const myRatings = ratings.filter(
    (r) => r.spot_id === spot.id && r.participant_id === participantId
  )
  const allSpotRatings = ratings.filter((r) => r.spot_id === spot.id)
  const ratedCount = myRatings.length
  const totalFactors = ALL_FACTORS.length

  // Compute average across all participants
  const avgScore =
    allSpotRatings.length > 0
      ? allSpotRatings.reduce((sum, r) => sum + r.score, 0) / allSpotRatings.length
      : null

  const uniqueRaters = new Set(allSpotRatings.map((r) => r.participant_id)).size

  return (
    <Link href={`/session/${sessionCode}/rate/${spot.id}`}>
      <div className="spot-card rounded-2xl border border-pupusa-border bg-pupusa-surface p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-pupusa-brown truncate">
              {spot.name}
            </h3>
            {spot.address && (
              <p className="mt-0.5 text-sm text-pupusa-medium truncate">
                {spot.address}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs text-pupusa-medium">
                You: {ratedCount}/{totalFactors}
              </span>
              {uniqueRaters > 0 && (
                <span className="text-xs text-pupusa-light">
                  {uniqueRaters} rater{uniqueRaters !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            {avgScore !== null ? (
              <>
                <span className={`text-2xl font-bold score-transition ${getScoreColor(avgScore)}`}>
                  {formatScore(avgScore)}
                </span>
                <StarRating value={Math.round(avgScore)} readonly size="sm" />
              </>
            ) : (
              <span className="text-sm text-pupusa-light">No ratings</span>
            )}
          </div>
        </div>
        {ratedCount === totalFactors && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Fully rated
          </div>
        )}
      </div>
    </Link>
  )
}
