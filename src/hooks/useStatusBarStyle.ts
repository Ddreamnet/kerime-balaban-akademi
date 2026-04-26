import { useEffect } from 'react'
import { setNativeStatusBarLight } from '@/lib/capacitor'

/**
 * Sets the native iOS/Android status-bar icon color while the calling
 * component is mounted, restoring the default dark icons on unmount.
 *
 * Pass `light: true` on pages whose top of the page is dark (e.g. a hero
 * section with `bg-on-surface`) so the OS status-bar icons stay readable.
 *
 * No-op in web browsers.
 */
export function useStatusBarStyle(options: { light: boolean }) {
  const light = options.light

  useEffect(() => {
    void setNativeStatusBarLight(light)
    return () => {
      // Restore the app's default (dark icons / light page surfaces).
      void setNativeStatusBarLight(false)
    }
  }, [light])
}
