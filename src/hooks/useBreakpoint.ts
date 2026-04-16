import { useState, useEffect } from 'react'

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof breakpoints

/** Returns true when the viewport is at or above the given breakpoint. */
export function useBreakpoint(bp: Breakpoint): boolean {
  const [matches, setMatches] = useState(
    () => window.innerWidth >= breakpoints[bp]
  )

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoints[bp]}px)`)
    setMatches(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [bp])

  return matches
}

/** Returns current active breakpoint key. */
export function useActiveBreakpoint(): Breakpoint | 'xs' {
  const [active, setActive] = useState<Breakpoint | 'xs'>('xs')

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w >= 1536) setActive('2xl')
      else if (w >= 1280) setActive('xl')
      else if (w >= 1024) setActive('lg')
      else if (w >= 768) setActive('md')
      else if (w >= 640) setActive('sm')
      else setActive('xs')
    }
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return active
}
