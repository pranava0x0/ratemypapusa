import { render, screen } from '@testing-library/react'
import Leaderboard from '@/components/Leaderboard'
import { SpotAggregate, Spot, RatingFactor } from '@/lib/types'

function makeSpot(id: string, name: string): Spot {
  return { id, name, address: null, is_default: false, created_at: '2024-01-01' }
}

function makeAggregate(
  spot: Spot,
  overallAverage: number | null,
  raterCount: number,
  factorOverrides: Partial<Record<RatingFactor, number | null>> = {}
): SpotAggregate {
  const factors: RatingFactor[] = ['taste', 'texture', 'filling', 'value', 'authenticity', 'overall']
  const averageByFactor = {} as Record<RatingFactor, number | null>
  for (const f of factors) {
    averageByFactor[f] = factorOverrides[f] ?? (raterCount > 0 ? overallAverage : null)
  }
  return { spot, averageByFactor, overallAverage, raterCount }
}

describe('Leaderboard', () => {
  it('shows empty state when no aggregates', () => {
    render(<Leaderboard aggregates={[]} totalParticipants={0} />)
    expect(screen.getByText('No ratings yet')).toBeInTheDocument()
  })

  it('does not show medal badges for unrated spots', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Rated Spot'), 4.5, 2),
      makeAggregate(makeSpot('b', 'Unrated Spot 1'), null, 0),
      makeAggregate(makeSpot('c', 'Unrated Spot 2'), null, 0),
    ]
    const { container } = render(<Leaderboard aggregates={aggregates} totalParticipants={2} />)

    // Rated spot should have rank "1"
    const rankBadges = container.querySelectorAll('.rounded-full')
    // First badge is rank 1 for rated spot
    expect(rankBadges[0].textContent).toBe('1')
    // Unrated spots should show "—" instead of numbered ranks
    expect(rankBadges[1].textContent).toBe('—')
    expect(rankBadges[2].textContent).toBe('—')
  })

  it('does not apply gold/silver/bronze colors to unrated spots', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Rated'), 4.0, 1),
      makeAggregate(makeSpot('b', 'Unrated 1'), null, 0),
      makeAggregate(makeSpot('c', 'Unrated 2'), null, 0),
    ]
    const { container } = render(<Leaderboard aggregates={aggregates} totalParticipants={1} />)

    const rankBadges = container.querySelectorAll('.rounded-full')
    // Rated spot (rank 1) should have gold medal color
    expect(rankBadges[0]).toHaveStyle({ backgroundColor: '#F59E0B' })
    // Unrated spots should NOT have medal colors (no inline style, uses className instead)
    for (let i = 1; i < rankBadges.length; i++) {
      const style = rankBadges[i].getAttribute('style')
      // Unrated badges use className-based styling, not inline medal colors
      if (style) {
        expect(style).not.toContain('#F59E0B') // gold
        expect(style).not.toContain('#A8A29E') // silver
        expect(style).not.toContain('#92400E') // bronze
      }
      // Verify it shows dash instead of a number
      expect(rankBadges[i].textContent).toBe('—')
    }
  })

  it('shows "Not Yet Rated" divider between rated and unrated spots', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Rated Spot'), 4.0, 1),
      makeAggregate(makeSpot('b', 'Unrated'), null, 0),
    ]
    render(<Leaderboard aggregates={aggregates} totalParticipants={1} />)
    expect(screen.getByText('Not Yet Rated')).toBeInTheDocument()
  })

  it('does not show "Not Yet Rated" divider when all spots are rated', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Spot A'), 4.0, 1),
      makeAggregate(makeSpot('b', 'Spot B'), 3.0, 1),
    ]
    render(<Leaderboard aggregates={aggregates} totalParticipants={1} />)
    expect(screen.queryByText('Not Yet Rated')).not.toBeInTheDocument()
  })

  it('shows "Not yet rated" label instead of rater count for unrated spots', () => {
    const aggregates = [
      makeAggregate(makeSpot('a', 'Rated'), 4.0, 2),
      makeAggregate(makeSpot('b', 'Unrated'), null, 0),
    ]
    render(<Leaderboard aggregates={aggregates} totalParticipants={2} />)
    expect(screen.getByText('2 raters')).toBeInTheDocument()
    expect(screen.getByText('Not yet rated')).toBeInTheDocument()
  })

  it('assigns correct medal ranks only to rated spots', () => {
    // 3 rated + 1 unrated
    const aggregates = [
      makeAggregate(makeSpot('a', 'First'), 5.0, 3),
      makeAggregate(makeSpot('b', 'Second'), 4.0, 2),
      makeAggregate(makeSpot('c', 'Third'), 3.0, 1),
      makeAggregate(makeSpot('d', 'Unrated'), null, 0),
    ]
    const { container } = render(<Leaderboard aggregates={aggregates} totalParticipants={3} />)

    const rankBadges = container.querySelectorAll('.rounded-full')
    expect(rankBadges[0].textContent).toBe('1') // gold
    expect(rankBadges[1].textContent).toBe('2') // silver
    expect(rankBadges[2].textContent).toBe('3') // bronze
    expect(rankBadges[3].textContent).toBe('—') // unrated
  })
})
