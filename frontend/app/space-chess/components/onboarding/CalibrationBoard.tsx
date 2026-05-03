'use client'

import { useState, useCallback } from 'react'
import { Chess, type Square } from 'chess.js'
import { motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { canMoveTo, tryMove } from '../../lib/chess-move'
import { cburnettPieceSrc, chessPieceImgStyle } from '../../lib/piece-glyph'
import { useGameStore } from '../../stores/game-store'

const CALIBRATION_PUZZLES = [
  {
    id: 'easy',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: 'f3g5',
    rating: 800,
    hint: 'Атакуй незащищённую пешку',
  },
  {
    id: 'medium',
    fen: '2r3k1/pp2ppbp/3p2p1/q4n2/3QP3/2N2P2/PPP3PP/R1B2RK1 b - - 0 15',
    solution: 'f5e3',
    rating: 1400,
    hint: 'Вилка!',
  },
  {
    id: 'hard',
    fen: '6k1/5ppp/p1pb4/1p6/4P1P1/1P3P2/P1r1N1KP/R7 b - - 0 1',
    solution: 'c2e2',
    rating: 2000,
    hint: 'Найди тихий ход',
  },
] as const

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

function squareToCoords(sq: string): { file: number; rank: number } {
  return { file: FILES.indexOf(sq[0] as typeof FILES[number]), rank: parseInt(sq[1]) - 1 }
}

function coordsToSquare(file: number, rank: number): string {
  return `${FILES[file]}${rank + 1}`
}

interface PieceData {
  type: string
  color: 'w' | 'b'
}

interface BoardData {
  [square: string]: PieceData
}

function parseFen(fen: string): BoardData {
  const chess = new Chess(fen)
  const board: BoardData = {}
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const sq = coordsToSquare(file, rank) as Square
      const piece = chess.get(sq)
      if (piece) {
        board[sq] = piece
      }
    }
  }
  return board
}

interface Props {
  puzzleIndex: number
}

