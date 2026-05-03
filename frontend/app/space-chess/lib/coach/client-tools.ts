import type { Square } from 'chess.js'
import type { GameState } from '../../stores/game-store'

// Brain tools — call external APIs / Stockfish for analysis
export const brainTools = {
  get_evaluation: async ({ fen }: { fen: string }): Promise<{ cp: number; mate: number | null }> => {
    try {
      const { getStockfishEngine } = await import('../stockfish/stockfish-worker')
      const engine = await getStockfishEngine()
      return await engine.evaluate(fen, 15)
    } catch {
      return { cp: 0, mate: null }
    }
  },

  get_top_moves: async ({
    fen,
    n,
  }: {
    fen: string
    n: number
  }): Promise<{ moves: string[] }> => {
    try {
      const { getStockfishEngine } = await import('../stockfish/stockfish-worker')
      const engine = await getStockfishEngine()
      // Simple: just return best move for now; multi-PV requires engine reconfiguration
      const best = await engine.getBestMove(fen, 14)
      return { moves: [best].slice(0, n) }
    } catch {
      return { moves: [] }
    }
  },

  get_move_quality: async ({
    fen,
    uci,
  }: {
    fen: string
    uci: string
  }): Promise<{ quality: string; delta_cp: number }> => {
    try {
      const { getStockfishEngine } = await import('../stockfish/stockfish-worker')
      const engine = await getStockfishEngine()
      const before = await engine.evaluate(fen, 14)

      const { Chess } = await import('chess.js')
      const chess = new Chess(fen)
      const from = uci.slice(0, 2) as Square
      const to = uci.slice(2, 4) as Square
      const promotion = uci.length === 5 ? (uci[4] as 'q' | 'r' | 'b' | 'n') : undefined
      chess.move({ from, to, promotion })
      const after = await engine.evaluate(chess.fen(), 14)

      const delta = after.cp - before.cp
      let quality = 'good'
      if (delta <= -200) quality = 'blunder'
      else if (delta <= -100) quality = 'mistake'
      else if (delta <= -50) quality = 'inaccuracy'
      else if (delta >= 0) quality = 'best'

      return { quality, delta_cp: delta }
    } catch {
      return { quality: 'good', delta_cp: 0 }
    }
  },

  get_opening_name: async ({ fen }: { fen: string }): Promise<{ name: string }> => {
    try {
      const res = await fetch(
        `https://explorer.lichess.ovh/masters?fen=${encodeURIComponent(fen)}&moves=0`,
      )
      const data = await res.json() as { opening?: { name?: string } }
      return { name: data.opening?.name ?? 'Unknown opening' }
    } catch {
      return { name: 'Unknown opening' }
    }
  },

  get_threats: async ({ fen }: { fen: string }): Promise<{ threats: string[] }> => {
    try {
      const { Chess: ChessForThreats } = await import('chess.js')
      const chess = new ChessForThreats(fen)
      const moves = chess.moves({ verbose: true })
      const captures = moves
        .filter((m) => m.flags.includes('c') || m.flags.includes('e'))
        .map((m) => `${m.piece.toUpperCase()} captures on ${m.to}`)
        .slice(0, 5)
      return { threats: captures }
    } catch {
      return { threats: [] }
    }
  },

  get_tactical_theme: async ({ fen }: { fen: string }): Promise<{ themes: string[] }> => {
    try {
      const { Chess: ChessClass } = await import('chess.js')
      const chess = new ChessClass(fen)
      const themes: string[] = []

      if (chess.inCheck()) themes.push('check')
      const moves = chess.moves({ verbose: true })
      const forkMoves = moves.filter(
        (m) => (m.flags.includes('c') || m.flags.includes('e')) && m.piece === 'n',
      )
      if (forkMoves.length > 0) themes.push('fork')

      return { themes }
    } catch {
      return { themes: [] }
    }
  },
}

// UI tools — update Zustand store to manipulate board visuals
export const uiTools = {
  highlight_squares: (
    params: { squares: string[]; color: string },
    store: Pick<GameState, 'setAnnotations'>,
  ): void => {
    store.setAnnotations({ squares: params.squares, color: params.color })
  },

  draw_arrow: (
    params: { from: string; to: string; color: string },
    store: Pick<GameState, 'annotations' | 'setAnnotations'>,
  ): void => {
    const existing = store.annotations.arrows ?? []
    store.setAnnotations({
      arrows: [...existing, { from: params.from, to: params.to, color: params.color }],
    })
  },

  clear_annotations: (
    _params: Record<string, never>,
    store: Pick<GameState, 'clearAnnotations'>,
  ): void => {
    store.clearAnnotations()
  },

  show_principle_card: (
    params: { title: string; text: string; theme: string },
    store: Pick<GameState, 'setPrincipleCard'>,
  ): void => {
    store.setPrincipleCard(params)
    setTimeout(() => store.setPrincipleCard(null), 8000)
  },

  offer_rewind: (
    _params: Record<string, never>,
    store: Pick<GameState, 'setRewindAvailable'>,
  ): void => {
    store.setRewindAvailable(true)
  },

  end_session: (
    _params: Record<string, never>,
    store: Pick<GameState, 'setCoachActive'>,
  ): void => {
    store.setCoachActive(false)
  },
}
