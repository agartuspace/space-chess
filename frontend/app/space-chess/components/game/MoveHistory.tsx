'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '../../stores/game-store'

export default function MoveHistory() {
  const history = useGameStore((s) => s.history)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const movePairs: Array<{ white: string; black?: string; moveNum: number }> = []
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({ moveNum: i / 2 + 1, white: history[i], black: history[i + 1] })
  }

  return (
    <div
      style={{
        background: 'rgba(13, 20, 36, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        borderRadius: 16,
        padding: 16,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontSize: 13,
          fontWeight: 600,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        История ходов
      </h3>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {movePairs.length === 0 ? (
          <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', margin: 'auto 0' }}>
            Ходов пока нет
          </p>
        ) : (
          movePairs.map((pair, idx) => {
            const isLastPair = idx === movePairs.length - 1
            const whiteIsLast = isLastPair && history.length % 2 === 1
            const blackIsLast = isLastPair && history.length % 2 === 0

            return (
              <div
                key={pair.moveNum}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 1fr',
                  gap: 4,
                  alignItems: 'center',
                  borderRadius: 6,
                  padding: '3px 6px',
                  background: isLastPair ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                }}
              >
                <span style={{ color: '#475569', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                  {pair.moveNum}.
                </span>
                <MoveCell move={pair.white} isLatest={whiteIsLast} />
                {pair.black && <MoveCell move={pair.black} isLatest={blackIsLast} />}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function MoveCell({ move, isLatest }: { move: string; isLatest: boolean }) {
  return (
    <span
      style={{
        fontSize: 13,
        fontFamily: 'monospace',
        color: isLatest ? '#06b6d4' : '#f8fafc',
        fontWeight: isLatest ? 600 : 400,
        padding: '2px 6px',
        borderRadius: 4,
        background: isLatest ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      {move}
    </span>
  )
}
