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

  // Status bar style.
  // Capacitor's enum is named after the *background*, not the text:
  //   Style.Light → DARK text/icons (for light backgrounds)
  //   Style.Dark  → LIGHT text/icons (for dark backgrounds)
  // Most pages have a light surface, so default to dark icons. Pages with a
  // dark hero call `setNativeStatusBarLight(true)` on mount to flip to white.
  if (getPlatform() === 'ios') {
    await StatusBar.setStyle({ style: Style.Light })
  } else {
    // Android status bar is the burgundy header area, so use light icons.
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#b7131a' })
    // Keep the WebView sitting BELOW the status bar on Android so
    // fixed-position headers don't clip under the system bar.
    try {
      await StatusBar.setOverlaysWebView({ overlay: false })
    } catch {
      // Older devices may not support this — pt-safe handles the fallback.
    }

    // Create the "default" notification channel used by FCM pushes.
    // Without a matching channel, Android 8+ silently demotes pushes to
    // the low-importance "fcm_fallback_notification_channel" and no
    // heads-up notification is shown.
    try {
      await CapLocal.createChannel({
        id: 'default',
        name: 'Bildirimler',
        description: 'Genel duyurular, hatırlatmalar ve güncellemeler',
        importance: 5, // IMPORTANCE_HIGH → heads-up
        visibility: 1,
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#b7131a',
      })
    } catch (err) {
      console.warn('[capacitor] createChannel failed', err)
    }
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

  // Clear app icon badge + delivered notifications on cold start and every
  // time the app comes to foreground. iOS doesn't fire an event when the
  // user swipes a notification from notification center, so the next-best
  // UX is "you opened the app, you've seen it" — matches Mail/Slack/etc.
  // On iOS, removeAllDeliveredNotifications also resets the icon badge to 0.
  void clearNotificationsAndBadge()
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) void clearNotificationsAndBadge()
  })
}

async function clearNotificationsAndBadge(): Promise<void> {
  if (!isNativePlatform()) return
  try {
    await CapPush.removeAllDeliveredNotifications()
  } catch (err) {
    // Throws on iOS if the app hasn't registered for remote notifications
    // yet (first launch, before permission grant) — safe to ignore.
    if (import.meta.env.DEV) {
      console.warn('[capacitor] clearNotificationsAndBadge skipped', err)
    }
  }
}

/**
 * Toggle native status-bar text/icon color at runtime.
 *   • `true`  → light icons (white) — for pages with dark hero backgrounds
 *   • `false` → dark icons — for pages with light surface
 *
 * NB: Capacitor's Style enum is counter-intuitive — `Style.Dark` means
 * "for dark backgrounds" i.e. white icons; `Style.Light` means dark icons.
 *
 * Safe to call on web — it's a no-op there.
 */
export async function setNativeStatusBarLight(light: boolean): Promise<void> {
  if (!isNativePlatform()) return
  try {
    await StatusBar.setStyle({ style: light ? Style.Dark : Style.Light })
  } catch (err) {
    console.warn('[capacitor] setNativeStatusBarLight failed', err)
  }
}

// ─── Push Notifications ─────────────────────────────────────────────────────

