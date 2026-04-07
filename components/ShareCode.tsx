'use client'

import { useState } from 'react'

interface ShareCodeProps {
  code: string
}

export default function ShareCode({ code }: ShareCodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/session/${code}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/session/${code}`
    if (navigator.share) {
      await navigator.share({
        title: 'Join my RateMyPapusa session',
        text: `Rate pupusas with me! Code: ${code}`,
        url,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <div className="share-code-box px-6 py-4 text-center">
      <p className="text-xs font-medium text-papusa-medium mb-2 uppercase tracking-wider">
        Session Code
      </p>
      <p className="font-mono text-[28px] font-semibold tracking-[0.15em] text-papusa-brown">
        {code}
      </p>
      <div className="mt-3 flex gap-2 justify-center">
        <button
          onClick={handleCopy}
          className="rounded-xl bg-papusa-cream px-4 py-2 text-sm font-medium text-papusa-brown border border-papusa-border hover:bg-papusa-border transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={handleShare}
          className="rounded-xl bg-papusa-gold px-4 py-2 text-sm font-semibold text-papusa-dark hover:bg-papusa-gold-hover transition-colors"
        >
          Share
        </button>
      </div>
    </div>
  )
}
