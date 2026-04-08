'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSession } from '@/lib/hooks/useSession'
import { useAuth } from '@/lib/hooks/useAuth'
import PhoneAuth from '@/components/PhoneAuth'

type Mode = 'idle' | 'create' | 'join'

export default function Home() {
  const router = useRouter()
  const { createSession } = useSession()
  const { user, profile, loading: authLoading, signIn, verifyOtp, updateProfile } = useAuth()

  const [mode, setMode] = useState<Mode>('idle')

  // Create form
  const [sessionName, setSessionName] = useState('')

  // Join form
  const [joinCode, setJoinCode] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Whether the user needs to authenticate
  const needsAuth = !authLoading && !user

  // Derive display name from profile
  const displayName = profile?.display_name || ''

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionName.trim()) return
    setLoading(true)
    setError(null)

    const name = displayName || 'Anonymous'
    const code = await createSession(sessionName.trim(), name, undefined, user?.id)
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
    if (!code) return
    setLoading(true)
    setError(null)

    const name = displayName || 'Anonymous'
    router.push(`/session/${code}?name=${encodeURIComponent(name)}`)
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

      {/* Create Flow */}
      {mode === 'create' && (
        <div className="w-full space-y-4">
          {needsAuth ? (
            <PhoneAuth onSendOtp={signIn} onVerifyOtp={verifyOtp} />
          ) : (
            <form onSubmit={handleCreate} className="space-y-4 fade-expand">
              {displayName && (
                <p className="text-sm text-pupusa-medium text-center">
                  Hey, <span className="font-semibold text-pupusa-brown">{displayName}</span>
                </p>
              )}
              <div>
                <label htmlFor="session-name" className="block text-sm font-medium text-pupusa-brown mb-1">
                  Session Name
                </label>
                <input
                  id="session-name"
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g., Saturday Pupusa Tour"
                  className="w-full rounded-xl border border-pupusa-border bg-pupusa-surface px-4 py-3 text-pupusa-dark placeholder:text-pupusa-light focus:border-pupusa-gold focus:outline-none focus:ring-2 focus:ring-pupusa-gold/20"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-pupusa-gold py-4 text-lg font-semibold text-pupusa-dark shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:bg-pupusa-gold-hover disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => setMode('idle')}
            className="w-full py-2 text-sm text-pupusa-medium hover:text-pupusa-brown"
          >
            Back
          </button>
        </div>
      )}

      {/* Join Flow */}
      {mode === 'join' && (
        <div className="w-full space-y-4">
          {needsAuth ? (
            <PhoneAuth onSendOtp={signIn} onVerifyOtp={verifyOtp} />
          ) : (
            <form onSubmit={handleJoin} className="space-y-4 fade-expand">
              {displayName && (
                <p className="text-sm text-pupusa-medium text-center">
                  Hey, <span className="font-semibold text-pupusa-brown">{displayName}</span>
                </p>
              )}
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
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-pupusa-gold py-4 text-lg font-semibold text-pupusa-dark shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:bg-pupusa-gold-hover disabled:opacity-50 transition-colors"
              >
                {loading ? 'Joining...' : 'Join Session'}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => setMode('idle')}
            className="w-full py-2 text-sm text-pupusa-medium hover:text-pupusa-brown"
          >
            Back
          </button>
        </div>
      )}
    </div>
  )
}
