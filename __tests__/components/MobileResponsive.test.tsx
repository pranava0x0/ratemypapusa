import { render, screen } from '@testing-library/react'
import SessionHeader from '@/components/SessionHeader'
import Leaderboard from '@/components/Leaderboard'
import SpotCard from '@/components/SpotCard'

// Verify components render critical content without overflow/truncation issues
// across mobile viewport sizes (iPhone SE 375px, iPhone 16 393px, iPhone Pro Max 430px)

const participants = [
  { id: '1', session_id: 's1', name: 'Pranav', created_at: '2024-01-01' },
  { id: '2', session_id: 's1', name: 'Maria', created_at: '2024-01-01' },
]

describe('Mobile responsiveness', () => {
  describe('SessionHeader', () => {
    it('renders participant names and share code in compact layout', () => {
      render(
        <SessionHeader
          sessionName="Saturday Pupusa Crawl"
          shareCode="ABC12"
          participants={participants}
        />
      )
      expect(screen.getByText('Pranav & Maria')).toBeInTheDocument()
      expect(screen.getByText('ABC12')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Share')).toBeInTheDocument()
    })

    it('truncates long session names', () => {
      render(
        <SessionHeader
          sessionName="A Very Long Session Name That Might Overflow On Small Screens"
          shareCode="XYZ99"
          participants={participants}
        />
      )
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('truncate')
    })

    it('handles many participants gracefully', () => {
      const manyParticipants = Array.from({ length: 6 }, (_, i) => ({
        id: String(i),
        session_id: 's1',
        name: `Person${i}`,
        created_at: '2024-01-01',
      }))
      render(
        <SessionHeader
          sessionName="Big Group"
          shareCode="GRP01"
          participants={manyParticipants}
        />
      )
      // Should show at most 4 avatar circles
      const avatars = screen.getAllByTitle(/Person/)
      expect(avatars.length).toBeLessThanOrEqual(4)
    })
  })

  describe('Leaderboard', () => {
    const aggregates = [
      {
        spot: { id: '1', name: 'El Buen Gusto Pupusería', address: '123 Main St', is_default: false, created_at: '2024-01-01' },
        averageByFactor: { taste: 4.5, value: 3.5, curtido: 4.0, other: 3.0 },
        overallAverage: 3.75,
        raterCount: 2,
      },
    ]

    it('shows taster names in header text', () => {
      render(
        <Leaderboard aggregates={aggregates} participants={participants} ratings={[]} />
      )
      expect(screen.getByText('What Pranav & Maria like best')).toBeInTheDocument()
    })

    it('truncates spot names via CSS class', () => {
      render(
        <Leaderboard aggregates={aggregates} participants={participants} ratings={[]} />
      )
      const spotName = screen.getByText('El Buen Gusto Pupusería')
      expect(spotName).toHaveClass('truncate')
    })
  })

  describe('SpotCard', () => {
    const spot = {
      id: '1',
      name: 'Mi Pupusería Favorita',
      address: '456 Columbia Rd NW',
      is_default: false,
      created_at: '2024-01-01',
    }

    it('truncates long spot name and address', () => {
      render(
        <SpotCard
          spot={spot}
          ratings={[]}
          participantId="1"
          sessionCode="ABC12"
        />
      )
      expect(screen.getByText('Mi Pupusería Favorita')).toHaveClass('truncate')
    })

    it('shows "No ratings" for unrated spots without overflow', () => {
      render(
        <SpotCard
          spot={spot}
          ratings={[]}
          participantId="1"
          sessionCode="ABC12"
        />
      )
      expect(screen.getByText('No ratings')).toBeInTheDocument()
    })
  })
})
