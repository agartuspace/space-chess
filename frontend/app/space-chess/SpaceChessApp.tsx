'use client'

import dynamic from 'next/dynamic'
import { ConversationProvider } from '@elevenlabs/react'
import { useGameStore } from './stores/game-store'
import NebulaBackground from './components/NebulaBackground'

/** Purely decorative; SSR + inline styles + animation shorthand diverge in the DOM — load only in the browser. */
const StarField = dynamic(() => import('./components/StarField'), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  ),
})
import TopBar from './components/TopBar'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import GameView from './components/game/GameView'

const ONBOARDING_SCENES = [
  'welcome',
  'tagline',
  'calibrate_intro',
  'calibrate_board',
  'puzzle_1',
  'puzzle_2',
  'puzzle_3',
  'calibrate_result',
] as const

export default function SpaceChessApp() {
  const scene = useGameStore((s) => s.scene)

  const isOnboarding = (ONBOARDING_SCENES as readonly string[]).includes(scene)
  const isEarlyOnboarding = scene === 'welcome' || scene === 'tagline'

  return (
    <ConversationProvider>
      <div
        style={{
          position: 'relative',
          height: '100dvh',
          maxHeight: '100dvh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Layer 0: Nebula gradient background */}
        <NebulaBackground />

        {/* Layer 1: Star field */}
        <StarField />

        {/* Layer 2: Top navigation (hidden on very first scenes) */}
        {!isEarlyOnboarding && (
          <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
            <TopBar />
          </div>
        )}

        {/* Layer 3: Main content — game locks to viewport; onboarding may scroll inside */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            flex: 1,
            minHeight: 0,
            overflow: isOnboarding ? 'auto' : 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isOnboarding ? <OnboardingFlow /> : <GameView />}
        </div>
      </div>
    </ConversationProvider>
  )
}
