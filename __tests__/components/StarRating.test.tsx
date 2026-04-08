import { render, screen, fireEvent } from '@testing-library/react'
import StarRating from '@/components/StarRating'

describe('StarRating', () => {
  it('renders 5 stars', () => {
    render(<StarRating value={0} />)
    const stars = screen.getAllByRole('button')
    expect(stars).toHaveLength(5)
  })

  it('shows correct number of active stars for a given value', () => {
    const { container } = render(<StarRating value={3} readonly />)
    const svgs = container.querySelectorAll('svg')
    const filled = Array.from(svgs).filter(
      (svg) => svg.getAttribute('fill') === 'var(--color-papusa-gold)'
    )
    const unfilled = Array.from(svgs).filter(
      (svg) => svg.getAttribute('fill') === 'var(--color-papusa-star-inactive)'
    )
    expect(filled).toHaveLength(3)
    expect(unfilled).toHaveLength(2)
  })

  it('calls onChange when a star is clicked', () => {
    const handleChange = jest.fn()
    render(<StarRating value={0} onChange={handleChange} />)
    const stars = screen.getAllByRole('button')
    fireEvent.click(stars[2]) // click 3rd star
    expect(handleChange).toHaveBeenCalledWith(3)
  })

  it('does not call onChange when readonly', () => {
    const handleChange = jest.fn()
    render(<StarRating value={2} onChange={handleChange} readonly />)
    const stars = screen.getAllByRole('button')
    fireEvent.click(stars[0])
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('has correct aria-labels on stars', () => {
    render(<StarRating value={0} />)
    expect(screen.getByLabelText('1 star')).toBeInTheDocument()
    expect(screen.getByLabelText('2 stars')).toBeInTheDocument()
    expect(screen.getByLabelText('5 stars')).toBeInTheDocument()
  })
})
