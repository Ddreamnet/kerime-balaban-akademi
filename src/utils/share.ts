const CONFIGURED_ORIGIN = (import.meta.env.VITE_PUBLIC_SITE_URL ?? '').trim().replace(/\/$/, '')

/** Resolve a public, shareable URL for the given app path. */
export function publicUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const origin = CONFIGURED_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${origin}${normalized}`
}

interface ShareArgs {
  title: string
  text?: string
  url: string
}

type ShareResult = 'shared' | 'copied' | 'failed'

/**
 * Native share via Web Share API when available (opens iOS/Android share sheet
 * inside Capacitor WebView), otherwise copies the URL to clipboard.
 */
export async function sharePublic(args: ShareArgs): Promise<ShareResult> {
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share(args)
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return 'failed'
    }
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(args.url)
      return 'copied'
    }
  } catch {
    // ignore — fall through
  }
  return 'failed'
}
