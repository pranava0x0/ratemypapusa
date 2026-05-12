import { render, screen } from '@testing-library/react'
import Leaderboard from '@/components/Leaderboard'
import { SpotAggregate, Spot, RatingFactor, Participant, Rating } from '@/lib/types'

function makeSpot(id: string, name: string): Spot {
  return { id, name, address: null, is_default: false, created_at: '2024-01-01' }
}

function makeAggregate(
  spot: Spot,
  overallAverage: number | null,
  raterCount: number,
  factorOverrides: Partial<Record<RatingFactor, number | null>> = {}
): SpotAggregate {
  const factors: RatingFactor[] = ['taste', 'value', 'curtido', 'other']
  const averageByFactor = {} as Record<RatingFactor, number | null>
  for (const f of factors) {
    averageByFactor[f] = factorOverrides[f] ?? (raterCount > 0 ? overallAverage : null)
  }
  return { spot, averageByFactor, overallAverage, raterCount }
}

const noParticipants: Participant[] = []
const noRatings: Rating[] = []

describe('Leaderboard', () => {
  it('shows empty state when no aggregates', () => {
    render(<Leaderboard aggregates={[]} participants={noParticipants} ratings={noRatings} />)
    expect(screen.getByText('No spots yet')).toBeInTheDocument()
  })

  it('does not show medal badges for unrated spots', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Rated Spot'), 4.5, 2),
      makeAggregate(makeSpot('b', 'Unrated Spot 1'), null, 0),
      makeAggregate(makeSpot('c', 'Unrated Spot 2'), null, 0),
    ]
    const { container } = render(<Leaderboard aggregates={aggregates} participants={noParticipants} ratings={noRatings} />)

    const rankBadges = container.querySelectorAll('.rounded-full')
    expect(rankBadges[0].textContent).toBe('1')
    expect(rankBadges[1].textContent).toBe('—')
    expect(rankBadges[2].textContent).toBe('—')
  })

  it('does not apply gold/silver/bronze colors to unrated spots', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Rated'), 4.0, 1),
      makeAggregate(makeSpot('b', 'Unrated 1'), null, 0),
      makeAggregate(makeSpot('c', 'Unrated 2'), null, 0),
    ]
    const { container } = render(<Leaderboard aggregates={aggregates} participants={noParticipants} ratings={noRatings} />)

    const rankBadges = container.querySelectorAll('.rounded-full')
    expect(rankBadges[0]).toHaveStyle({ backgroundColor: '#F59E0B' })
    for (let i = 1; i < rankBadges.length; i++) {
      const style = rankBadges[i].getAttribute('style')
      if (style) {
        expect(style).not.toContain('#F59E0B')
        expect(style).not.toContain('#A8A29E')
        expect(style).not.toContain('#92400E')
      }
      expect(rankBadges[i].textContent).toBe('—')
    }
  })

  it('shows "Not Yet Rated" divider between rated and unrated spots', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Rated Spot'), 4.0, 1),
      makeAggregate(makeSpot('b', 'Unrated'), null, 0),
    ]
    render(<Leaderboard aggregates={aggregates} participants={noParticipants} ratings={noRatings} />)
    expect(screen.getByText('Not Yet Rated')).toBeInTheDocument()
  })

  it('does not show "Not Yet Rated" divider when all spots are rated', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Spot A'), 4.0, 1),
      makeAggregate(makeSpot('b', 'Spot B'), 3.0, 1),
    ]
    render(<Leaderboard aggregates={aggregates} participants={noParticipants} ratings={noRatings} />)
    expect(screen.queryByText('Not Yet Rated')).not.toBeInTheDocument()
  })

  it('shows "Not yet rated" label instead of rater count for unrated spots', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Rated'), 4.0, 2),
      makeAggregate(makeSpot('b', 'Unrated'), null, 0),
    ]
    render(<Leaderboard aggregates={aggregates} participants={noParticipants} ratings={noRatings} />)
    expect(screen.getByText('2 raters')).toBeInTheDocument()
    expect(screen.getByText('Not yet rated')).toBeInTheDocument()
  })

  it('assigns correct medal ranks only to rated spots', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'First'), 5.0, 3),
      makeAggregate(makeSpot('b', 'Second'), 4.0, 2),
      makeAggregate(makeSpot('c', 'Third'), 3.0, 1),
      makeAggregate(makeSpot('d', 'Unrated'), null, 0),
    ]
    const { container } = render(<Leaderboard aggregates={aggregates} participants={noParticipants} ratings={noRatings} />)

    const rankBadges = container.querySelectorAll('.rounded-full')
    expect(rankBadges[0].textContent).toBe('1')
    expect(rankBadges[1].textContent).toBe('2')
    expect(rankBadges[2].textContent).toBe('3')
    expect(rankBadges[3].textContent).toBe('—')
  })
})
