'use client'

import Link from 'next/link'
import { Participant } from '@/lib/types'

interface SessionHeaderProps {
  sessionName: string
  shareCode: string
  participants: Participant[]
  backHref?: string
}

export default function SessionHeader({
  sessionName,
  shareCode,
  participants,
  backHref,
}: SessionHeaderProps) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-papusa-medium hover:text-papusa-brown mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-papusa-medium hover:text-papusa-brown mb-2">
            <span>🫓</span>
            <span>RateMyPapusa</span>
          </Link>
          <h1 className="text-2xl font-bold text-papusa-brown">{sessionName}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-papusa-cream px-2.5 py-0.5 text-xs font-medium text-papusa-brown">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {participants.length} taster{participants.length !== 1 ? 's' : ''}
            </span>
            <span className="font-mono text-xs font-medium text-papusa-medium tracking-wider">
              {shareCode}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
