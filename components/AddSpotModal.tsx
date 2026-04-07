'use client'

import { useState } from 'react'

interface AddSpotModalProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, address: string) => Promise<void>
}

export default function AddSpotModal({ open, onClose, onAdd }: AddSpotModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return
    setLoading(true)
    await onAdd(name.trim(), address.trim())
    setLoading(false)
    setName('')
    setAddress('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="slide-up w-full max-w-[480px] rounded-t-[20px] sm:rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-papusa-brown">Add a Spot</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-papusa-medium hover:bg-papusa-cream"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="spot-name" className="block text-sm font-medium text-papusa-brown mb-1">
              Name *
            </label>
            <input
              id="spot-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mi Pupusería Favorita"
              className="w-full rounded-xl border border-papusa-border bg-papusa-surface px-4 py-3 text-papusa-dark placeholder:text-papusa-light focus:border-papusa-gold focus:outline-none focus:ring-2 focus:ring-papusa-gold/20"
              required
              minLength={2}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="spot-address" className="block text-sm font-medium text-papusa-brown mb-1">
              Address (optional)
            </label>
            <input
              id="spot-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St NW"
              className="w-full rounded-xl border border-papusa-border bg-papusa-surface px-4 py-3 text-papusa-dark placeholder:text-papusa-light focus:border-papusa-gold focus:outline-none focus:ring-2 focus:ring-papusa-gold/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading || name.trim().length < 2}
            className="w-full rounded-xl bg-papusa-gold py-3 text-base font-semibold text-papusa-dark shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:bg-papusa-gold-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Spot'}
          </button>
        </form>
      </div>
    </div>
  )
}
