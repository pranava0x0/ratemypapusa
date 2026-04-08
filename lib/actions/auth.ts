'use server'

import { createClient } from '@/lib/supabase/server'
import { formatPhoneForAuth } from '@/lib/phone'

export async function sendOtp(phone: string) {
  const formatted = formatPhoneForAuth(phone)
  if (!formatted) {
    return { error: 'Invalid phone number. Enter a 10-digit US number.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    phone: formatted,
  })

  if (error) {
    console.error('sendOtp error:', error.message, error.status)
    if (
      error.message?.includes('unverified') ||
      error.message?.includes('verify') ||
      error.status === 500
    ) {
      return {
        error: 'Unable to send SMS to this number. The service may be temporarily unavailable — please try again later.',
      }
    }
    if (error.message.includes('rate') || error.message.includes('limit')) {
      return { error: 'Too many attempts. Try again later.' }
    }
    return { error: 'Failed to send verification code. Please try again.' }
  }

  return { success: true }
}

export async function verifyOtp(phone: string, token: string) {
  const formatted = formatPhoneForAuth(phone)
  if (!formatted) {
    return { error: 'Invalid phone number.' }
  }

  if (!/^\d{6}$/.test(token)) {
    return { error: 'OTP must be 6 digits.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    phone: formatted,
    token,
    type: 'sms',
  })

  if (error) {
    console.error('verifyOtp error:', error.message)
    if (error.message.includes('expired')) {
      return { error: 'Code expired. Request a new one.' }
    }
    return { error: 'Invalid code. Please try again.' }
  }

  return { success: true }
}

export async function updateDisplayName(name: string) {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > 50) {
    return { error: 'Name must be 1-50 characters.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      phone: user.phone ?? '',
      display_name: trimmed,
    })

  if (error) {
    console.error('updateDisplayName error:', error.message)
    return { error: 'Failed to update name. Please try again.' }
  }

  return { success: true }
}

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
