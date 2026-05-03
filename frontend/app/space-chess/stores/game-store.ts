import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Scene =
  | 'welcome'
  | 'tagline'
  | 'calibrate_intro'
  | 'calibrate_board'
  | 'puzzle_1'
  | 'puzzle_2'
  | 'puzzle_3'
  | 'calibrate_result'
  | 'playing'

export type ChessLevel = 'beginner' | 'intermediate' | 'advanced'
export type MoveQuality = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
export type CoachStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error'

export interface Annotation {
  squares: string[]
  color: string
  arrows: Array<{ from: string; to: string; color: string }>
}

export interface PrincipleCard {
  title: string
  text: string
  theme: string
}

export interface TranscriptMessage {
  role: 'user' | 'agent'
  text: string
  ts: number
}

/** Saved on login/register for UI (e.g. profile menu). Cleared for guests and logout. */
export type AccountProfile = { email: string; displayName: string }

export interface GameState {
  // Scene management
  scene: Scene
  setScene: (s: Scene) => void

  // Game state
  fen: string
  setFen: (fen: string) => void
  history: string[]
  addMove: (san: string) => void
  clearHistory: () => void
  gameId: string | null
  setGameId: (id: string) => void

  // Player
  playerColor: 'white' | 'black'
  opponentLevel: number
  chessLevel: ChessLevel
  setChessLevel: (l: ChessLevel) => void
  setOpponentLevel: (level: number) => void

  // Calibration
  calibrationScore: number
  addCalibrationPoint: (pts: number) => void
  calibrationPuzzleIndex: number
  nextCalibrationPuzzle: () => void

  // Annotations (from Ustaz ui-tools)
  annotations: Annotation
  setAnnotations: (a: Partial<Annotation>) => void
  clearAnnotations: () => void
  principleCard: PrincipleCard | null
  setPrincipleCard: (card: PrincipleCard | null) => void

  // Coach state
  isCoachActive: boolean
  setCoachActive: (v: boolean) => void
  coachStatus: CoachStatus
  setCoachStatus: (s: CoachStatus) => void
  transcript: TranscriptMessage[]
  addTranscriptMessage: (msg: { role: 'user' | 'agent'; text: string }) => void
  proactiveSilenceCount: number
  incrementSilenceCount: () => void
  resetSilenceCount: () => void

  // Rewind
  rewindAvailable: boolean
  setRewindAvailable: (v: boolean) => void
  lastBlunderFen: string | null
  setLastBlunderFen: (fen: string | null) => void

  // Auth
  userId: string | null
  guestId: string | null
  isGuest: boolean
  accountEmail: string | null
  accountDisplayName: string | null
  setUser: (
    userId: string | null,
    guestId: string | null,
    isGuest: boolean,
    profile?: AccountProfile | null,
  ) => void

  // UI modals
  authModalOpen: boolean
  setAuthModalOpen: (v: boolean) => void
  ustazExplainerOpen: boolean
  setUstazExplainerOpen: (v: boolean) => void
  journalOpen: boolean
  setJournalOpen: (v: boolean) => void
  reviewOpen: boolean
  setReviewOpen: (v: boolean) => void
  proModalOpen: boolean
  setProModalOpen: (v: boolean) => void
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

type PersistedState = Pick<
  GameState,
  | 'chessLevel'
  | 'userId'
  | 'guestId'
  | 'isGuest'
  | 'calibrationScore'
  | 'accountEmail'
  | 'accountDisplayName'
>

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Scene
      scene: 'welcome',
      setScene: (s) => set({ scene: s }),

      // Game state
      fen: INITIAL_FEN,
      setFen: (fen) => set({ fen }),
      history: [],
      addMove: (san) => set((state) => ({ history: [...state.history, san] })),
      clearHistory: () => set({ history: [] }),
      gameId: null,
      setGameId: (id) => set({ gameId: id }),

      // Player
      playerColor: 'white',
      opponentLevel: 5,
      chessLevel: 'beginner',
      setChessLevel: (l) => set({ chessLevel: l }),
      setOpponentLevel: (level) => set({ opponentLevel: level }),

      // Calibration
      calibrationScore: 0,
      addCalibrationPoint: (pts) =>
        set((state) => ({ calibrationScore: state.calibrationScore + pts })),
      calibrationPuzzleIndex: 0,
      nextCalibrationPuzzle: () =>
        set((state) => ({ calibrationPuzzleIndex: state.calibrationPuzzleIndex + 1 })),

      // Annotations
      annotations: { squares: [], color: '#06b6d4', arrows: [] },
      setAnnotations: (a) =>
        set((state) => ({ annotations: { ...state.annotations, ...a } })),
      clearAnnotations: () =>
        set({ annotations: { squares: [], color: '#06b6d4', arrows: [] } }),
      principleCard: null,
      setPrincipleCard: (card) => set({ principleCard: card }),

      // Coach
      isCoachActive: false,
      setCoachActive: (v) => set({ isCoachActive: v }),
      coachStatus: 'idle',
      setCoachStatus: (s) => set({ coachStatus: s }),
      transcript: [],
      addTranscriptMessage: (msg) =>
        set((state) => ({
          transcript: [...state.transcript, { ...msg, ts: Date.now() }],
        })),
      proactiveSilenceCount: 0,
      incrementSilenceCount: () =>
        set((state) => ({ proactiveSilenceCount: state.proactiveSilenceCount + 1 })),
      resetSilenceCount: () => set({ proactiveSilenceCount: 0 }),

      // Rewind
      rewindAvailable: false,
      setRewindAvailable: (v) => set({ rewindAvailable: v }),
      lastBlunderFen: null,
      setLastBlunderFen: (fen) => set({ lastBlunderFen: fen }),

      // Auth
      userId: null,
      guestId: null,
      isGuest: false,
      accountEmail: null,
      accountDisplayName: null,
      setUser: (userId, guestId, isGuest, profile) =>
        set((state) => {
          const noRegisteredSession = !userId || isGuest
          if (noRegisteredSession) {
            return {
              userId,
              guestId,
              isGuest,
              accountEmail: null,
              accountDisplayName: null,
            }
          }
          if (profile != null) {
            return {
              userId,
              guestId,
              isGuest,
              accountEmail: profile.email,
              accountDisplayName: profile.displayName,
            }
          }
          return {
            userId,
            guestId,
            isGuest,
            accountEmail: state.accountEmail,
            accountDisplayName: state.accountDisplayName,
          }
        }),

      // UI modals
      authModalOpen: false,
      setAuthModalOpen: (v) => set({ authModalOpen: v }),
      ustazExplainerOpen: false,
      setUstazExplainerOpen: (v) => set({ ustazExplainerOpen: v }),
      journalOpen: false,
      setJournalOpen: (v) => set({ journalOpen: v }),
      reviewOpen: false,
      setReviewOpen: (v) => set({ reviewOpen: v }),
      proModalOpen: false,
      setProModalOpen: (v) => set({ proModalOpen: v }),
    }),
    {
      name: 'space-chess',
      partialize: (state): PersistedState => ({
        chessLevel: state.chessLevel,
        userId: state.userId,
        guestId: state.guestId,
        isGuest: state.isGuest,
        calibrationScore: state.calibrationScore,
        accountEmail: state.accountEmail,
        accountDisplayName: state.accountDisplayName,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<PersistedState>
        return {
          ...current,
          ...p,
          accountEmail: p.accountEmail ?? null,
          accountDisplayName: p.accountDisplayName ?? null,
        }
      },
    },
  ),
)
