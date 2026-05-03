import type { GameState } from '../stores/game-store'

type WatcherStore = Pick<
  GameState,
  | 'resetSilenceCount'
  | 'proactiveSilenceCount'
  | 'incrementSilenceCount'
  | 'setRewindAvailable'
  | 'setLastBlunderFen'
>

export function createProactiveWatcher(
  store: WatcherStore,
  sendContextualUpdate: (msg: string) => void,
) {
  let lastEvalCp = 0
  let thinkingTimer: ReturnType<typeof setTimeout> | null = null

  return {
    onPlayerMove: async (fen: string, san: string) => {
      store.resetSilenceCount()

      if (thinkingTimer) {
        clearTimeout(thinkingTimer)
        thinkingTimer = null
      }

      try {
        const { getStockfishEngine } = await import('./stockfish/stockfish-worker')
        const engine = await getStockfishEngine()
        const result = await engine.evaluate(fen, 15)
        const delta = result.cp - lastEvalCp

        if (delta <= -150 && store.proactiveSilenceCount < 1) {
          const wasEval = lastEvalCp
          const nowEval = result.cp
          sendContextualUpdate(
            `[SYSTEM] Игрок только что сделал ход ${san}. Оценка позиции упала с ${wasEval} до ${nowEval} (разница: ${delta} центипешек). Это блюндер. Спроси, хочет ли игрок разобраться в этой позиции, предложи подумать вместе. Будь тёплым и поддерживающим.`,
          )
          store.incrementSilenceCount()
          store.setRewindAvailable(true)
          store.setLastBlunderFen(fen)
        }

        lastEvalCp = result.cp
      } catch {
        // Silently fail if stockfish not available
      }
    },

    startThinkingTimer: () => {
      if (thinkingTimer) clearTimeout(thinkingTimer)
      thinkingTimer = setTimeout(() => {
        if (store.proactiveSilenceCount < 1) {
          sendContextualUpdate(
            '[SYSTEM] Игрок думает уже больше 25 секунд. Мягко предложи подсказку или спроси, нужна ли помощь. Не навязывайся.',
          )
          store.incrementSilenceCount()
        }
      }, 25000)
    },

    stopThinkingTimer: () => {
      if (thinkingTimer) {
        clearTimeout(thinkingTimer)
        thinkingTimer = null
      }
    },
  }
}
