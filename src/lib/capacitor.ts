/**
 * Capacitor platform utilities.
 *
 * Feature-detects Capacitor so code runs safely in browser dev mode
 * and natively in the mobile app. Import helpers from here — never
 * import @capacitor/* directly in business logic.
 */

import { Capacitor } from '@capacitor/core'
import {
  PushNotifications as CapPush,
  type Token,
} from '@capacitor/push-notifications'
import {
  LocalNotifications as CapLocal,
} from '@capacitor/local-notifications'
import { App } from '@capacitor/app'
import { Keyboard } from '@capacitor/keyboard'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

// ─── Platform detection ─────────────────────────────────────────────────────

/** Whether the app is running inside a Capacitor native shell. */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

/** Current platform: 'ios' | 'android' | 'web' */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
}

/** Whether device has a notch / dynamic island (iOS safe area). */
export function hasNotch(): boolean {
  return isNativePlatform() && getPlatform() === 'ios'
}

// ─── Initialization (call once on app boot) ─────────────────────────────────

export async function initCapacitor(): Promise<void> {
  if (!isNativePlatform()) return

  // Hide splash screen after app is ready
  await SplashScreen.hide()

  // Status bar style
  if (getPlatform() === 'ios') {
    await StatusBar.setStyle({ style: Style.Dark })
  } else {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#b7131a' })
  }

  // Handle back button on Android
  if (getPlatform() === 'android') {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      } else {
        App.exitApp()
      }
    })
  }

  // Keyboard: scroll into view on focus (Android)
  if (getPlatform() === 'android') {
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open')
    })
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open')
    })
  }
}

// ─── Push Notifications ─────────────────────────────────────────────────────

export const PushNotifications = {
  async requestPermission(): Promise<boolean> {
    if (!isNativePlatform()) return false

    const result = await CapPush.requestPermissions()
    return result.receive === 'granted'
  },

  async getToken(): Promise<string | null> {
    if (!isNativePlatform()) return null

    return new Promise((resolve) => {
      CapPush.addListener('registration', (token: Token) => {
        resolve(token.value)
      })
      CapPush.addListener('registrationError', () => {
        resolve(null)
      })
      CapPush.register()
    })
  },

  /** Listen for push notifications received while app is in foreground */
  onReceived(callback: (notification: { title: string; body: string; data: Record<string, unknown> }) => void): void {
    if (!isNativePlatform()) return

    CapPush.addListener('pushNotificationReceived', (notification) => {
      callback({
        title: notification.title ?? '',
        body: notification.body ?? '',
        data: (notification.data ?? {}) as Record<string, unknown>,
      })
    })
  },

  /** Listen for push notification taps */
  onTapped(callback: (data: Record<string, unknown>) => void): void {
    if (!isNativePlatform()) return

    CapPush.addListener('pushNotificationActionPerformed', (action) => {
      callback((action.notification.data ?? {}) as Record<string, unknown>)
    })
  },
}

// ─── Local Notifications (birthday flows, reminders) ────────────────────────

let localNotifId = 1

export const LocalNotifications = {
  async schedule(options: {
    title: string
    body: string
    scheduleAt?: Date
  }): Promise<void> {
    if (!isNativePlatform()) {
      console.debug('[LocalNotifications] skipped — running in browser')
      return
    }

    await CapLocal.schedule({
      notifications: [
        {
          id: localNotifId++,
          title: options.title,
          body: options.body,
          schedule: options.scheduleAt
            ? { at: options.scheduleAt }
            : undefined,
          sound: 'default',
        },
      ],
    })
  },

  async requestPermission(): Promise<boolean> {
    if (!isNativePlatform()) return false

    const result = await CapLocal.requestPermissions()
    return result.display === 'granted'
  },
}
