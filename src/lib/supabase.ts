/**
 * Supabase client.
 *
 * Configuration: VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY `.env.local`
 * dosyasında bulunmalı. Vite build-time'da bu değerleri JS bundle'a inject
 * eder — Capacitor iOS/Android build'lerinde de aynı bundle kullanıldığı
 * için runtime'da .env'e ihtiyaç yok.
 *
 * Anon key public by design — data güvenliği RLS policy'leri ile sağlanır.
 * Ama yine de hardcoded fallback bırakmıyoruz: key rotate edilince fallback
 * outdated kalır ve sessizce yanlış key ile çalışmak zor debug edilir.
 */

import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  // Build-time env injection başarısız olmuş — .env.local eksik veya yanlış.
  // ErrorBoundary'nin yakalayabilmesi için throw — sessizce undefined client
  // yaratıp downstream'de bozuk davranış sergilemek yerine.
  throw new Error(
    'Supabase yapılandırma hatası: VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ' +
      '`.env.local` dosyasında tanımlı olmalı. Build sırasında env değerleri inject ' +
      'edilemedi.',
  )
}

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
