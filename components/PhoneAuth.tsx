'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { isValidPhone } from '@/lib/phone'

type Step = 'phone' | 'otp'

interface PhoneAuthProps {
  /** Called when user submits phone number. Should call server action sendOtp. */
  onSendOtp: (phone: string) => Promise<{ error: string | null }>
  /** Called when user submits OTP. Should call server action verifyOtp. */
  onVerifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>
}

export default function PhoneAuth({ onSendOtp, onVerifyOtp }: PhoneAuthProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  const handleSendOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: sendError } = await onSendOtp(phone)
    setLoading(false)

    if (sendError) {
      setError(sendError)
      return
    }

    setStep('otp')
    setResendTimer(30)
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }, [phone, onSendOtp])

  const handleVerifyOtp = useCallback(async (code: string) => {
    setError(null)
    setLoading(true)

    const { error: verifyError } = await onVerifyOtp(phone, code)
    setLoading(false)

    if (verifyError) {
      setError(verifyError)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    }
    // On success, the parent's auth state updates and removes this component
  }, [phone, onVerifyOtp])

  const handleOtpChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError(null)

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    if (digit && index === 5) {
      const code = newOtp.join('')
      if (code.length === 6) {
        setTimeout(() => handleVerifyOtp(code), 100)
      }
    }
  }, [otp, handleVerifyOtp])

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }, [otp])

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return

    const newOtp = [...otp]
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)

    if (pasted.length === 6) {
      setTimeout(() => handleVerifyOtp(pasted), 100)
    } else {
      otpRefs.current[pasted.length]?.focus()
    }
  }, [otp, handleVerifyOtp])

  const handleResend = useCallback(async () => {
    if (resendTimer > 0) return
    setError(null)
    setOtp(['', '', '', '', '', ''])
    setLoading(true)
    const { error: sendError } = await onSendOtp(phone)
    setLoading(false)
    if (sendError) {
      setError(sendError)
    } else {
      setResendTimer(30)
      otpRefs.current[0]?.focus()
    }
  }, [resendTimer, phone, onSendOtp])

  return (
    <div className="w-full space-y-3">
      {/* Phone input */}
      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="space-y-3">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-pupusa-brown mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setError(null)
              }}
              placeholder="(555) 123-4567"
              className="w-full rounded-xl border border-pupusa-border bg-pupusa-surface px-4 py-3 text-pupusa-dark placeholder:text-pupusa-light focus:border-pupusa-gold focus:outline-none focus:ring-2 focus:ring-pupusa-gold/20"
              required
              autoFocus
              autoComplete="tel"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !isValidPhone(phone)}
            className="w-full rounded-2xl bg-pupusa-gold py-4 text-lg font-semibold text-pupusa-dark shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:bg-pupusa-gold-hover disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </form>
      )}

      {/* OTP input */}
      {step === 'otp' && (
        <div className="space-y-3 fade-expand">
          <p className="text-sm text-pupusa-medium text-center">
            Enter the 6-digit code sent to your phone
          </p>

          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-11 h-12 rounded-lg border border-pupusa-border bg-pupusa-surface text-center font-mono text-xl text-pupusa-dark focus:border-pupusa-gold focus:outline-none focus:ring-2 focus:ring-pupusa-gold/20"
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {loading && (
            <p className="text-sm text-pupusa-medium text-center animate-pulse">Verifying...</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setOtp(['', '', '', '', '', ''])
                setError(null)
              }}
              className="text-pupusa-medium hover:text-pupusa-brown"
            >
              Change number
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="text-pupusa-medium hover:text-pupusa-brown disabled:opacity-50"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
