import type { Chess, Move, Square } from 'chess.js'

/** True if some legal move from `from` lands on `to` (including castling onto a friendly rook). */
export function canMoveTo(chess: Chess, from: Square, to: Square): boolean {
  const verbose = chess.moves({ square: from, verbose: true }) as Move[]
  return verbose.some((m) => m.to === to)
}

/**
 * Apply a legal move from `from` to `to` if one exists.
 *
 * Does not call `chess.move({ from, to })` speculatively — chess.js throws on
 * illegal moves, and some tooling surfaces that throw even inside try/catch.
 * Instead we pick a matching entry from `moves({ square, verbose: true })`,
 * then call `move` with a descriptor we know is legal.
 */
export function tryMove(chess: Chess, from: Square, to: Square): Move | null {
  const piece = chess.get(from)
  if (!piece) return null

  const verbose = chess.moves({ square: from, verbose: true }) as Move[]
  const candidates = verbose.filter((m) => m.to === to)
  if (candidates.length === 0) return null

  const preferQueen = candidates.find((m) => m.promotion === 'q')
  const nonPromotion = candidates.find((m) => !m.promotion)
  const pick = preferQueen ?? nonPromotion ?? candidates[0]

  try {
    if (pick.promotion) {
      return chess.move({ from: pick.from, to: pick.to, promotion: pick.promotion })
    }
    return chess.move({ from: pick.from, to: pick.to })
  } catch {
    return null
  }
}
