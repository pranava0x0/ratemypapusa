'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

const TAP_SIZES = {
  sm: 'p-0.5',
  md: 'p-1',
  lg: 'p-1.5',
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const [animating, setAnimating] = useState(0)

  const handleClick = (star: number) => {
    if (readonly || !onChange) return
    setAnimating(star)
    onChange(star)
    setTimeout(() => setAnimating(0), 200)
  }

  const displayValue = hovered || value

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`${TAP_SIZES[size]} ${readonly ? 'cursor-default' : 'cursor-pointer'} touch-manipulation`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`${SIZES[size]} transition-transform duration-150 ${
              animating === star ? 'star-pop' : ''
            }`}
            fill={star <= displayValue ? 'var(--color-papusa-gold)' : 'var(--color-papusa-star-inactive)'}
            stroke="none"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
