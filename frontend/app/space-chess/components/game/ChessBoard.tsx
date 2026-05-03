'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess, type Square } from 'chess.js'
import { motion } from 'framer-motion'
import { useHydrationSafeReducedMotion } from '../../hooks/use-hydration-safe-reduced-motion'
import { useShallow } from 'zustand/react/shallow'
import { canMoveTo, tryMove } from '../../lib/chess-move'
import { cburnettPieceSrc, chessPieceImgStyle } from '../../lib/piece-glyph'
import { useGameStore } from '../../stores/game-store'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

function coordsToSquare(file: number, rank: number): string {
  return `${FILES[file]}${rank + 1}`
}

interface PieceData { type: string; color: 'w' | 'b' }
interface BoardData { [square: string]: PieceData }

function extractBoard(chess: Chess): BoardData {
  const board: BoardData = {}
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const sq = coordsToSquare(file, rank) as Square
      const piece = chess.get(sq)
      if (piece) board[sq] = piece
    }
  }
  return board
}

function findKingSquare(board: BoardData, color: 'w' | 'b'): string | null {
  for (const [sq, piece] of Object.entries(board)) {
    if (piece.type === 'k' && piece.color === color) return sq
  }
  return null
}

export default function ChessBoard() {
  const prefersReducedMotion = useHydrationSafeReducedMotion()
  const {
    fen, setFen, addMove, playerColor, opponentLevel, annotations,
    rewindAvailable, lastBlunderFen, setRewindAvailable,
  } = useGameStore(
    useShallow((s) => ({
      fen: s.fen,
      setFen: s.setFen,
      addMove: s.addMove,
      playerColor: s.playerColor,
      opponentLevel: s.opponentLevel,
      annotations: s.annotations,
      rewindAvailable: s.rewindAvailable,
      lastBlunderFen: s.lastBlunderFen,
      setRewindAvailable: s.setRewindAvailable,
    })),
  )

  const chessRef = useRef(new Chess(fen))
  const [board, setBoard] = useState<BoardData>(() => extractBoard(chessRef.current))
  const [selected, setSelected] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [isThinking, setIsThinking] = useState(false)

  const chess = chessRef.current
  const isPlayerTurn =
    (chess.turn() === 'w' && playerColor === 'white') ||
    (chess.turn() === 'b' && playerColor === 'black')

  const isCheck = chess.inCheck()
  const checkKingSquare = isCheck ? findKingSquare(board, chess.turn()) : null

  const syncBoard = useCallback(() => {
    setBoard(extractBoard(chessRef.current))
    setFen(chessRef.current.fen())
  }, [setFen])

  const makeBotMove = useCallback(async () => {
    setIsThinking(true)
    await new Promise<void>((resolve) => setTimeout(resolve, 300 + Math.random() * 400))

    try {
      const { getStockfishEngine } = await import('../../lib/stockfish/stockfish-worker')
      const engine = await getStockfishEngine()
      engine.setLevel(opponentLevel)
      const bestMove = await engine.getBestMove(chess.fen())
      const from = bestMove.slice(0, 2)
      const to = bestMove.slice(2, 4)
      const promotion = bestMove.length === 5 ? bestMove[4] : undefined
      const result = chess.move({ from, to, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined })
      if (result) {
        addMove(result.san)
        setLastMove({ from, to })
        syncBoard()
      }
    } catch {
      const moves = chess.moves({ verbose: true })
      if (moves.length > 0) {
        const move = moves[Math.floor(Math.random() * moves.length)]
        chess.move(move)
        addMove(move.san)
        setLastMove({ from: move.from, to: move.to })
        syncBoard()
      }
    } finally {
      setIsThinking(false)
    }
  }, [chess, opponentLevel, addMove, syncBoard])

  const handleSquareClick = useCallback(
    (sq: string) => {
      if (!isPlayerTurn || isThinking || chess.isGameOver()) return

      if (selected) {
        if (selected === sq) {
          setSelected(null)
          setLegalMoves([])
          return
        }

        const currentColor = playerColor === 'white' ? 'w' : 'b'
        const destPiece = board[sq]
        // Own piece on destination and no legal move there (e.g. switch selection) —
        // skip tryMove entirely so chess.js never sees illegal { from, to }.
        // Castling is kept: king legally moves onto the rook's square.
        if (
          destPiece &&
          destPiece.color === currentColor &&
          !canMoveTo(chess, selected as Square, sq as Square)
        ) {
          setSelected(sq)
          const moves = chess.moves({ square: sq as Square, verbose: true })
          setLegalMoves(moves.map((m) => m.to))
          return
        }

        const result = tryMove(chess, selected as Square, sq as Square)
        if (result) {
          addMove(result.san)
          setLastMove({ from: selected, to: sq })
          syncBoard()
          setSelected(null)
          setLegalMoves([])

          if (!chess.isGameOver()) {
            makeBotMove()
          }
          return
        }

        if (destPiece && destPiece.color === currentColor) {
          setSelected(sq)
          const moves = chess.moves({ square: sq as Square, verbose: true })
          setLegalMoves(moves.map((m) => m.to))
        } else {
          setSelected(null)
          setLegalMoves([])
        }
      } else {
        const piece = board[sq]
        const currentColor = playerColor === 'white' ? 'w' : 'b'
        if (piece && piece.color === currentColor) {
          setSelected(sq)
          const moves = chess.moves({ square: sq as Square, verbose: true })
          setLegalMoves(moves.map((m) => m.to))
        }
      }
    },
    [selected, board, chess, isPlayerTurn, isThinking, playerColor, addMove, syncBoard, makeBotMove],
  )

  const renderArrows = () => {
    if (!annotations.arrows.length) return null
    const size = 100
    return (
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          {annotations.arrows.map((arrow, i) => (
            <marker
              key={i}
              id={`arrow-${i}`}
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 4 2, 0 4" fill={arrow.color} />
            </marker>
          ))}
        </defs>
        {annotations.arrows.map((arrow, i) => {
          const fromFile = FILES.indexOf(arrow.from[0] as typeof FILES[number])
          const fromRank = parseInt(arrow.from[1]) - 1
          const toFile = FILES.indexOf(arrow.to[0] as typeof FILES[number])
          const toRank = parseInt(arrow.to[1]) - 1
          const x1 = (fromFile + 0.5) * (100 / 8)
          const y1 = (7 - fromRank + 0.5) * (100 / 8)
          const x2 = (toFile + 0.5) * (100 / 8)
          const y2 = (7 - toRank + 0.5) * (100 / 8)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={arrow.color}
              strokeWidth="2"
              strokeOpacity="0.8"
              markerEnd={`url(#arrow-${i})`}
            />
          )
        })}
      </svg>
    )
  }

  const renderBoard = () => {
    const rows = []
    const flipped = playerColor === 'black'

    const rankOrder = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]
    const fileOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]

    for (const rank of rankOrder) {
      const cells = []
      for (const file of fileOrder) {
        const sq = coordsToSquare(file, rank)
        const isLight = (file + rank) % 2 === 1
        const piece = board[sq]
        const isSelected = sq === selected
        const isLegal = legalMoves.includes(sq)
        const isLastMove = lastMove?.from === sq || lastMove?.to === sq
        const isCheckSquare = sq === checkKingSquare
        const isAnnotated = annotations.squares.includes(sq)

        let bgColor = isLight ? '#c7d2fe' : '#1e1b4b'
        if (isSelected) bgColor = 'rgba(6, 182, 212, 0.55)'
        else if (isLastMove) bgColor = isLight ? 'rgba(245, 158, 11, 0.5)' : 'rgba(245, 158, 11, 0.4)'
        else if (isCheckSquare) bgColor = 'rgba(239, 68, 68, 0.5)'
        else if (isAnnotated) bgColor = annotations.color + '55'

        cells.push(
          <div
            key={sq}
            onClick={() => handleSquareClick(sq)}
            style={{
              width: '12.5%',
              paddingBottom: '12.5%',
              position: 'relative',
              backgroundColor: bgColor,
              cursor: isPlayerTurn && !isThinking ? 'pointer' : 'default',
              transition: 'background-color 0.12s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(18px, 2.8vw, 44px)',
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              {piece ? (
                <img
                  src={cburnettPieceSrc(piece.color, piece.type)}
                  alt=""
                  draggable={false}
                  style={chessPieceImgStyle}
                />
              ) : null}
              {isLegal && !piece && (
                <div
                  style={{
                    width: '32%',
                    height: '32%',
                    borderRadius: '50%',
                    background: 'rgba(6, 182, 212, 0.55)',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {isLegal && piece && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    border: '3px solid rgba(6, 182, 212, 0.7)',
                    borderRadius: 2,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          </div>,
        )
      }
      rows.push(
        <div key={rank} style={{ display: 'flex', width: '100%' }}>
          {cells}
        </div>,
      )
    }
    return rows
  }

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { scale: [1, 1.005, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'relative', width: '100%', maxWidth: 560 }}
    >
      <div
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          position: 'relative',
        }}
      >
        {renderBoard()}
        {renderArrows()}

        {/* Thinking indicator */}
        {isThinking && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(13, 20, 36, 0.85)',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 12,
              color: '#94a3b8',
              backdropFilter: 'blur(8px)',
            }}
          >
            ⌛ думает...
          </div>
        )}

        {/* Game over overlay */}
        {chess.isGameOver() && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 14, 26, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', margin: '0 0 8px', fontFamily: "'Space Grotesk'" }}>
              {chess.isCheckmate()
                ? chess.turn() === 'w'
                  ? '♟ Чёрные выиграли!'
                  : '♟ Белые выиграли!'
                : 'Ничья'}
            </p>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>
              {chess.isStalemate() ? 'Пат' : chess.isThreefoldRepetition() ? 'Троекратное повторение' : ''}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
