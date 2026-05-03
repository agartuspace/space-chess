'use client'

import { useCallback, useRef } from 'react'
import { useConversation } from '@elevenlabs/react'
import { apiUrl } from '@/lib/api-url'
import { authHeaders } from '@/lib/auth-token'
import { useGameStore } from '../../stores/game-store'
import { brainTools, uiTools } from './client-tools'

async function fetchSignedUrl(): Promise<string> {
  const snapshot = useGameStore.getState()
  let gameId = snapshot.gameId
  if (!gameId) {
    if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
      throw new Error('crypto.randomUUID недоступен — обновите браузер')
    }
    gameId = crypto.randomUUID()
    snapshot.setGameId(gameId)
  }

  const res = await fetch(apiUrl('/api/v1/chess/coach/session'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      game_id: gameId,
      user_level: snapshot.chessLevel,
      opponent_level: snapshot.opponentLevel,
      current_opening: '',
      recent_principles: [],
    }),
  })
  if (!res.ok) throw new Error(`Failed to get session URL: ${res.status}`)
  const data = await res.json() as { signed_url?: string; url?: string }
  const url = data.signed_url ?? data.url
  if (!url) throw new Error('No signed_url in response')
  return url
}

export function useUstaz() {
  const store = useGameStore()
  const pendingMessageRef = useRef<string | null>(null)

  const conversation = useConversation({
    onConnect: () => {
      store.setCoachStatus('listening')
      store.setCoachActive(true)
    },
    onDisconnect: () => {
      store.setCoachStatus('idle')
      store.setCoachActive(false)
    },
    onMessage: ({ message, source }: { message: string; source: string }) => {
      const role = source === 'user' ? 'user' : 'agent'
      store.addTranscriptMessage({ role, text: message })
    },
    onError: (error: Error | string) => {
      console.error('[Ustaz] Error:', error)
      store.setCoachStatus('error')
    },
  })

  const buildClientTools = useCallback(() => {
    return {
      get_evaluation: async (params: { fen: string }) =>
        brainTools.get_evaluation(params),

      get_top_moves: async (params: { fen: string; n: number }) =>
        brainTools.get_top_moves(params),

      get_move_quality: async (params: { fen: string; uci: string }) =>
        brainTools.get_move_quality(params),

      get_opening_name: async (params: { fen: string }) =>
        brainTools.get_opening_name(params),

      get_threats: async (params: { fen: string }) =>
        brainTools.get_threats(params),

      get_tactical_theme: async (params: { fen: string }) =>
        brainTools.get_tactical_theme(params),

      highlight_squares: (params: { squares: string[]; color: string }) => {
        uiTools.highlight_squares(params, store)
        return {}
      },

      draw_arrow: (params: { from: string; to: string; color: string }) => {
        uiTools.draw_arrow(params, store)
        return {}
      },

      clear_annotations: () => {
        uiTools.clear_annotations({}, store)
        return {}
      },

      show_principle_card: (params: { title: string; text: string; theme: string }) => {
        uiTools.show_principle_card(params, store)
        return {}
      },

      offer_rewind: () => {
        uiTools.offer_rewind({}, store)
        return {}
      },

      end_session: () => {
        uiTools.end_session({}, store)
        return {}
      },
    }
  }, [store])

  const startSession = useCallback(async () => {
    try {
      store.setCoachStatus('connecting')
      const signedUrl = await fetchSignedUrl()
      await conversation.startSession({
        signedUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clientTools: buildClientTools() as any,
      })
    } catch (err) {
      console.error('[Ustaz] Failed to start session:', err)
      store.setCoachStatus('error')
      store.setCoachActive(false)
    }
  }, [conversation, store, buildClientTools])

  const endSession = useCallback(async () => {
    try {
      await conversation.endSession()
    } catch (err) {
      console.error('[Ustaz] Failed to end session:', err)
    } finally {
      store.setCoachStatus('idle')
      store.setCoachActive(false)
    }
  }, [conversation, store])

  const sendMessage = useCallback(
    (text: string) => {
      store.addTranscriptMessage({ role: 'user', text })
      // ElevenLabs conversational SDK doesn't expose a direct text injection method
      // in the public API — store for potential use with server-side text fallback
      pendingMessageRef.current = text
    },
    [store],
  )

  const interruptIfSpeaking = useCallback(() => {
    if (store.coachStatus === 'speaking') {
      // @ts-expect-error — interrupt is not in the public type but exists in the SDK
      conversation.interrupt?.()
    }
  }, [conversation, store.coachStatus])

  return {
    startSession,
    endSession,
    sendMessage,
    interruptIfSpeaking,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
  }
}
