'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useHydrationSafeReducedMotion } from '../../hooks/use-hydration-safe-reduced-motion'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '../../stores/game-store'

const THEME_ICONS: Record<string, string> = {
  tactics: '⚔️',
  structure: '🏰',
  endgame: '👑',
  opening: '📖',
  strategy: '🗺️',
  calculation: '🧮',
  default: '💡',
}

const CARD_DURATION = 8000

export default function PrincipleCard() {
  const prefersReducedMotion = useHydrationSafeReducedMotion()
  const { principleCard, setPrincipleCard } = useGameStore(
    useShallow((s) => ({
      principleCard: s.principleCard,
      setPrincipleCard: s.setPrincipleCard,
    })),
  )

  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!principleCard) {
      setProgress(100)
      return
    }

    setProgress(100)
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / CARD_DURATION) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        setPrincipleCard(null)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [principleCard, setPrincipleCard])

  const icon = principleCard ? (THEME_ICONS[principleCard.theme] ?? THEME_ICONS.default) : null

  return (
    <AnimatePresence>
      {principleCard && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            position: 'fixed',
            top: 80,
            right: 24,
            zIndex: 60,
            width: 280,
            background: 'rgba(13, 20, 36, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(124, 58, 237, 0.1)',
          }}
        >
          {/* Progress bar */}
          <div
            style={{
              height: 3,
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                width: `${progress}%`,
              }}
              transition={{ duration: 0 }}
            />
          </div>

          <div style={{ padding: '16px 18px' }}>
            {/* Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 24 }}>{icon}</span>
              <h4
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#f8fafc',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {principleCard.title}
              </h4>
              <button
                onClick={() => setPrincipleCard(null)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Text */}
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: '#94a3b8',
                lineHeight: 1.6,
              }}
            >
              {principleCard.text}
            </p>

            {/* Theme badge */}
            <div style={{ marginTop: 10 }}>
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: 100,
                  background: 'rgba(124, 58, 237, 0.12)',
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  color: '#7c3aed',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {principleCard.theme}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
