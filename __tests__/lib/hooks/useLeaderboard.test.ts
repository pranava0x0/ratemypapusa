import { renderHook } from '@testing-library/react'
import { useLeaderboard } from '@/lib/hooks/useLeaderboard'
import { Rating, Spot } from '@/lib/types'

function makeSpot(id: string, name: string): Spot {
  return { id, name, address: null, is_default: false, created_at: '2024-01-01' }
}

function makeRating(
  spotId: string,
  participantId: string,
  factor: Rating['factor'],
  score: number
): Rating {
  return {
    id: `r-${spotId}-${participantId}-${factor}`,
    session_id: 's1',
    participant_id: participantId,
    spot_id: spotId,
    factor,
    score,
    notes: null,
    created_at: '2024-01-01',
  }
}

describe('useLeaderboard', () => {
  it('returns all spots with null averages when there are no ratings', () => {
    const spots = [makeSpot('a', 'Spot A'), makeSpot('b', 'Spot B')]
    const { result } = renderHook(() => useLeaderboard([], spots))

    expect(result.current).toHaveLength(2)
    for (const agg of result.current) {
      expect(agg.overallAverage).toBeNull()
      expect(agg.raterCount).toBe(0)
    }
  })

  it('computes correct averages for a single rating', () => {
    const spots = [makeSpot('a', 'Spot A')]
    const ratings = [makeRating('a', 'p1', 'taste', 4)]
    const { result } = renderHook(() => useLeaderboard(ratings, spots))

    expect(result.current).toHaveLength(1)
    const agg = result.current[0]
    expect(agg.averageByFactor.taste).toBe(4)
    expect(agg.raterCount).toBe(1)
    // Overall average is across all factors; only taste has a value
    expect(agg.overallAverage).toBe(4)
  })

  it('computes correct weighted average across multiple raters', () => {
    const spots = [makeSpot('a', 'Spot A')]
    const ratings = [
      makeRating('a', 'p1', 'taste', 5),
      makeRating('a', 'p2', 'taste', 3),
      makeRating('a', 'p1', 'curtido', 4),
      makeRating('a', 'p2', 'curtido', 2),
    ]
    const { result } = renderHook(() => useLeaderboard(ratings, spots))

    const agg = result.current[0]
    expect(agg.averageByFactor.taste).toBe(4) // (5+3)/2
    expect(agg.averageByFactor.curtido).toBe(3) // (4+2)/2
    expect(agg.raterCount).toBe(2)
    // Overall = average of factor averages = (4 + 3) / 2 = 3.5
    expect(agg.overallAverage).toBe(3.5)
  })

  it('sorts spots by overall average descending', () => {
    const spots = [makeSpot('a', 'Low'), makeSpot('b', 'High')]
    const ratings = [
      makeRating('a', 'p1', 'taste', 2),
      makeRating('b', 'p1', 'taste', 5),
    ]
    const { result } = renderHook(() => useLeaderboard(ratings, spots))

    expect(result.current[0].spot.name).toBe('High')
    expect(result.current[1].spot.name).toBe('Low')
  })

  it('sorts unrated spots to the bottom', () => {
    const spots = [makeSpot('a', 'Unrated'), makeSpot('b', 'Rated')]
    const ratings = [makeRating('b', 'p1', 'taste', 3)]
    const { result } = renderHook(() => useLeaderboard(ratings, spots))

    expect(result.current[0].spot.name).toBe('Rated')
    expect(result.current[0].overallAverage).toBe(3)
    expect(result.current[1].spot.name).toBe('Unrated')
    expect(result.current[1].overallAverage).toBeNull()
  })
})
