import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { Providers } from './app/providers'
import { initCapacitor } from './lib/capacitor'

void initCapacitor()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <Providers />
  </StrictMode>
)

// Splash sequencing. Gates, in order, must all clear before the splash fades:
//   1. Splash video is actually playing (not just first frame visible)
//   2. window 'load' event has fired (the browser tab loading spinner is gone)
//   3. Minimum total duration has elapsed (at least MIN_SPLASH_MS)
//   4. Video has been visibly playing for MIN_VIDEO_VISIBLE_MS
//   5. Critical hero image is loaded (belt-and-suspenders, usually covered by #2)
// MAX_SPLASH_MS is the final safety cap.
const MIN_SPLASH_MS = 2000
const MIN_VIDEO_VISIBLE_MS = 900
const VIDEO_START_SAFETY_MS = 4000
const MAX_SPLASH_MS = 10000

const globals = window as unknown as {
  __splashStart?: number
  __videoStartedAt?: number
}
const splashStart = globals.__splashStart ?? Date.now()

let splashHidden = false
function hideSplash() {
  if (splashHidden) return
  splashHidden = true
  document.body.classList.remove('splash-active')
  const el = document.getElementById('app-splash')
  if (!el) return
  el.classList.add('is-hidden')
  const remove = () => el.remove()
  el.addEventListener('transitionend', remove, { once: true })
  setTimeout(remove, 1500)
}

function waitForTotalElapsed(ms: number): Promise<void> {
  const elapsed = Date.now() - splashStart
  if (elapsed >= ms) return Promise.resolve()
  return new Promise((r) => setTimeout(r, ms - elapsed))
}

function waitForWindowLoad(): Promise<void> {
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise((r) =>
    window.addEventListener('load', () => r(), { once: true }),
  )
}

function waitForVideoPlaying(): Promise<void> {
  return new Promise((resolve) => {
    const mark = () => {
      if (!globals.__videoStartedAt) globals.__videoStartedAt = Date.now()
      resolve()
    }
    const video = document.getElementById('app-splash-video') as HTMLVideoElement | null
    if (!video) return mark()

    // Already playing? (cached reload path)
    if (!video.paused && video.currentTime > 0) return mark()

    video.addEventListener('playing', mark, { once: true })

    // Nudge playback in case the autoplay attribute was ignored. Runs in parallel
    // with the 'playing' listener above — whichever resolves first wins.
    const p = video.play()
    if (p && typeof p.catch === 'function') {
      // If autoplay is blocked (rare when muted+playsinline), still mark so
      // splash doesn't hang. Video will just show first frame.
      p.catch(() => {
        setTimeout(mark, 500)
      })
    }

    // Network/autoplay safety net.
    setTimeout(mark, VIDEO_START_SAFETY_MS)
  })
}

function waitForVideoVisibleFor(ms: number): Promise<void> {
  const startedAt = globals.__videoStartedAt
  if (!startedAt) return new Promise((r) => setTimeout(r, ms))
  const elapsed = Date.now() - startedAt
  if (elapsed >= ms) return Promise.resolve()
  return new Promise((r) => setTimeout(r, ms - elapsed))
}

function waitForHeroImage(): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    const done = () => resolve()
    img.src = '/images/KickTheAir.webp'
    if (img.complete && img.naturalWidth > 0) {
      done()
      return
    }
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
  })
}

void (async () => {
  // Gate 1: video must actually be playing before we start other fetches.
  await waitForVideoPlaying()

  // Gate 2: remaining gates in parallel. window.load is the browser's "tab
  // spinner stopped" signal — most important to avoid the app appearing while
  // other resources are still streaming in.
  await Promise.all([
    waitForWindowLoad(),
    waitForTotalElapsed(MIN_SPLASH_MS),
    waitForVideoVisibleFor(MIN_VIDEO_VISIBLE_MS),
    waitForHeroImage(),
  ])

  requestAnimationFrame(hideSplash)
})()

setTimeout(hideSplash, MAX_SPLASH_MS)
