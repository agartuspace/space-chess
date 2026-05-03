'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useHydrationSafeReducedMotion } from '../../hooks/use-hydration-safe-reduced-motion'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '../../stores/game-store'

export default function RewindPrompt() {
  const prefersReducedMotion = useHydrationSafeReducedMotion()
  const { rewindAvailable, lastBlunderFen, setRewindAvailable, setFen } = useGameStore(
    useShallow((s) => ({
      rewindAvailable: s.rewindAvailable,
      lastBlunderFen: s.lastBlunderFen,
      setRewindAvailable: s.setRewindAvailable,
      setFen: s.setFen,
    })),
  )

  const handleRewind = () => {
    if (lastBlunderFen) {
      setFen(lastBlunderFen)
    }
    setRewindAvailable(false)
  }

  const handleDismiss = () => {
    setRewindAvailable(false)
  }

  return (
    <AnimatePresence>
      {rewindAvailable && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            background: 'rgba(13, 20, 36, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: 16,
            padding: '16px 24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(124, 58, 237, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            whiteSpace: 'nowrap',
          }}
        >
          <p style={{ color: '#f8fafc', fontSize: 14, margin: 0, fontWeight: 500 }}>
            Хочешь попробовать ещё раз?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRewind}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(37, 99, 235, 0.2))',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                color: '#f8fafc',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ↩ Перемотать
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              ✕ Продолжить
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
