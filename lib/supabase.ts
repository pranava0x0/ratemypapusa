'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * Browser-side Supabase client.
 * Existing hooks import this. New code should use createClient() from lib/supabase/client.
 */
export const supabase = createClient()
