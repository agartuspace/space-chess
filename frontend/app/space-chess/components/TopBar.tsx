'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useGameStore } from '../stores/game-store'

export default function TopBar() {
  const prefersReducedMotion = useReducedMotion()
  const { userId, isGuest, setJournalOpen, setProModalOpen, setUstazExplainerOpen, setAuthModalOpen } =
    useGameStore((s) => ({
      userId: s.userId,
      isGuest: s.isGuest,
      setJournalOpen: s.setJournalOpen,
      setProModalOpen: s.setProModalOpen,
      setUstazExplainerOpen: s.setUstazExplainerOpen,
      setAuthModalOpen: s.setAuthModalOpen,
    }))

  const isLoggedIn = !!(userId && !isGuest)
  const userInitial = isLoggedIn ? 'U' : null

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(13, 20, 36, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>♟</span>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 18,
            background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Space Chess
        </span>
      </div>

      {/* Nav buttons */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TopBarButton onClick={() => setJournalOpen(true)}>Журнал</TopBarButton>

        <TopBarButton
          onClick={() => setProModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
            borderColor: 'rgba(245, 158, 11, 0.3)',
          }}
        >
          Pro <span style={{ color: '#f59e0b' }}>✦</span>
        </TopBarButton>

        <TopBarButton onClick={() => setUstazExplainerOpen(true)}>
          Узнать об Ustaz
        </TopBarButton>

        {isLoggedIn ? (
          <button
            onClick={() => setAuthModalOpen(true)}
            title="Профиль"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {userInitial}
          </button>
        ) : (
          <TopBarButton
            onClick={() => setAuthModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.1))',
              borderColor: 'rgba(124, 58, 237, 0.4)',
            }}
          >
            Войти
          </TopBarButton>
        )}
      </nav>
    </motion.header>
  )
}

interface TopBarButtonProps {
  onClick: () => void
  children: React.ReactNode
  style?: React.CSSProperties
}

function TopBarButton({ onClick, children, style }: TopBarButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 8,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        color: '#94a3b8',
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.2s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#f8fafc'
        e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#94a3b8'
        e.currentTarget.style.borderColor = style?.borderColor ?? 'rgba(124, 58, 237, 0.2)'
      }}
    >
      {children}
    </button>
  )
}
