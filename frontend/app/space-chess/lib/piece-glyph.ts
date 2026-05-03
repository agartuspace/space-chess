import type { CSSProperties } from 'react'
import { CBURNETT_PIECE_DATA_URLS } from './cburnett-piece-data-urls'

/** Data URL for a chess.js piece (color `w`|`b`, type `p`|`n`|… lowercase). */
export function cburnettPieceSrc(color: 'w' | 'b', pieceType: string): string {
  const t = pieceType.toLowerCase()
  const key = `${color}${t.toUpperCase()}`
  return CBURNETT_PIECE_DATA_URLS[key] ?? ''
}

export const chessPieceImgStyle: CSSProperties = {
  width: '82%',
  height: '82%',
  objectFit: 'contain',
  pointerEvents: 'none',
  userSelect: 'none',
}
