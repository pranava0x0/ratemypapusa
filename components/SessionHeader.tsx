'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/session/${shareCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/session/${shareCode}`
    if (navigator.share) {
      await navigator.share({
        title: 'Join my RateMyPupusa session',
        text: `Rate pupusas with me! Code: ${shareCode}`,
        url,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <div className="mb-4">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-pupusa-medium hover:text-pupusa-brown mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-pupusa-medium hover:text-pupusa-brown mb-1">
            <Image
              src="/pupusa.png"
              alt="RateMyPupusa"
              width={24}
              height={15}
              className="inline-block"
            />
            <span>RateMyPupusa</span>
          </Link>
          <h1 className="text-2xl font-bold text-pupusa-brown truncate">{sessionName}</h1>
        </div>
      </div>

      {/* Tasters + Share row */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex -space-x-1.5 shrink-0">
            {participants.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white"
                style={{
                  backgroundColor: ['#F59E0B', '#EA580C', '#92400E', '#A0845C'][i % 4],
                  zIndex: participants.length - i,
                }}
                title={p.name}
              >
                {p.name[0].toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-sm font-medium text-pupusa-brown truncate">
            {participants.map((p) => p.name).join(' & ')}
          </span>
        </div>

        {/* Compact share */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-xs font-semibold text-pupusa-medium tracking-wider">
            {shareCode}
          </span>
          <button
            onClick={handleCopy}
            className="rounded-lg bg-pupusa-cream px-2 py-1 text-xs font-medium text-pupusa-brown border border-pupusa-border hover:bg-pupusa-border transition-colors"
          >
            {copied ? '✓' : 'Copy'}
          </button>
          <button
            onClick={handleShare}
            className="rounded-lg bg-pupusa-gold px-2 py-1 text-xs font-semibold text-pupusa-dark hover:bg-pupusa-gold-hover transition-colors"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
