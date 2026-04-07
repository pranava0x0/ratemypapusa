'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Spot } from '@/lib/types'

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpots = async () => {
      const { data } = await supabase
        .from('spots')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name', { ascending: true })

      setSpots(data ?? [])
      setLoading(false)
    }

    fetchSpots()
  }, [])

  const addSpot = useCallback(async (name: string, address: string): Promise<Spot | null> => {
    const { data, error } = await supabase
      .from('spots')
      .insert({ name, address: address || null, is_default: false })
      .select()
      .single()

    if (error) {
      console.error('Failed to add spot:', error.message)
      return null
    }

    setSpots((prev) => [...prev, data])
    return data
  }, [])

  return { spots, loading, addSpot }
}
