import { useState, useEffect } from 'react'

/**
 * Returns true when the window has been scrolled past the given threshold.
 * Used for the sticky header glassmorphism effect.
 */
export function useScrolled(threshold = 60): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}
