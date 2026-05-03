'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useHydrationSafeReducedMotion } from '../../hooks/use-hydration-safe-reduced-motion'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '../../stores/game-store'
import { useUstaz } from '../../lib/coach/use-ustaz'

// Animated waveform bars
function Waveform({ active }: { active: boolean }) {
  const prefersReducedMotion = useHydrationSafeReducedMotion()
  const heights = [14, 22, 18, 26, 16]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          animate={
            active && !prefersReducedMotion
              ? { height: [8, h, 8], opacity: [0.5, 1, 0.5] }
              : { height: 4, opacity: 0.3 }
          }
          transition={
            active
              ? { duration: 0.6 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }
              : { duration: 0.3 }
          }
          style={{
            width: 3,
            borderRadius: 2,
            background: 'linear-gradient(180deg, #7c3aed, #06b6d4)',
          }}
        />
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    idle: { bg: 'rgba(71, 85, 105, 0.2)', text: '#475569', label: 'Ожидание' },
    connecting: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', label: 'Подключение...' },
    listening: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', label: 'Слушает' },
    thinking: { bg: 'rgba(124, 58, 237, 0.15)', text: '#7c3aed', label: 'Думает...' },
    speaking: { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', label: 'Говорит' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'Ошибка' },
  }
  const style = colors[status] ?? colors.idle
  return (
    <span
      style={{
        padding: '2px 10px',
        borderRadius: 100,
        background: style.bg,
        color: style.text,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}
    >
      {style.label}
    </span>
  )
}

function TranscriptBubble({ role, text }: { role: 'user' | 'agent'; text: string }) {
  const isAgent = role === 'agent'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isAgent ? 'flex-start' : 'flex-end',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          padding: '8px 12px',
          borderRadius: isAgent ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
          background: isAgent
            ? 'rgba(124, 58, 237, 0.15)'
            : 'rgba(6, 182, 212, 0.12)',
          border: isAgent
            ? '1px solid rgba(124, 58, 237, 0.25)'
            : '1px solid rgba(6, 182, 212, 0.25)',
          color: '#f8fafc',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {isAgent && (
          <span
            style={{
              display: 'block',
              fontSize: 10,
              color: '#7c3aed',
              fontWeight: 600,
              marginBottom: 3,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Устаз
          </span>
        )}
        {text}
      </div>
    </div>
  )
}

export default function UstazPanel() {
  const prefersReducedMotion = useHydrationSafeReducedMotion()
  const [expanded, setExpanded] = useState(true)
  const [alwaysListen, setAlwaysListen] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)

  const { coachStatus, isCoachActive, transcript } = useGameStore(
    useShallow((s) => ({
      coachStatus: s.coachStatus,
      isCoachActive: s.isCoachActive,
      transcript: s.transcript,
    })),
  )

  const { startSession, endSession, sendMessage } = useUstaz()

  const recentMessages = transcript.slice(-3)
  const isSpeaking = coachStatus === 'speaking'
  const isListening = coachStatus === 'listening'

  const handleToggleCoach = async () => {
    if (isCoachActive) {
      await endSession()
    } else {
      await startSession()
    }
  }

  const handleSendText = () => {
    if (textInput.trim()) {
      sendMessage(textInput.trim())
      setTextInput('')
      setShowTextInput(false)
    }
  }

  if (!expanded) {
    return (
      <motion.button
        layoutId="ustaz-panel"
        onClick={() => setExpanded(true)}
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
          borderRadius: 100,
          background: 'rgba(13, 20, 36, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(124, 58, 237, 0.35)',
          boxShadow: isCoachActive
            ? '0 0 20px rgba(124, 58, 237, 0.4)'
            : '0 4px 16px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 40,
        }}
      >
        <span style={{ fontSize: 16 }}>🎙</span>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: '#f8fafc',
          }}
        >
          Устаз
        </span>
        {isCoachActive && (
          <motion.div
            animate={prefersReducedMotion ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isSpeaking ? '#06b6d4' : '#22c55e',
            }}
          />
        )}
      </motion.button>
    )
  }

  return (
    <motion.div
      layoutId="ustaz-panel"
      initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        width: '100%',
        maxWidth: 320,
        height: '100%',
        minHeight: 0,
        background: 'rgba(13, 20, 36, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(124, 58, 237, 0.25)',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <img
            src="/space-chess/ustaz-avatar.svg"
            alt="Устаз"
            width={44}
            height={44}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
              border: '1px solid rgba(124, 58, 237, 0.35)',
            }}
          />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: '#f8fafc',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Устаз
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <StatusBadge status={coachStatus} />
              <Waveform active={isSpeaking} />
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
          }}
          aria-label="Свернуть"
        >
          ✕
        </button>
      </div>

      {/* Transcript */}
      <div
        style={{
          padding: '14px 16px',
          minHeight: 0,
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {recentMessages.length === 0 ? (
          <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', margin: '20px 0' }}>
            {isCoachActive ? 'Готов к разговору...' : 'Нажми «Говорить» чтобы начать'}
          </p>
        ) : (
          recentMessages.map((msg, i) => (
            <TranscriptBubble key={`${msg.ts}-${i}`} role={msg.role} text={msg.text} />
          ))
        )}
      </div>

      {/* Text input */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', padding: '0 16px' }}
          >
            <div style={{ display: 'flex', gap: 8, paddingBottom: 12 }}>
              <input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Напишите Устазу..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  color: '#f8fafc',
                  fontSize: 13,
                  outline: 'none',
                }}
                autoFocus
              />
              <button
                onClick={handleSendText}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: 'rgba(124, 58, 237, 0.25)',
                  border: '1px solid rgba(124, 58, 237, 0.4)',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div
        style={{
          padding: '12px 16px 16px',
          borderTop: '1px solid rgba(124, 58, 237, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flexShrink: 0,
        }}
      >
        {/* Main speak button */}
        <button
          onClick={handleToggleCoach}
          style={{
            padding: '11px 16px',
            borderRadius: 10,
            background: isCoachActive
              ? 'rgba(239, 68, 68, 0.15)'
              : isListening
                ? 'rgba(34, 197, 94, 0.2)'
                : 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(6, 182, 212, 0.15))',
            border: isCoachActive
              ? '1px solid rgba(239, 68, 68, 0.3)'
              : '1px solid rgba(124, 58, 237, 0.35)',
            color: isCoachActive ? '#ef4444' : '#f8fafc',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <span>{isCoachActive ? '⏹' : '🎙'}</span>
          {isCoachActive ? 'Завершить сессию' : 'Говорить с Устазом'}
        </button>

        {/* Secondary controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setAlwaysListen((v) => !v)}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 8,
              background: alwaysListen ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
              border: alwaysListen ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(124, 58, 237, 0.2)',
              color: alwaysListen ? '#22c55e' : '#94a3b8',
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ∞ Слушать
          </button>
          <button
            onClick={() => setShowTextInput((v) => !v)}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 8,
              background: showTextInput ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.05)',
              border: showTextInput ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(124, 58, 237, 0.2)',
              color: showTextInput ? '#06b6d4' : '#94a3b8',
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            T Текст
          </button>
        </div>

        {/* Footer status */}
        <p style={{ color: '#475569', fontSize: 11, margin: 0, textAlign: 'center' }}>
          {coachStatus === 'idle' && 'Устаз ждёт вашего хода'}
          {coachStatus === 'connecting' && 'Устанавливается связь...'}
          {coachStatus === 'listening' && '🎤 Говорите сейчас'}
          {coachStatus === 'thinking' && '🧠 Анализирует позицию...'}
          {coachStatus === 'speaking' && '🔊 Устаз говорит'}
          {coachStatus === 'error' && '⚠️ Ошибка подключения'}
        </p>
      </div>
    </motion.div>
  )
}
