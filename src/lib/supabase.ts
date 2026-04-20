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
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

/**
 * On native, back the auth session with Capacitor Preferences
 * (Android SharedPreferences / iOS UserDefaults). Browser localStorage
 * can be evicted by the OS when the app is swiped away or under memory
 * pressure, which forces users to log in again on every cold start.
 */
const nativeStorage = {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key })
    return value
  },
  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value })
  },
  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key })
  },
}

const isNative = Capacitor.isNativePlatform()

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Capacitor WebView uses custom schemes; URL-based session detection
    // never fires on native, and can mis-fire on web if not needed here.
    detectSessionInUrl: !isNative,
    storage: isNative ? nativeStorage : undefined,
  },
})

// ─── Typed table helpers (usage: db.from('profiles')) ───────────────────────
export const db = supabase