export const PushNotifications = {
  async requestPermission(): Promise<boolean> {
    if (!isNativePlatform()) return false

    try {
      const existing = await CapPush.checkPermissions()
      if (existing.receive === 'granted') return true

      // Always call requestPermissions for any non-granted state. Android
      // shows the system dialog exactly once per install; subsequent calls
      // resolve immediately with the cached answer — cheap and safe.
      const result = await CapPush.requestPermissions()
      if (result.receive !== 'granted') {
        console.warn(
          '[push] permission not granted. If no dialog appeared, the OS has ' +
          'already cached an answer — uninstall the app and reinstall, or ' +
          'enable notifications manually in Settings → Apps → Kerime Balaban ' +
          'Akademi → Notifications.',
        )
      }
      return result.receive === 'granted'
    } catch (err) {
      console.error('[push] requestPermission failed', err)
      return false
    }
  },

  async getToken(): Promise<string | null> {
    if (!isNativePlatform()) return null

    return new Promise(async (resolve) => {
      let settled = false
      let regHandle: { remove: () => Promise<void> } | null = null
      let errHandle: { remove: () => Promise<void> } | null = null

      const done = (value: string | null, reason: string) => {
        if (settled) return
        settled = true
        if (!value) {
          console.warn('[push] getToken failed:', reason)
        }
        void regHandle?.remove()
        void errHandle?.remove()
        resolve(value)
      }

      regHandle = await CapPush.addListener('registration', (token: Token) => {
        done(token.value, 'ok')
      })
      errHandle = await CapPush.addListener('registrationError', (err) => {
        done(null, `registrationError: ${JSON.stringify(err)}`)
      })

      try {
        await CapPush.register()
      } catch (err) {
        done(null, `register() threw: ${String(err)}`)
      }

      // Safety timeout — if FCM never responds (e.g. Google Play Services
      // outage, misconfigured google-services.json) we'd otherwise hang.
      setTimeout(() => done(null, 'timeout after 15s'), 15_000)
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
    if (!isNativePlatform()) return  // browser'da local notification yok

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
  /** data URL (data:image/webp;base64,... or data:image/jpeg;base64,...) — ready for <img src> and upload */
  dataUrl: string
  /** File extension without dot, e.g. "webp" | "jpeg" | "png" */
  format: string
}

/** Avatars render at 32–160px; 512 is comfortably above the largest retina target. */
const AVATAR_MAX_DIMENSION = 512

/**
 * Encoding quality. WebP at 0.82 produces a similar visual to JPEG 0.78 but
 * ~30% smaller. Both well within the "no perceptual loss for an avatar"
 * range. Bumped slightly above the old JPEG 0.75 because WebP handles
 * gradients better and we wanted a touch more headroom for skin tones.
 */
const WEBP_QUALITY = 0.82
const JPEG_QUALITY = 0.78

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
        quality: 75,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        // Resize so a 4032x3024 phone capture doesn't ship as a multi-MB
        // upload for what renders as a 32–160px avatar.
        width: AVATAR_MAX_DIMENSION,
        height: AVATAR_MAX_DIMENSION,
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
      // Capacitor Camera plugin returns JPEG. Re-encode to WebP for ~30%
      // smaller storage/transfer; falls back to the original JPEG on any
      // engine that can't encode WebP via canvas.
      return await recodeAsWebP(photo.dataUrl, photo.format ?? 'jpeg')
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

      resizeImageFile(file, AVATAR_MAX_DIMENSION)
        .then((picked) => finish(picked))
        .catch((err) => reject(err))
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

/**
 * Decode a picked image file, scale it so the longest side is at most
 * `maxDim` px (preserving aspect ratio), and encode as WebP (or JPEG on
 * engines that can't produce WebP via canvas). Mirrors the native Capacitor
 * Camera resize so web uploads aren't multi-MB.
 */
async function resizeImageFile(
  file: File,
  maxDim: number,
): Promise<PickedImage> {
  const bitmap =
    typeof createImageBitmap === 'function'
      ? await createImageBitmap(file)
      : await loadImageElement(file)

  const { width: srcW, height: srcH } = bitmap
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH))
  const dstW = Math.round(srcW * scale)
  const dstH = Math.round(srcH * scale)

  const canvas = document.createElement('canvas')
  canvas.width = dstW
  canvas.height = dstH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context oluşturulamadı.')
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, dstW, dstH)

  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close()

  return encodeCanvas(canvas)
}

/**
 * Encode a canvas as WebP if the browser/WebView supports it, falling back
 * to JPEG. WebP is ~30% smaller for equivalent visual quality. On iOS 14+
 * (Safari/WKWebView) and Chromium-based Android WebView, encoding works.
 */
function encodeCanvas(canvas: HTMLCanvasElement): PickedImage {
  const webp = canvas.toDataURL('image/webp', WEBP_QUALITY)
  if (webp.startsWith('data:image/webp')) {
    return { dataUrl: webp, format: 'webp' }
  }
  return {
    dataUrl: canvas.toDataURL('image/jpeg', JPEG_QUALITY),
    format: 'jpeg',
  }
}

/**
 * Re-encode an existing dataUrl (e.g. a JPEG returned by the native Camera
 * plugin) as WebP via canvas. Falls back to the original dataUrl/format
 * if anything goes wrong — never blocks the upload.
 */
async function recodeAsWebP(
  dataUrl: string,
  fallbackFormat: string,
): Promise<PickedImage> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('image decode failed'))
      i.src = dataUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context oluşturulamadı.')
    ctx.drawImage(img, 0, 0)

    const webp = canvas.toDataURL('image/webp', WEBP_QUALITY)
    if (webp.startsWith('data:image/webp')) {
      return { dataUrl: webp, format: 'webp' }
    }
  } catch {
    // Fall through to original — better to ship a slightly larger JPEG
    // than to fail the avatar update.
  }
  return { dataUrl, format: fallbackFormat }
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Görsel yüklenemedi.'))
    }
    img.src = url
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
