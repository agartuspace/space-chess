'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useHydrationSafeReducedMotion } from '../hooks/use-hydration-safe-reduced-motion'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '../stores/game-store'
import { persistAccessToken } from '@/lib/auth-token'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

function shortUserId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 8)}…` : id
}

export default function TopBar() {
  const prefersReducedMotion = useHydrationSafeReducedMotion()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileWrapRef = useRef<HTMLDivElement>(null)

  const {
    userId,
    isGuest,
    accountEmail,
    accountDisplayName,
    chessLevel,
    setJournalOpen,
    setProModalOpen,
    setUstazExplainerOpen,
    setAuthModalOpen,
    setUser,
  } = useGameStore(
    useShallow((s) => ({
      userId: s.userId,
      isGuest: s.isGuest,
      accountEmail: s.accountEmail,
      accountDisplayName: s.accountDisplayName,
      chessLevel: s.chessLevel,
      setJournalOpen: s.setJournalOpen,
      setProModalOpen: s.setProModalOpen,
      setUstazExplainerOpen: s.setUstazExplainerOpen,
      setAuthModalOpen: s.setAuthModalOpen,
      setUser: s.setUser,
    })),
  )

  const isLoggedIn = !!(userId && !isGuest)
  const avatarLetter = (
    accountDisplayName?.trim().charAt(0) ||
    accountEmail?.trim().charAt(0) ||
    (userId ? userId.charAt(0) : 'U')
  ).toUpperCase()

  useEffect(() => {
    if (!profileOpen) return
    const onPointerDown = (e: MouseEvent) => {
      const el = profileWrapRef.current
      if (el && !el.contains(e.target as Node)) setProfileOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [profileOpen])

  const handleLogout = () => {
    persistAccessToken(null)
    setUser(null, null, false)
    setProfileOpen(false)
  }

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
        background: 'transparent',
        position: 'relative',
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
            color: '#f8fafc',
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
          <div
            ref={profileWrapRef}
            style={{
              position: 'relative',
              display: 'inline-flex',
              lineHeight: 0,
              flexShrink: 0,
              verticalAlign: 'middle',
            }}
          >
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              title="Профиль"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              style={{
                width: 36,
                height: 36,
                padding: 0,
                margin: 0,
                boxSizing: 'border-box',
                border: 'none',
                borderRadius: '50%',
                overflow: 'hidden',
                appearance: 'none',
                WebkitAppearance: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 1,
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                boxShadow: profileOpen ? '0 0 0 2px rgba(6, 182, 212, 0.85)' : 'none',
              }}
            >
              {avatarLetter}
            </button>

            {profileOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  minWidth: 260,
                  maxWidth: 'min(320px, calc(100vw - 32px))',
                  padding: '16px 18px',
                  borderRadius: 14,
                  background: 'rgba(13, 20, 36, 0.96)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(124, 58, 237, 0.28)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                  zIndex: 200,
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    margin: '0 0 4px',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#f8fafc',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {accountDisplayName?.trim() || 'Игрок'}
                </p>
                <p
                  style={{
                    margin: '0 0 12px',
                    fontSize: 13,
                    color: '#94a3b8',
                    wordBreak: 'break-word',
                  }}
                >
                  {accountEmail?.trim() || (userId ? shortUserId(userId) : '')}
                </p>
                <div
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    marginBottom: 14,
                    paddingTop: 10,
                    borderTop: '1px solid rgba(124, 58, 237, 0.15)',
                  }}
                >
                  Уровень:{' '}
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                    {LEVEL_LABELS[chessLevel] ?? chessLevel}
                  </span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#e2e8f0',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
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
