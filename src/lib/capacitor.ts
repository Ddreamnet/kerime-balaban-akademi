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
import {
  Camera as CapCamera,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera'

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

// ─── Camera / Gallery (profile photos) ──────────────────────────────────────

export type PickSource = 'camera' | 'gallery' | 'prompt'

export interface PickedImage {
  /** data URL (data:image/jpeg;base64,...) — ready for <img src> and upload */
  dataUrl: string
  /** File extension without dot, e.g. "jpeg" | "png" */
  format: string
}

export const Camera = {
  /**
   * Request camera + photo library permission.
   * On web, resolves true — the browser handles the prompt at pick time.
   */
  async requestPermission(): Promise<boolean> {
    if (!isNativePlatform()) return true

    const status = await CapCamera.checkPermissions()
    const needsRequest =
      status.camera !== 'granted' || status.photos !== 'granted'

    if (!needsRequest) return true

    const result = await CapCamera.requestPermissions({
      permissions: ['camera', 'photos'],
    })
    return result.camera === 'granted' || result.photos === 'granted'
  },

  /**
   * Pick a photo from camera or gallery.
   * - Native: uses Capacitor Camera plugin with native action sheet.
   * - Web: falls back to an <input type="file"> prompt.
   *
   * Returns null if the user cancels.
   */
  async pickImage(source: PickSource = 'prompt'): Promise<PickedImage | null> {
    if (!isNativePlatform()) {
      return pickImageViaInput(source)
    }

    try {
      const photo = await CapCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source:
          source === 'camera'
            ? CameraSource.Camera
            : source === 'gallery'
              ? CameraSource.Photos
              : CameraSource.Prompt,
        promptLabelHeader: 'Fotoğraf Seç',
        promptLabelCancel: 'İptal',
        promptLabelPhoto: 'Galeriden Seç',
        promptLabelPicture: 'Fotoğraf Çek',
        correctOrientation: true,
      })

      if (!photo.dataUrl) return null
      return { dataUrl: photo.dataUrl, format: photo.format ?? 'jpeg' }
    } catch (err) {
      // User cancelled or denied permission — treat as no selection.
      const message = err instanceof Error ? err.message : String(err)
      if (/cancel/i.test(message) || /denied/i.test(message)) return null
      throw err
    }
  },
}

function pickImageViaInput(source: PickSource): Promise<PickedImage | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    if (source === 'camera') input.capture = 'environment'
    input.style.display = 'none'

    let settled = false
    const finish = (value: PickedImage | null) => {
      if (settled) return
      settled = true
      document.body.removeChild(input)
      resolve(value)
    }

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return finish(null)

      const reader = new FileReader()
      reader.onerror = () => reject(reader.error)
      reader.onload = () => {
        const dataUrl = String(reader.result ?? '')
        const format = (file.type.split('/')[1] ?? 'jpeg').toLowerCase()
        finish({ dataUrl, format })
      }
      reader.readAsDataURL(file)
    }

    // Some browsers don't fire 'change' on cancel — use a focus/timeout
    // fallback so the promise doesn't hang forever.
    window.addEventListener(
      'focus',
      () => {
        setTimeout(() => {
          if (!input.files || input.files.length === 0) finish(null)
        }, 500)
      },
      { once: true },
    )

    document.body.appendChild(input)
    input.click()
  })
}

// ─── Document picking (athlete documents, PDFs, etc.) ───────────────────────

export interface PickedDocument {
  blob: Blob
  name: string
  size: number
  mimeType: string
}

/**
 * Pick a generic document from the device.
 *
 * Uses a hidden <input type="file"> which works in both browsers and the
 * Capacitor WebView — iOS opens the Files app, Android opens the system
 * document picker. No extra plugin needed.
 */
export function pickDocument(options?: {
  accept?: string
  multiple?: boolean
}): Promise<PickedDocument[] | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = options?.accept ?? 'application/pdf,image/*'
    input.multiple = options?.multiple ?? false
    input.style.display = 'none'

    let settled = false
    const finish = (value: PickedDocument[] | null) => {
      if (settled) return
      settled = true
      document.body.removeChild(input)
      resolve(value)
    }

    input.onchange = () => {
      const files = input.files
      if (!files || files.length === 0) return finish(null)

      try {
        const picked: PickedDocument[] = Array.from(files).map((f) => ({
          blob: f,
          name: f.name,
          size: f.size,
          mimeType: f.type || 'application/octet-stream',
        }))
        finish(picked)
      } catch (err) {
        reject(err)
      }
    }

    window.addEventListener(
      'focus',
      () => {
        setTimeout(() => {
          if (!input.files || input.files.length === 0) finish(null)
        }, 500)
      },
      { once: true },
    )

    document.body.appendChild(input)
    input.click()
  })
}

// ─── Data URL → Blob helper (for uploads) ───────────────────────────────────

export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, payload] = dataUrl.split(',', 2)
  const mime = /data:([^;]+);/.exec(meta)?.[1] ?? 'application/octet-stream'
  const binary = atob(payload)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}
