'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Rating, RatingFactor } from '@/lib/types'

export function useRatings(sessionId: string | undefined) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    let channel: ReturnType<typeof supabase.channel> | null = null

    const fetchRatings = async () => {
      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('session_id', sessionId)

      setRatings(data ?? [])
      setLoading(false)

      // Subscribe to real-time changes
      channel = supabase
        .channel(`ratings-${sessionId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ratings',
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newRating = payload.new as Rating
              setRatings((prev) => {
                if (prev.some((r) => r.id === newRating.id)) return prev
                return [...prev, newRating]
              })
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Rating
              setRatings((prev) =>
                prev.map((r) => (r.id === updated.id ? updated : r))
              )
            }
          }
        )
        .subscribe()
    }

    fetchRatings()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [sessionId])

  const submitRating = useCallback(
    async (
      participantId: string,
      spotId: string,
      factor: RatingFactor,
      score: number
    ): Promise<boolean> => {
      if (!sessionId) return false

      // Optimistic update
      setRatings((prev) => {
        const existingIndex = prev.findIndex(
          (r) =>
            r.session_id === sessionId &&
            r.participant_id === participantId &&
            r.spot_id === spotId &&
            r.factor === factor
        )

        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = { ...updated[existingIndex], score }
          return updated
        }

        // New rating (optimistic — no real ID yet)
        return [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            session_id: sessionId,
            participant_id: participantId,
            spot_id: spotId,
            factor,
            score,
            notes: null,
            created_at: new Date().toISOString(),
          },
        ]
      })

      const { data, error } = await supabase
        .from('ratings')
        .upsert(
          {
            session_id: sessionId,
            participant_id: participantId,
            spot_id: spotId,
            factor,
            score,
          },
          {
            onConflict: 'session_id,participant_id,spot_id,factor',
          }
        )
        .select()
        .single()

      if (error) {
        console.error('Failed to submit rating:', error.message)
        return false
      }

      // Replace optimistic entry with real data
      setRatings((prev) =>
        prev.map((r) => {
          if (
            r.session_id === sessionId &&
            r.participant_id === participantId &&
            r.spot_id === spotId &&
            r.factor === factor
          ) {
            return data
          }
          return r
        })
      )

      return true
    },
    [sessionId]
  )

  return { ratings, loading, submitRating }
}
