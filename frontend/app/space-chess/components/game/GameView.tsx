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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span
        title="Ваш уровень"
        style={{
          display: 'inline-block',
          alignSelf: 'flex-start',
          padding: '3px 12px',
          borderRadius: 100,
          background: 'rgba(124, 58, 237, 0.15)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          color: '#7c3aed',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'default',
        }}
      >
        {levelLabels[chessLevel]}
      </span>
      <p
        title="Противник"
        style={{ color: '#f8fafc', fontSize: 14, margin: 0, fontWeight: 500, cursor: 'default' }}
      >
        Stockfish · Уровень {opponentLevel}
      </p>
      <p title="Цвет" style={{ color: '#f8fafc', fontSize: 14, margin: 0, cursor: 'default' }}>
        {playerColor === 'white' ? '♔ Белые' : '♚ Чёрные'}
      </p>
      <p title="Ходов сделано" style={{ color: '#f8fafc', fontSize: 14, margin: 0, cursor: 'default' }}>
        {history.length}
      </p>
    </div>
  )
}

export default function GameView() {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Main layout */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '220px 1fr 300px',
          gridTemplateRows: 'minmax(0, 1fr)',
          gap: 20,
          padding: '20px 24px',
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
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
          }}
          className="left-sidebar"
        >
          <GlassCard style={{ flexShrink: 0, padding: 16 }}>
            <GameInfo />
          </GlassCard>

          <GlassCard
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: '12px 14px',
              overflow: 'hidden',
            }}
          >
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
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <ChessBoard />
        </div>

        {/* Right sidebar: Ustaz */}
        <div
          className="right-sidebar"
          style={{
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
    </div>
  )
}
