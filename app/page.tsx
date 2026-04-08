'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSession } from '@/lib/hooks/useSession'

type Mode = 'idle' | 'create' | 'join'

export default function Home() {
  const router = useRouter()
  const { createSession } = useSession()
  const [mode, setMode] = useState<Mode>('idle')
  const [sessionName, setSessionName] = useState('')
  const [yourName, setYourName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionName.trim() || !yourName.trim()) return
    setLoading(true)
    setError(null)

    const code = await createSession(sessionName.trim(), yourName.trim(), partnerName.trim() || undefined)
    if (code) {
      router.push(`/session/${code}`)
    } else {
      setError('Failed to create session. Please try again.')
      setLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (!code || !joinName.trim()) return
    setLoading(true)
    setError(null)
    router.push(`/session/${code}?name=${encodeURIComponent(joinName.trim())}`)
  }

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center">
      {/* Hero */}
      <div className="mb-10 text-center">
        <Image
          src="/pupusa.png"
          alt="A steaming pupusa with curtido and salsa"
          width={240}
          height={150}
          className="mx-auto mb-4"
          priority
        />
        <h1 className="text-4xl font-bold text-pupusa-brown tracking-tight">
          RateMyPupusa
        </h1>
        <p className="mt-2 text-pupusa-medium">
          Rate pupusa spots in DC with friends
        </p>
      </div>

      {error && (
        <div className="mb-4 w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* CTAs */}
      {mode === 'idle' && (
        <div className="w-full space-y-3">
          <button
            onClick={() => setMode('create')}
            className="w-full rounded-2xl bg-pupusa-gold py-4 text-lg font-semibold text-pupusa-dark shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:bg-pupusa-gold-hover transition-colors"
          >
            Start New Session
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full rounded-2xl border-2 border-pupusa-border bg-transparent py-4 text-lg font-semibold text-pupusa-brown hover:bg-pupusa-cream transition-colors"
          >
            Join Session
          </button>
        </div>
      )}

      {/* Create Form */}
      {mode === 'create' && (
        <form onSubmit={handleCreate} className="w-full space-y-4">
          <div>
            <label htmlFor="session-name" className="block text-sm font-medium text-pupusa-brown mb-1">
              Session Name
            </label>
            <input
              id="session-name"
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Saturday Pupusa Crawl"
              className="w-full rounded-xl border border-pupusa-border bg-pupusa-surface px-4 py-3 text-pupusa-dark placeholder:text-pupusa-light focus:border-pupusa-gold focus:outline-none focus:ring-2 focus:ring-pupusa-gold/20"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="your-name" className="block text-sm font-medium text-pupusa-brown mb-1">
              Your Name
            </label>
            <input
              id="your-name"
              type="text"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder="e.g., Pranav"
              className="w-full rounded-xl border border-pupusa-border bg-pupusa-surface px-4 py-3 text-pupusa-dark placeholder:text-pupusa-light focus:border-pupusa-gold focus:outline-none focus:ring-2 focus:ring-pupusa-gold/20"
              required
            />
          </div>
          <div>
            <label htmlFor="partner-name" className="block text-sm font-medium text-pupusa-brown mb-1">
              Friend&apos;s Name <span className="text-pupusa-light font-normal">(optional)</span>
            </label>
            <input
              id="partner-name"
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g., Maria"
              className="w-full rounded-xl border border-pupusa-border bg-pupusa-surface px-4 py-3 text-pupusa-dark placeholder:text-pupusa-light focus:border-pupusa-gold focus:outline-none focus:ring-2 focus:ring-pupusa-gold/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-pupusa-gold py-4 text-lg font-semibold text-pupusa-dark shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:bg-pupusa-gold-hover disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Session'}
          </button>
          <button
            type="button"
            onClick={() => setMode('idle')}
            className="w-full py-2 text-sm text-pupusa-medium hover:text-pupusa-brown"
          >
            Back
          </button>
        </form>
      )}

      {/* Join Form */}
      {mode === 'join' && (
        <form onSubmit={handleJoin} className="w-full space-y-4">
          <div>
            <label htmlFor="join-code" className="block text-sm font-medium text-pupusa-brown mb-1">
              Session Code
            </label>
            <input
              id="join-code"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC23"
              maxLength={5}
              className="w-full rounded-xl border border-pupusa-border bg-pupusa-surface px-4 py-3 font-mono text-xl tracking-widest text-center text-pupusa-dark placeholder:text-pupusa-light placeholder:text-base placeholder:tracking-normal placeholder:font-sans focus:border-pupusa-gold focus:outline-none focus:ring-2 focus:ring-pupusa-gold/20"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="join-name" className="block text-sm font-medium text-pupusa-brown mb-1">
              Your Name
            </label>
            <input
              id="join-name"
              type="text"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="e.g., Maria"
              className="w-full rounded-xl border border-pupusa-border bg-pupusa-surface px-4 py-3 text-pupusa-dark placeholder:text-pupusa-light focus:border-pupusa-gold focus:outline-none focus:ring-2 focus:ring-pupusa-gold/20"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-pupusa-gold py-4 text-lg font-semibold text-pupusa-dark shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:bg-pupusa-gold-hover disabled:opacity-50 transition-colors"
          >
            {loading ? 'Joining...' : 'Join Session'}
          </button>
          <button
            type="button"
            onClick={() => setMode('idle')}
            className="w-full py-2 text-sm text-pupusa-medium hover:text-pupusa-brown"
          >
            Back
          </button>
        </form>
      )}
    </div>
  )
}
