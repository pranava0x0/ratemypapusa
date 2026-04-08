'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendOtp as sendOtpAction, verifyOtp as verifyOtpAction, updateDisplayName } from '@/lib/actions/auth'
import { Profile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile from profiles table (client-side query)
  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
    return data
  }, [supabase])

  // Check auth on mount using client-side getUser()
  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!mounted) return
      setUser(u)
      if (u) {
        fetchProfile(u.id).then(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Send OTP via server action
  const signIn = useCallback(async (phone: string): Promise<{ error: string | null }> => {
    const result = await sendOtpAction(phone)
    if ('error' in result && result.error) {
      return { error: result.error }
    }
    return { error: null }
  }, [])

  // Verify OTP via server action, then refresh client auth state
  const verifyOtp = useCallback(async (
    phone: string,
    token: string
  ): Promise<{ error: string | null; isNewUser: boolean }> => {
    const result = await verifyOtpAction(phone, token)
    if ('error' in result && result.error) {
      return { error: result.error, isNewUser: false }
    }

    // Server action set the cookie. Refresh client state.
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) {
      return { error: 'Verification failed', isNewUser: false }
    }

    setUser(u)
    const p = await fetchProfile(u.id)
    const isNewUser = !p?.display_name

    return { error: null, isNewUser }
  }, [supabase, fetchProfile])

  // Update display name via server action
  const updateProfile = useCallback(async (displayName: string): Promise<{ error: string | null }> => {
    const result = await updateDisplayName(displayName)
    if ('error' in result && result.error) {
      return { error: result.error }
    }
    if (user) await fetchProfile(user.id)
    return { error: null }
  }, [user, fetchProfile])

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [supabase])

  return { user, profile, loading, signIn, verifyOtp, updateProfile, signOut }
}
