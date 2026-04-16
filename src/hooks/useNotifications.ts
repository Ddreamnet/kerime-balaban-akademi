/**
 * Push notification hook — stub for future Capacitor integration.
 *
 * When @capacitor/push-notifications is added:
 * 1. Replace PushNotifications imports with the real Capacitor plugin
 * 2. Register the token in Supabase device_tokens table
 * 3. Listen for foreground/background notification events
 *
 * Birthday flow:
 * - Supabase scheduled function checks children.birthday daily
 * - Sends push notification with type: 'birthday'
 * - On app open, this hook detects pending birthday notifications
 * - Triggers the birthday modal in ParentDashboard
 */

import { useEffect } from 'react'
import { PushNotifications, isNativePlatform } from '@/lib/capacitor'

export function useNotifications() {
  useEffect(() => {
    if (!isNativePlatform()) return

    void PushNotifications.requestPermission().then((granted) => {
      if (granted) {
        void PushNotifications.getToken().then((token) => {
          if (token) {
            // Future: store token in Supabase
            console.debug('[Notifications] Device token:', token)
          }
        })
      }
    })
  }, [])
}
