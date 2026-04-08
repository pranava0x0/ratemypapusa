'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/lib/hooks/useSession'
import { useRatings } from '@/lib/hooks/useRatings'
import { RATING_FACTORS } from '@/lib/constants'
import { Spot, RatingFactor } from '@/lib/types'
import StarRating from '@/components/StarRating'
import { ToastContainer, useToasts } from '@/components/Toast'
import { formatScore, getScoreColor } from '@/lib/utils'

export default function RateSpotPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const spotId = params.spotId as string

  const { session, participants, currentParticipant, loading: sessionLoading } = useSession(code)
  const { ratings, submitRating } = useRatings(session?.id)
  const { toasts, addToast, dismissToast } = useToasts()

  const [spot, setSpot] = useState<Spot | null>(null)
  const [spotLoading, setSpotLoading] = useState(true)

  // Fetch spot details
  useEffect(() => {
    const fetchSpot = async () => {
      const { data } = await supabase
        .from('spots')
        .select('*')
        .eq('id', spotId)
        .single()

      setSpot(data)
      setSpotLoading(false)
    }

    fetchSpot()
  }, [spotId])

  const handleRate = async (factor: RatingFactor, score: number) => {
    if (!currentParticipant) return
    const success = await submitRating(currentParticipant.id, spotId, factor, score)
    if (success) {
      const label = RATING_FACTORS.find((f) => f.key === factor)?.label ?? factor
      addToast(`${label} rated!`, 'success')
    }
  }

  // All ratings for this spot
  const allSpotRatings = ratings.filter((r) => r.spot_id === spotId)

  // Get a specific participant's score for a factor
  const getParticipantScore = (participantId: string, factor: RatingFactor): number => {
    return allSpotRatings.find(
      (r) => r.participant_id === participantId && r.factor === factor
    )?.score ?? 0
  }

  // Compute average across all participants for a factor
  const getAvgScore = (factor: RatingFactor): number | null => {
    const factorRatings = allSpotRatings.filter((r) => r.factor === factor)
    if (factorRatings.length === 0) return null
    return factorRatings.reduce((sum, r) => sum + r.score, 0) / factorRatings.length
  }

  // Overall average across all factors
  const overallAvg = (() => {
    const avgs = RATING_FACTORS.map((f) => getAvgScore(f.key)).filter(
      (v): v is number => v !== null
    )
    if (avgs.length === 0) return null
    return avgs.reduce((sum, v) => sum + v, 0) / avgs.length
  })()

  // Other participants (not the current user)
  const otherParticipants = participants.filter(
    (p) => p.id !== currentParticipant?.id
  )

  if (sessionLoading || spotLoading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <p className="text-papusa-medium animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!spot || !session || !currentParticipant) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-lg font-semibold text-papusa-brown">Spot not found</p>
          <p className="mt-1 text-sm text-papusa-medium">
            This spot doesn&apos;t exist or the session is invalid
          </p>
          <button
            onClick={() => router.push(`/session/${code}`)}
            className="mt-4 inline-block rounded-xl bg-papusa-gold px-6 py-2.5 text-sm font-semibold text-papusa-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Back button */}
      <button
        onClick={() => router.push(`/session/${code}`)}
        className="inline-flex items-center gap-1 text-sm text-papusa-medium hover:text-papusa-brown mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to spots
      </button>

      {/* Spot header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-papusa-brown">{spot.name}</h1>
            {spot.address && (
              <p className="mt-1 text-sm text-papusa-medium">{spot.address}</p>
            )}
          </div>
          {overallAvg !== null && (
            <div className="text-center shrink-0">
              <span className={`text-3xl font-bold ${getScoreColor(overallAvg)}`}>
                {formatScore(overallAvg)}
              </span>
              <p className="text-xs text-papusa-light">avg</p>
            </div>
          )}
        </div>
      </div>

      {/* Rating factors */}
      <div className="space-y-5">
        {RATING_FACTORS.map((factor) => {
          const myScore = getParticipantScore(currentParticipant.id, factor.key)
          const avgScore = getAvgScore(factor.key)
          const avgRounded = avgScore !== null ? avgScore.toFixed(1) : null

          return (
            <div
              key={factor.key}
              className="rounded-2xl border border-papusa-border bg-papusa-surface p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{factor.emoji}</span>
                  <span className="text-lg font-semibold text-papusa-brown">
                    {factor.label}
                  </span>
                </div>
                {avgRounded && (
                  <span className="text-sm text-papusa-medium">
                    Avg: <span className="font-semibold">{avgRounded}</span>
                  </span>
                )}
              </div>

              {/* Current user's rating */}
              <div className="flex items-center justify-between">
                <StarRating
                  value={myScore}
                  onChange={(score) => handleRate(factor.key, score)}
                  size="lg"
                />
                <span className="text-sm text-papusa-light">
                  {myScore > 0 ? `You: ${myScore}/5` : 'Tap to rate'}
                </span>
              </div>

              {/* Other participants' ratings */}
              {otherParticipants.map((p) => {
                const theirScore = getParticipantScore(p.id, factor.key)
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between mt-2 pt-2 border-t border-papusa-border/50"
                  >
                    <StarRating value={theirScore} readonly size="md" />
                    <span className="text-sm text-papusa-light">
                      {theirScore > 0 ? `${p.name}: ${theirScore}/5` : `${p.name}: —`}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Done button */}
      <div className="mt-6 mb-8">
        <button
          onClick={() => router.push(`/session/${code}`)}
          className="w-full rounded-2xl bg-papusa-gold py-4 text-lg font-semibold text-papusa-dark shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:bg-papusa-gold-hover transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}
