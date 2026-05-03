'use client'

import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Star {
  id: number
  top: string
  left: string
  size: number
  opacity: number
  animationDelay: string
  animationDuration: string
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export default function StarField() {
  const prefersReducedMotion = useReducedMotion()

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      top: `${seededRandom(i * 3) * 100}%`,
      left: `${seededRandom(i * 3 + 1) * 100}%`,
      size: seededRandom(i * 3 + 2) < 0.7 ? 1 : seededRandom(i * 3 + 2) < 0.9 ? 2 : 3,
      opacity: 0.3 + seededRandom(i * 7) * 0.7,
      animationDelay: `${seededRandom(i * 5) * 4}s`,
      animationDuration: `${2 + seededRandom(i * 11) * 3}s`,
    }))
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            backgroundColor: '#f8fafc',
            opacity: star.opacity,
            animation: prefersReducedMotion
              ? 'none'
              : `starTwinkle ${star.animationDuration} ease-in-out ${star.animationDelay} infinite`,
            willChange: 'opacity',
          }}
        />
      ))}
    </div>
  )
}
