'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '../../stores/game-store'

const STEPS = [
  {
    icon: '🧙‍♂️',
    title: 'Ваш шахматный наставник',
    description:
      'Ұстаз — мудрый ИИ-тренер, который говорит с вами во время игры. Он заметит ошибки, объяснит принципы и поддержит в трудный момент. Как настоящий наставник, он знает когда промолчать, а когда сказать нужное слово.',
  },
  {
    icon: '🧠',
    title: 'Умный анализ в реальном времени',
    description:
      'Ұстаз видит каждый ваш ход. Встроенный Stockfish вычисляет оценку позиции, выявляет ошибки и угрозы. Ұстаз интерпретирует сухие цифры на человеческом языке — помогает понять "почему", а не просто "что".',
  },
  {
    icon: '🔄',
    title: 'Учёба через практику',
    description:
      'Мы используем цикл Колба: сделал ход → получил опыт → разобрал с Ұстазом → понял принцип → применил в следующей игре. Ұстаз предложит перемотать позицию после блюндера, покажет лучший ход и объяснит тактическую тему.',
  },
]

export default function UstazExplainerModal() {
  const { ustazExplainerOpen, setUstazExplainerOpen, setAuthModalOpen } = useGameStore(
    useShallow((s) => ({
      ustazExplainerOpen: s.ustazExplainerOpen,
      setUstazExplainerOpen: s.setUstazExplainerOpen,
      setAuthModalOpen: s.setAuthModalOpen,
    })),
  )
  const [step, setStep] = useState(0)

  const current = STEPS[step]

  const handleCTA = () => {
    setUstazExplainerOpen(false)
    setAuthModalOpen(true)
  }

  return (
    <AnimatePresence>
      {ustazExplainerOpen && (
        <>
          <div
            onClick={() => setUstazExplainerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 14, 26, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 101,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                pointerEvents: 'auto',
                position: 'relative',
                width: 'min(480px, calc(100vw - 48px))',
                background: 'rgba(13, 20, 36, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                borderRadius: 24,
                padding: '36px 36px 32px',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
              }}
            >
            {/* Close */}
            <button
              onClick={() => setUstazExplainerOpen(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                fontSize: 18,
              }}
            >
              ✕
            </button>

            {/* Step dots */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 28, justifyContent: 'center' }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  style={{
                    width: i === step ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === step ? '#7c3aed' : 'rgba(124, 58, 237, 0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: 56, marginBottom: 20 }}>{current.icon}</div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#f8fafc',
                    margin: '0 0 14px',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {current.title}
                </h2>
                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: 15,
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  ← Назад
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(37, 99, 235, 0.2))',
                    border: '1px solid rgba(124, 58, 237, 0.35)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Далее →
                </button>
              ) : (
                <button
                  onClick={handleCTA}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    border: 'none',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  Познакомиться с Ұстаз
                </button>
              )}
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