export default function CalibrationBoard({ puzzleIndex }: Props) {
  const puzzle = CALIBRATION_PUZZLES[puzzleIndex]
  const { addCalibrationPoint, nextCalibrationPuzzle, setScene } = useGameStore(
    useShallow((s) => ({
      addCalibrationPoint: s.addCalibrationPoint,
      nextCalibrationPuzzle: s.nextCalibrationPuzzle,
      setScene: s.setScene,
    })),
  )

  const [chess] = useState(() => new Chess(puzzle.fen))
  const [board, setBoard] = useState<BoardData>(() => parseFen(puzzle.fen))
  const [selected, setSelected] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing')
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const isWhiteTurn = chess.turn() === 'w'

  const handleAdvance = useCallback(() => {
    nextCalibrationPuzzle()
    if (puzzleIndex === 0) setScene('puzzle_2')
    else if (puzzleIndex === 1) setScene('puzzle_3')
    else setScene('calibrate_result')
  }, [nextCalibrationPuzzle, puzzleIndex, setScene])

  const handleSquareClick = useCallback(
    (sq: string) => {
      if (status !== 'playing') return

      if (selected) {
        const moveUci = `${selected}${sq}`
        const expectedUci = puzzle.solution

        if (selected === sq) {
          setSelected(null)
          setLegalMoves([])
          return
        }

        const destPiece = board[sq]
        const ownOnDest =
          destPiece &&
          ((isWhiteTurn && destPiece.color === 'w') || (!isWhiteTurn && destPiece.color === 'b'))
        if (
          ownOnDest &&
          !canMoveTo(chess, selected as Square, sq as Square)
        ) {
          setSelected(sq)
          const moves = chess.moves({ square: sq as Square, verbose: true })
          setLegalMoves(moves.map((m) => m.to))
          return
        }

        const result = tryMove(chess, selected as Square, sq as Square)
        if (result) {
          setBoard(parseFen(chess.fen()))
          setLastMove({ from: selected, to: sq })
          setSelected(null)
          setLegalMoves([])

          const isCorrect =
            moveUci === expectedUci ||
            `${moveUci}q` === expectedUci

          if (isCorrect) {
            setStatus('correct')
            const pts = attempts === 0 ? 2 : 1
            addCalibrationPoint(pts)
            setTimeout(handleAdvance, 1200)
          } else {
            setStatus('wrong')
            setAttempts((a) => a + 1)
            chess.undo()
            setBoard(parseFen(chess.fen()))
            setTimeout(() => setStatus('playing'), 1000)
          }
        } else {
          const piece = board[sq]
          if (piece && ((isWhiteTurn && piece.color === 'w') || (!isWhiteTurn && piece.color === 'b'))) {
            setSelected(sq)
            const moves = chess.moves({ square: sq as Square, verbose: true })
            setLegalMoves(moves.map((m) => m.to))
          } else {
            setSelected(null)
            setLegalMoves([])
          }
        }
      } else {
        const piece = board[sq]
        if (piece && ((isWhiteTurn && piece.color === 'w') || (!isWhiteTurn && piece.color === 'b'))) {
          setSelected(sq)
          const moves = chess.moves({ square: sq as Square, verbose: true })
          setLegalMoves(moves.map((m) => m.to))
        }
      }
    },
    [selected, board, chess, puzzle.solution, isWhiteTurn, status, attempts, addCalibrationPoint, handleAdvance],
  )

  /** When the user plays Black, flip the board 180° so their pieces and back rank are at the bottom. */
  const boardFlipped = !isWhiteTurn

  const renderBoard = () => {
    const rows = []
    for (let vr = 0; vr < 8; vr++) {
      const cells = []
      for (let fc = 0; fc < 8; fc++) {
        const file = boardFlipped ? 7 - fc : fc
        const rank = boardFlipped ? vr : 7 - vr
        const sq = coordsToSquare(file, rank)
        const isLight = (file + rank) % 2 === 1
        const piece = board[sq]
        const isSelected = sq === selected
        const isLegal = legalMoves.includes(sq)
        const isLastMove = lastMove?.from === sq || lastMove?.to === sq

        cells.push(
          <div
            key={sq}
            onClick={() => handleSquareClick(sq)}
            style={{
              width: '12.5%',
              paddingBottom: '12.5%',
              position: 'relative',
              backgroundColor: isSelected
                ? 'rgba(6, 182, 212, 0.5)'
                : isLastMove
                  ? 'rgba(245, 158, 11, 0.4)'
                  : isLight
                    ? '#c7d2fe'
                    : '#1e1b4b',
              cursor: 'pointer',
              transition: 'background-color 0.1s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(18px, 2.5vw, 36px)',
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
                    width: '30%',
                    height: '30%',
                    borderRadius: '50%',
                    background: 'rgba(6, 182, 212, 0.6)',
                  }}
                />
              )}
              {isLegal && piece && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 2,
                    border: '3px solid rgba(6, 182, 212, 0.7)',
                  }}
                />
              )}
            </div>
          </div>,
        )
      }
      rows.push(
        <div key={vr} style={{ display: 'flex', width: '100%' }}>
          {cells}
        </div>,
      )
    }
    return rows
  }

  const statusColors = { playing: '#94a3b8', correct: '#22c55e', wrong: '#ef4444' }
  const statusTexts = {
    playing: `Ваш ход ${isWhiteTurn ? '(белые)' : '(чёрные)'}`,
    correct: '✓ Верно!',
    wrong: '✗ Попробуй ещё',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 16,
        maxWidth: 480,
        width: '100%',
      }}
    >
      {/* Task + status — одна строка, ширина как у доски */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          width: '100%',
        }}
      >
        <span
          style={{
            color: '#94a3b8',
            fontSize: 13,
            fontWeight: 500,
            flexShrink: 0,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Задача {puzzleIndex + 1} / 3 · Рейтинг {puzzle.rating}
        </span>
        <h3
          style={{
            margin: 0,
            color: statusColors[status],
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            transition: 'color 0.3s',
            textAlign: 'right',
            minWidth: 0,
          }}
        >
          {statusTexts[status]}
        </h3>
      </div>

      {/* Board */}
      <motion.div
        animate={{ scale: status === 'correct' ? [1, 1.02, 1] : status === 'wrong' ? [1, 0.98, 1] : 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(124, 58, 237, 0.3)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
        }}
      >
        {renderBoard()}
      </motion.div>

      {/* Подсказка (иконка) и пропуск — на всю ширину доски, по краям */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => setShowHint(true)}
          title={showHint ? puzzle.hint : 'Подсказка'}
          aria-label="Подсказка"
          style={{
            padding: 6,
            margin: 0,
            border: 'none',
            background: 'transparent',
            color: showHint ? '#06b6d4' : '#94a3b8',
            fontSize: 22,
            lineHeight: 1,
            cursor: 'pointer',
            borderRadius: 8,
            opacity: showHint ? 1 : 0.85,
          }}
        >
          💡
        </button>
        <button
          type="button"
          onClick={handleAdvance}
          style={{
            padding: '6px 0',
            margin: 0,
            border: 'none',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Пропустить →
        </button>
      </div>

      {showHint && (
        <p
          style={{
            margin: '-8px 0 0',
            fontSize: 13,
            lineHeight: 1.5,
            color: '#cbd5e1',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {puzzle.hint}
        </p>
      )}
    </div>
  )
}
