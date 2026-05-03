'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../stores/game-store'
import { apiUrl } from '@/lib/api-url'
import { authHeaders } from '@/lib/auth-token'

interface Principle {
  id: string
  name: string
  status: 'learning' | 'practicing' | 'mastered'
  progress: number
}

interface RecentGame {
  id: string
  date: string
  result: 'win' | 'loss' | 'draw'
  opening: string
  moves: number
}

interface ProgressData {
  gamesPlayed: number
  puzzlesSolved: number
  principles: Principle[]
  recentGames: RecentGame[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  learning: { label: 'Изучение', color: '#f59e0b' },
  practicing: { label: 'Практика', color: '#7c3aed' },
  mastered: { label: 'Освоено', color: '#22c55e' },
}

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  win: { label: 'Победа', color: '#22c55e' },
  loss: { label: 'Поражение', color: '#ef4444' },
  draw: { label: 'Ничья', color: '#94a3b8' },
}

const MOCK_DATA: ProgressData = {
  gamesPlayed: 0,
  puzzlesSolved: 3,
  principles: [
    { id: '1', name: 'Контроль центра', status: 'learning', progress: 30 },
    { id: '2', name: 'Развитие фигур', status: 'practicing', progress: 65 },
    { id: '3', name: 'Безопасность короля', status: 'mastered', progress: 100 },
  ],
  recentGames: [],
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        margin: '0 0 14px',
        fontSize: 11,
        fontWeight: 700,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </h3>
  )
}

export default function JournalDrawer() {
  const { journalOpen, setJournalOpen, userId, chessLevel, calibrationScore } = useGameStore((s) => ({
    journalOpen: s.journalOpen,
    setJournalOpen: s.setJournalOpen,
    userId: s.userId,
    chessLevel: s.chessLevel,
    calibrationScore: s.calibrationScore,
  }))

  const [data, setData] = useState<ProgressData>(MOCK_DATA)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!journalOpen) return
    if (!userId) return

    setLoading(true)
    fetch(apiUrl(`/api/v1/chess/progress/${userId}`), { headers: { ...authHeaders() } })
      .then(async (res) => {
        if (!res.ok) throw new Error(`progress ${res.status}`)
        return (await res.json()) as {
          chess_level?: string
          calibration_score?: number
          games_played?: number
          puzzles_solved?: number
        }
      })
      .then((payload) => {
        setData({
          gamesPlayed: payload.games_played ?? 0,
          puzzlesSolved: payload.puzzles_solved ?? 0,
          principles: MOCK_DATA.principles,
          recentGames: [],
        })
      })
      .catch(() => {
        // оставляем мок, если API недоступен или нет записи прогресса
      })
      .finally(() => setLoading(false))
  }, [journalOpen, userId])

  const levelLabels: Record<string, string> = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
  }

  return (
    <AnimatePresence>
      {journalOpen && (
        <>
          <div
            onClick={() => setJournalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 14, 26, 0.5)',
              zIndex: 100,
            }}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '90%',
              maxWidth: 400,
              background: 'rgba(13, 20, 36, 0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(124, 58, 237, 0.25)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px 24px 20px',
                borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: 'rgba(13, 20, 36, 0.97)',
                zIndex: 1,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#f8fafc',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                📒 Журнал
              </h2>
              <button
                onClick={() => setJournalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 24, color: '#94a3b8', textAlign: 'center' }}>Загрузка...</div>
            ) : (
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* Progress overview */}
                <section>
                  <SectionTitle>Прогресс</SectionTitle>
                  <div
                    style={{
                      background: 'rgba(124, 58, 237, 0.08)',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      borderRadius: 14,
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      <StatBlock label="Партий" value={data.gamesPlayed} />
                      <StatBlock label="Задач" value={data.puzzlesSolved} />
                      <StatBlock label="Калибровка" value={`${calibrationScore}/6`} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>Уровень:</span>
                      <span
                        style={{
                          padding: '2px 12px',
                          borderRadius: 100,
                          background: 'rgba(124, 58, 237, 0.2)',
                          border: '1px solid rgba(124, 58, 237, 0.4)',
                          color: '#7c3aed',
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {levelLabels[chessLevel]}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Principles */}
                <section>
                  <SectionTitle>Принципы</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.principles.map((p) => {
                      const s = STATUS_LABELS[p.status]
                      return (
                        <div
                          key={p.id}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(124, 58, 237, 0.15)',
                            borderRadius: 10,
                            padding: '12px 14px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#f8fafc', fontSize: 14 }}>{p.name}</span>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 100,
                                background: `${s.color}22`,
                                color: s.color,
                                fontWeight: 600,
                              }}
                            >
                              {s.label}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 4,
                              borderRadius: 2,
                              background: 'rgba(255,255,255,0.08)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${p.progress}%`,
                                borderRadius: 2,
                                background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`,
                                transition: 'width 0.5s ease',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* Recent games */}
                <section>
                  <SectionTitle>Последние партии</SectionTitle>
                  {data.recentGames.length === 0 ? (
                    <p style={{ color: '#475569', fontSize: 14, textAlign: 'center', padding: '20px 0', margin: 0 }}>
                      Партий пока нет
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {data.recentGames.map((game) => {
                        const r = RESULT_LABELS[game.result]
                        return (
                          <div
                            key={game.id}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(124, 58, 237, 0.15)',
                              borderRadius: 10,
                              padding: '10px 14px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <p style={{ color: '#f8fafc', fontSize: 13, margin: '0 0 2px' }}>
                                {game.opening}
                              </p>
                              <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>
                                {game.date} · {game.moves} ходов
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: 12,
                                padding: '3px 10px',
                                borderRadius: 100,
                                background: `${r.color}22`,
                                color: r.color,
                                fontWeight: 600,
                              }}
                            >
                              {r.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ color: '#f8fafc', fontSize: 20, fontWeight: 700, margin: '0 0 2px', fontFamily: "'Space Grotesk'" }}>
        {value}
      </p>
      <p style={{ color: '#475569', fontSize: 11, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
    </div>
  )
}
