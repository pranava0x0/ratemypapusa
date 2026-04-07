'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useSession } from '@/lib/hooks/useSession'
import { useSpots } from '@/lib/hooks/useSpots'
import { useRatings } from '@/lib/hooks/useRatings'
import { useLeaderboard } from '@/lib/hooks/useLeaderboard'
import SessionHeader from '@/components/SessionHeader'
import ShareCode from '@/components/ShareCode'
import SpotCard from '@/components/SpotCard'
import AddSpotModal from '@/components/AddSpotModal'
import Leaderboard from '@/components/Leaderboard'
import { ToastContainer, useToasts } from '@/components/Toast'

type Tab = 'spots' | 'leaderboard'

export default function SessionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const code = params.code as string
  const nameParam = searchParams.get('name')

  const {
    session,
    participants,
    currentParticipant,
    loading: sessionLoading,
    error: sessionError,
    joinSession,
  } = useSession(code)

  const { spots, loading: spotsLoading, addSpot } = useSpots()
  const { ratings, loading: ratingsLoading } = useRatings(session?.id)
  const leaderboard = useLeaderboard(ratings, spots)

  const [tab, setTab] = useState<Tab>('spots')
  const [showAddSpot, setShowAddSpot] = useState(false)
  const [joinName, setJoinName] = useState('')
  const [joining, setJoining] = useState(false)
  const { toasts, addToast, dismissToast } = useToasts()

  // Auto-join if name is in URL params
  useEffect(() => {
    if (session && !currentParticipant && nameParam) {
      const doJoin = async () => {
        setJoining(true)
        const success = await joinSession(nameParam)
        if (success) {
          addToast(`Welcome, ${nameParam}!`, 'success')
        }
        setJoining(false)
      }
      doJoin()
    }
  }, [session, currentParticipant, nameParam, joinSession, addToast])

  // Track new participants for toast
  useEffect(() => {
    if (participants.length > 1 && currentParticipant) {
      const latest = participants[participants.length - 1]
      if (latest.id !== currentParticipant.id) {
        addToast(`${latest.name} joined!`, 'info')
      }
    }
    // Only trigger on participants length change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.length])

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinName.trim()) return
    setJoining(true)
    const success = await joinSession(joinName.trim())
    if (success) {
      addToast(`Welcome, ${joinName.trim()}!`, 'success')
    } else {
      addToast('Failed to join session', 'error')
    }
    setJoining(false)
  }

  const handleAddSpot = async (name: string, address: string) => {
    const spot = await addSpot(name, address)
    if (spot) {
      addToast(`${name} added!`, 'success')
    } else {
      addToast('Failed to add spot', 'error')
    }
  }

  // Loading state
  if (sessionLoading || spotsLoading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3 animate-pulse">🫓</p>
          <p className="text-papusa-medium">Loading session...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (sessionError || !session) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-lg font-semibold text-papusa-brown">Session not found</p>
          <p className="mt-1 text-sm text-papusa-medium">
            Check the code and try again
          </p>
          <a
            href="/"
            className="mt-4 inline-block rounded-xl bg-papusa-gold px-6 py-2.5 text-sm font-semibold text-papusa-dark"
          >
            Go Home
          </a>
        </div>
      </div>
    )
  }

  // Need to join
  if (!currentParticipant && !nameParam) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <div className="text-center mb-6">
          <p className="text-4xl mb-3">🫓</p>
          <h1 className="text-2xl font-bold text-papusa-brown">{session.name}</h1>
          <p className="mt-1 text-sm text-papusa-medium">
            {participants.length} taster{participants.length !== 1 ? 's' : ''} already in
          </p>
        </div>
        <form onSubmit={handleJoinSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-papusa-brown mb-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-papusa-border bg-papusa-surface px-4 py-3 text-papusa-dark placeholder:text-papusa-light focus:border-papusa-gold focus:outline-none focus:ring-2 focus:ring-papusa-gold/20"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={joining}
            className="w-full rounded-2xl bg-papusa-gold py-4 text-lg font-semibold text-papusa-dark shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:bg-papusa-gold-hover disabled:opacity-50 transition-colors"
          >
            {joining ? 'Joining...' : 'Join Session'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <SessionHeader
        sessionName={session.name}
        shareCode={code}
        participants={participants}
      />

      <ShareCode code={code} />

      {/* Tab bar */}
      <div className="mt-6 flex rounded-xl bg-papusa-cream p-1">
        <button
          onClick={() => setTab('spots')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            tab === 'spots'
              ? 'bg-white text-papusa-brown shadow-sm'
              : 'text-papusa-medium hover:text-papusa-brown'
          }`}
        >
          Rate Spots
        </button>
        <button
          onClick={() => setTab('leaderboard')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            tab === 'leaderboard'
              ? 'bg-white text-papusa-brown shadow-sm'
              : 'text-papusa-medium hover:text-papusa-brown'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {tab === 'spots' && (
          <>
            {ratingsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-papusa-cream animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {spots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    ratings={ratings}
                    participantId={currentParticipant?.id ?? ''}
                    sessionCode={code}
                  />
                ))}
                <button
                  onClick={() => setShowAddSpot(true)}
                  className="w-full rounded-2xl border-2 border-dashed border-papusa-border py-4 text-sm font-semibold text-papusa-medium hover:border-papusa-gold hover:text-papusa-brown transition-colors"
                >
                  + Add a Spot
                </button>
              </div>
            )}
          </>
        )}

        {tab === 'leaderboard' && (
          <Leaderboard
            aggregates={leaderboard}
            totalParticipants={participants.length}
          />
        )}
      </div>

      <AddSpotModal
        open={showAddSpot}
        onClose={() => setShowAddSpot(false)}
        onAdd={handleAddSpot}
      />
    </div>
  )
}
