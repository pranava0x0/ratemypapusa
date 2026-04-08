'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, Participant } from '@/lib/types'
import { generateShareCode } from '@/lib/utils'

const PARTICIPANT_KEY_PREFIX = 'rmp_participant_'

function getStoredParticipantId(shareCode: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(`${PARTICIPANT_KEY_PREFIX}${shareCode}`)
}

function storeParticipantId(shareCode: string, participantId: string) {
  localStorage.setItem(`${PARTICIPANT_KEY_PREFIX}${shareCode}`, participantId)
}

export function useSession(shareCode?: string) {
  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load session and participants by share code
  useEffect(() => {
    if (!shareCode) {
      setLoading(false)
      return
    }

    let channel: ReturnType<typeof supabase.channel> | null = null

    const loadSession = async () => {
      setLoading(true)
      setError(null)

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('share_code', shareCode)
        .single()

      if (sessionError || !sessionData) {
        setError('Session not found')
        setLoading(false)
        return
      }

      setSession(sessionData)

      const { data: participantsData } = await supabase
        .from('participants')
        .select('*')
        .eq('session_id', sessionData.id)
        .order('created_at', { ascending: true })

      setParticipants(participantsData ?? [])

      // Check if current user already has a participant ID stored
      const storedId = getStoredParticipantId(shareCode)
      if (storedId) {
        const existing = participantsData?.find((p) => p.id === storedId)
        if (existing) {
          setCurrentParticipant(existing)
        }
      }

      // Subscribe to new participants (unique name to avoid Strict Mode double-mount conflicts)
      channel = supabase
        .channel(`participants-${sessionData.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'participants',
            filter: `session_id=eq.${sessionData.id}`,
          },
          (payload) => {
            const newParticipant = payload.new as Participant
            setParticipants((prev) => {
              if (prev.some((p) => p.id === newParticipant.id)) return prev
              return [...prev, newParticipant]
            })
          }
        )
        .subscribe()

      setLoading(false)
    }

    loadSession()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [shareCode])

  const createSession = useCallback(
    async (sessionName: string, creatorName: string, partnerName?: string): Promise<string | null> => {
      let attempts = 0
      while (attempts < 3) {
        const code = generateShareCode()

        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert({ name: sessionName, share_code: code })
          .select()
          .single()

        if (sessionError) {
          // Unique constraint violation — retry with new code
          if (sessionError.code === '23505') {
            attempts++
            continue
          }
          setError(sessionError.message)
          return null
        }

        // Add creator as first participant
        const { data: participantData, error: participantError } = await supabase
          .from('participants')
          .insert({ session_id: sessionData.id, name: creatorName })
          .select()
          .single()

        if (participantError) {
          setError(participantError.message)
          return null
        }

        const allParticipants = [participantData]

        // Add partner as second participant if provided
        if (partnerName) {
          const { data: partnerData, error: partnerError } = await supabase
            .from('participants')
            .insert({ session_id: sessionData.id, name: partnerName })
            .select()
            .single()

          if (partnerError) {
            setError(partnerError.message)
            return null
          }

          allParticipants.push(partnerData)
        }

        storeParticipantId(code, participantData.id)
        setSession(sessionData)
        setCurrentParticipant(participantData)
        setParticipants(allParticipants)

        return code
      }

      setError('Failed to generate unique session code')
      return null
    },
    []
  )

  const joinSession = useCallback(
    async (name: string): Promise<boolean> => {
      if (!session) return false

      // Check if already joined
      const storedId = getStoredParticipantId(session.share_code)
      if (storedId) {
        const existing = participants.find((p) => p.id === storedId)
        if (existing) {
          setCurrentParticipant(existing)
          return true
        }
      }

      const { data, error: insertError } = await supabase
        .from('participants')
        .insert({ session_id: session.id, name })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        return false
      }

      storeParticipantId(session.share_code, data.id)
      setCurrentParticipant(data)
      return true
    },
    [session, participants]
  )

  return {
    session,
    participants,
    currentParticipant,
    loading,
    error,
    createSession,
    joinSession,
  }
}
