'use client'

import { useGameStore } from './stores/game-store'
import NebulaBackground from './components/NebulaBackground'
import StarField from './components/StarField'
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
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Layer 0: Nebula gradient background */}
      <NebulaBackground />

      {/* Layer 1: Star field */}
      <StarField />

      {/* Layer 2: Top navigation (hidden on very first scenes) */}
      {!isEarlyOnboarding && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <TopBar />
        </div>
      )}

      {/* Layer 3: Main content */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        {isOnboarding ? <OnboardingFlow /> : <GameView />}
      </div>
    </div>
  )
}
