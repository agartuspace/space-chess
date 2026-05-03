'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * `useReducedMotion()` reads `prefers-reduced-motion`, which is unavailable on
 * the server — SSR and the first client pass can disagree and trigger hydration
 * warnings on any `motion.*` / inline style that branches on it.
 *
 * Returns false until after mount, then the real preference.
 */
export function useHydrationSafeReducedMotion(): boolean {
  const fromMedia = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return false
  return Boolean(fromMedia)
}
