'use client'

import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '../../stores/game-store'
import ChessBoard from './ChessBoard'
import MoveHistory from './MoveHistory'
import UstazPanel from '../coach/UstazPanel'
import RewindPrompt from './RewindPrompt'
import PrincipleCard from './PrincipleCard'
import AuthModal from '../ui/AuthModal'
import UstazExplainerModal from '../ui/UstazExplainerModal'
import JournalDrawer from '../ui/JournalDrawer'
import ProModal from '../ui/ProModal'

function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'rgba(13, 20, 36, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        borderRadius: 20,
        padding: 20,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function GameInfo() {
  const { chessLevel, opponentLevel, playerColor, history } = useGameStore(
    useShallow((s) => ({
      chessLevel: s.chessLevel,
      opponentLevel: s.opponentLevel,
      playerColor: s.playerColor,
      history: s.history,
    })),
  )

  const levelLabels: Record<string, string> = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <p style={{ color: '#475569', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Ваш уровень
        </p>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 12px',
            borderRadius: 100,
            background: 'rgba(124, 58, 237, 0.15)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            color: '#7c3aed',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {levelLabels[chessLevel]}
        </span>
      </div>
      <div>
        <p style={{ color: '#475569', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Противник
        </p>
        <p style={{ color: '#f8fafc', fontSize: 14, margin: 0, fontWeight: 500 }}>
          Stockfish · Уровень {opponentLevel}
        </p>
      </div>
      <div>
        <p style={{ color: '#475569', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Цвет
        </p>
        <p style={{ color: '#f8fafc', fontSize: 14, margin: 0 }}>
          {playerColor === 'white' ? '♔ Белые' : '♚ Чёрные'}
        </p>
      </div>
      <div>
        <p style={{ color: '#475569', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Ходов сделано
        </p>
        <p style={{ color: '#f8fafc', fontSize: 14, margin: 0 }}>{history.length}</p>
      </div>
    </div>
  )
}

export default function GameView() {
  return (
    <>
      {/* Main layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr 300px',
          gridTemplateRows: '1fr',
          gap: 20,
          padding: '20px 24px',
          minHeight: 'calc(100vh - 64px)',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
        className="game-grid"
      >
        {/* Left sidebar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minWidth: 0,
          }}
          className="left-sidebar"
        >
          <GlassCard>
            <h3
              style={{
                margin: '0 0 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Информация
            </h3>
            <GameInfo />
          </GlassCard>

          <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
            <MoveHistory />
          </GlassCard>
        </div>

        {/* Center: Chess board */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 8,
          }}
        >
          <ChessBoard />
        </div>

        {/* Right sidebar: Ustaz */}
        <div className="right-sidebar">
          <UstazPanel />
        </div>
      </div>

      {/* Floating overlays */}
      <RewindPrompt />
      <PrincipleCard />

      {/* Modals */}
      <AuthModal />
      <UstazExplainerModal />
      <JournalDrawer />
      <ProModal />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .game-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto !important;
          }
          .left-sidebar { display: none !important; }
          .right-sidebar { order: 3; }
        }
      `}</style>
    </>
  )
}
