'use client'

import { useMemo } from 'react'
import { Rating, Spot, SpotAggregate, RatingFactor } from '@/lib/types'
import { ALL_FACTORS } from '@/lib/constants'

export function useLeaderboard(ratings: Rating[], spots: Spot[]): SpotAggregate[] {
  return useMemo(() => {
    // Group ratings by spot
    const ratingsBySpot = new Map<string, Rating[]>()
    for (const rating of ratings) {
      const existing = ratingsBySpot.get(rating.spot_id) ?? []
      existing.push(rating)
      ratingsBySpot.set(rating.spot_id, existing)
    }

    const aggregates: SpotAggregate[] = spots.map((spot) => {
      const spotRatings = ratingsBySpot.get(spot.id) ?? []
      const raters = new Set(spotRatings.map((r) => r.participant_id))

      const averageByFactor = {} as Record<RatingFactor, number | null>
      for (const factor of ALL_FACTORS) {
        const factorRatings = spotRatings.filter((r) => r.factor === factor)
        averageByFactor[factor] =
          factorRatings.length > 0
            ? factorRatings.reduce((sum, r) => sum + r.score, 0) / factorRatings.length
            : null
      }

      const validAverages = Object.values(averageByFactor).filter(
        (v): v is number => v !== null
      )
      const overallAverage =
        validAverages.length > 0
          ? validAverages.reduce((sum, v) => sum + v, 0) / validAverages.length
          : null

      return {
        spot,
        averageByFactor,
        overallAverage,
        raterCount: raters.size,
      }
    })

    // Sort by overall average descending, spots with no ratings last
    return aggregates.sort((a, b) => {
      if (a.overallAverage === null && b.overallAverage === null) return 0
      if (a.overallAverage === null) return 1
      if (b.overallAverage === null) return -1
      return b.overallAverage - a.overallAverage
    })
  }, [ratings, spots])
}
