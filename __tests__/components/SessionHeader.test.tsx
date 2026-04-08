import { render, screen } from '@testing-library/react'
import SessionHeader from '@/components/SessionHeader'

describe('SessionHeader', () => {
  const defaultProps = {
    crawlName: 'Test Crawl',
    shareCode: 'ABC12',
    participants: [
      { id: '1', session_id: 's1', name: 'Alice', created_at: '2024-01-01' },
    ],
  }

  it('renders a home link to /', () => {
    render(<SessionHeader {...defaultProps} />)
    const homeLink = screen.getByText('RateMyPupusa').closest('a')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('displays crawl name', () => {
    render(<SessionHeader {...defaultProps} />)
    expect(screen.getByText('Test Crawl')).toBeInTheDocument()
  })

  it('displays participant names', () => {
    render(<SessionHeader {...defaultProps} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('displays multiple participant names joined with &', () => {
    render(
      <SessionHeader
        {...defaultProps}
        participants={[
          ...defaultProps.participants,
          { id: '2', session_id: 's1', name: 'Bob', created_at: '2024-01-01' },
        ]}
      />
    )
    expect(screen.getByText('Alice & Bob')).toBeInTheDocument()
  })

  it('renders optional back link when backHref is provided', () => {
    render(<SessionHeader {...defaultProps} backHref="/some-page" />)
    expect(screen.getByText('Back').closest('a')).toHaveAttribute('href', '/some-page')
  })

  it('displays the share code', () => {
    render(<SessionHeader {...defaultProps} />)
    expect(screen.getByText('ABC12')).toBeInTheDocument()
  })

  it('renders copy and share buttons', () => {
    render(<SessionHeader {...defaultProps} />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('shows avatar initials for each participant', () => {
    render(
      <SessionHeader
        {...defaultProps}
        participants={[
          { id: '1', session_id: 's1', name: 'Alice', created_at: '2024-01-01' },
          { id: '2', session_id: 's1', name: 'Bob', created_at: '2024-01-01' },
        ]}
      />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})
