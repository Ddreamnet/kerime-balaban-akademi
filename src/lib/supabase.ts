/**
 * Supabase client — configured but not yet connected.
 *
 * To activate:
 * 1. Create your Supabase project at supabase.com
 * 2. Copy .env.example to .env.local
 * 3. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 4. Remove the placeholder values below
 *
 * All database calls should import `supabase` from this file.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use localStorage for web — Capacitor's secure storage can replace this
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// ─── Typed table helpers (usage: db.from('profiles')) ───────────────────────
export const db = supabase
