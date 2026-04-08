import { render, screen } from '@testing-library/react'
import SessionHeader from '@/components/SessionHeader'

describe('SessionHeader', () => {
  const defaultProps = {
    sessionName: 'Test Session',
    shareCode: 'ABC12',
    participants: [
      { id: '1', session_id: 's1', name: 'Alice', created_at: '2024-01-01' },
    ],
  }

  it('renders a home link to /', () => {
    render(<SessionHeader {...defaultProps} />)
    const homeLink = screen.getByText('RateMyPapusa').closest('a')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('displays session name', () => {
    render(<SessionHeader {...defaultProps} />)
    expect(screen.getByText('Test Session')).toBeInTheDocument()
  })

  it('displays participant count', () => {
    render(<SessionHeader {...defaultProps} />)
    expect(screen.getByText('1 taster')).toBeInTheDocument()
  })

  it('pluralizes participant count correctly', () => {
    render(
      <SessionHeader
        {...defaultProps}
        participants={[
          ...defaultProps.participants,
          { id: '2', session_id: 's1', name: 'Bob', created_at: '2024-01-01' },
        ]}
      />
    )
    expect(screen.getByText('2 tasters')).toBeInTheDocument()
  })

  it('renders optional back link when backHref is provided', () => {
    render(<SessionHeader {...defaultProps} backHref="/some-page" />)
    expect(screen.getByText('Back').closest('a')).toHaveAttribute('href', '/some-page')
  })
})
