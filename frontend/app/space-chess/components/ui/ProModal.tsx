'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '../../stores/game-store'

const FREE_FEATURES = ['15 мин Устаза в день', '3 задачи за партию', 'Журнал прогресса']
const PRO_FEATURES = [
  'Неограниченное время с Устазом',
  'Экспорт PGN с голосовыми комментариями',
  'Глубокая персонализация обучения',
  'Приоритетный доступ к новым функциям',
  'Расширенная аналитика партий',
]

export default function ProModal() {
  const { proModalOpen, setProModalOpen } = useGameStore(
    useShallow((s) => ({
      proModalOpen: s.proModalOpen,
      setProModalOpen: s.setProModalOpen,
    })),
  )

  const handleUpgrade = () => {
    alert('FreedomPay интеграция скоро')
  }

  return (
    <AnimatePresence>
      {proModalOpen && (
        <>
          <div
            onClick={() => setProModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 14, 26, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 101,
              width: '90%',
              maxWidth: 480,
              background: 'rgba(13, 20, 36, 0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 24,
              padding: '32px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 40px rgba(245, 158, 11, 0.08)',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setProModalOpen(false)}
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

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
              <h2
                style={{
                  margin: '0 0 8px',
                  fontSize: 24,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Space Chess Pro
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                Разблокируйте полный потенциал Устаза
              </p>
            </div>

            {/* Tiers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {/* Free */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                }}
              >
                <p
                  style={{
                    margin: '0 0 12px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Free
                </p>
                {FREE_FEATURES.map((f) => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: '#475569', fontSize: 13 }}>✓</span>
                    <span style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Pro */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: 14,
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    padding: '2px 12px',
                    borderRadius: 100,
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#0a0e1a',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Рекомендуем
                </div>
                <p
                  style={{
                    margin: '0 0 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#f59e0b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Pro ✦
                </p>
                {PRO_FEATURES.map((f) => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: '#f59e0b', fontSize: 13 }}>✓</span>
                    <span style={{ color: '#f8fafc', fontSize: 12, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleUpgrade}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                color: '#0a0e1a',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: '0 0 24px rgba(245, 158, 11, 0.35)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Подключить Pro
            </button>

            <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
              Оплата через FreedomPay · Доступно скоро
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
