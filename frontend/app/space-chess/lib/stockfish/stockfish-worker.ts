/**
 * Интеграция Stockfish WASM (ожидается файл `/public/stockfish/stockfish.js`).
 * Если worker не поднимется — простой случайный движатель на базе chess.js.
 */
export class StockfishEngine {
  private worker: Worker | null = null

  private fallback = false

  async init(): Promise<void> {
    if (typeof window === 'undefined') return

    await new Promise<void>((resolve) => {
      let worker: Worker
      try {
        worker = new Worker('/stockfish/stockfish.js')
      } catch {
        this.fallback = true
        resolve()
        return
      }

      let done = false
      const finish = (ok: boolean) => {
        if (done) return
        done = true
        if (!ok) {
          worker.terminate()
          this.worker = null
          this.fallback = true
        } else {
          this.worker = worker
        }
        resolve()
      }

      const timer = window.setTimeout(() => finish(false), 4000)

      const handler = (e: MessageEvent<string>) => {
        const msg = typeof e.data === 'string' ? e.data : String(e.data ?? '')
        if (msg.includes('uciok')) worker.postMessage('isready')
        if (!msg.includes('readyok')) return
        worker.removeEventListener('message', handler)
        worker.removeEventListener('error', onWorkerError)
        window.clearTimeout(timer)
        finish(true)
      }

      const onWorkerError = () => {
        worker.removeEventListener('message', handler)
        window.clearTimeout(timer)
        finish(false)
      }

      worker.addEventListener('message', handler, { passive: true })
      worker.addEventListener('error', onWorkerError, { once: true })

      worker.postMessage('uci')
    })
  }

  setLevel(level: number): void {
    const clamped = Math.min(20, Math.max(0, Math.round(level)))
    if (!this.worker || this.fallback) return
    this.worker.postMessage(`setoption name Skill Level value ${clamped}`)
  }

  async getBestMove(fen: string, depth = 12): Promise<string> {
    if (!this.worker || this.fallback) {
      return fallbackBestMove(fen)
    }

    return new Promise((resolve) => {
      const worker = this.worker!

      const timeout = window.setTimeout(() => {
        worker.removeEventListener('message', onMessage)
        void fallbackBestMove(fen).then(resolve)
      }, 4500)

      const onMessage = async (event: MessageEvent<string>) => {
        const raw = typeof event.data === 'string' ? event.data : String(event.data ?? '')
        if (!raw.startsWith('bestmove')) return
        window.clearTimeout(timeout)
        worker.removeEventListener('message', onMessage)
        const candidate = raw.split(/\s+/)[1] ?? ''
        if (!candidate || candidate === '(none)') resolve(await fallbackBestMove(fen))
        else resolve(candidate)
      }

      worker.addEventListener('message', onMessage, { passive: true })
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go depth ${depth}`)
    })
  }

  async evaluate(fen: string, depth = 15): Promise<{ cp: number; mate: number | null }> {
    if (!this.worker || this.fallback) return { cp: 0, mate: null }

    return new Promise((resolve) => {
      const worker = this.worker!
      let lastCp = 0
      let lastMate: number | null = null

      const timeout = window.setTimeout(() => {
        worker.removeEventListener('message', handler)
        resolve({ cp: lastCp, mate: lastMate })
      }, 4500)

      const handler = (event: MessageEvent<string>) => {
        const raw = typeof event.data === 'string' ? event.data : String(event.data ?? '')
        if (raw.includes('score cp')) {
          const match = raw.match(/score cp (-?\d+)/)
          if (match) lastCp = Number.parseInt(match[1], 10)
        }
        if (raw.includes('score mate')) {
          const match = raw.match(/score mate (-?\d+)/)
          if (match) lastMate = Number.parseInt(match[1], 10)
        }
        if (!raw.startsWith('bestmove')) return
        window.clearTimeout(timeout)
        worker.removeEventListener('message', handler)
        resolve({ cp: lastCp, mate: lastMate })
      }

      worker.addEventListener('message', handler, { passive: true })
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go depth ${depth}`)
    })
  }

  terminate(): void {
    this.worker?.terminate()
    this.worker = null
  }
}

async function fallbackBestMove(fen: string): Promise<string> {
  const { Chess } = await import('chess.js')
  const chess = new Chess(fen)
  const moves = chess.moves({ verbose: true })
  if (!moves.length) return 'e2e4'
  const captures = moves.filter((m) => m.flags.includes('c') || m.flags.includes('e'))
  const choices = captures.length ? captures : moves
  const move = choices[Math.floor(Math.random() * choices.length)]!
  return `${move.from}${move.to}${move.promotion ?? ''}`
}

let engine: StockfishEngine | null = null

export async function getStockfishEngine(): Promise<StockfishEngine> {
  if (!engine) {
    engine = new StockfishEngine()
    await engine.init()
  }
  return engine
}
