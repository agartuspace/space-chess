'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useHydrationSafeReducedMotion } from '../../hooks/use-hydration-safe-reduced-motion'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore, type Scene, type ChessLevel } from '../../stores/game-store'
import CalibrationBoard from './CalibrationBoard'

const fadeVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

const transition = { duration: 0.5, ease: 'easeInOut' as const }

function SceneWrapper({ children, sceneKey }: { children: React.ReactNode; sceneKey: string }) {
  const prefersReducedMotion = useHydrationSafeReducedMotion()
  return (
    <motion.div
      key={sceneKey}
      variants={prefersReducedMotion ? {} : fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 24px',
        textAlign: 'center',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {children}
    </motion.div>
  )
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  )
}

function CTAButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: 32,
        padding: '14px 40px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
        border: 'none',
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: 600,
        fontFamily: "'Space Grotesk', sans-serif",
        cursor: 'pointer',
        boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 0 40px rgba(124, 58, 237, 0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 0 30px rgba(124, 58, 237, 0.4)'
      }}
    >
      {children}
    </button>
  )
}

// --- SCENE COMPONENTS ---

function WelcomeScene() {
  const setScene = useGameStore((s) => s.setScene)
  useEffect(() => {
    const t = setTimeout(() => setScene('tagline'), 2500)
    return () => clearTimeout(t)
  }, [setScene])

  return (
    <SceneWrapper sceneKey="welcome">
      <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 300, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
        Добро пожаловать в ваше{' '}
        <GradientText>пространство</GradientText>
      </h1>
    </SceneWrapper>
  )
}

function TaglineScene() {
  const setScene = useGameStore((s) => s.setScene)
  useEffect(() => {
    const t = setTimeout(() => setScene('calibrate_intro'), 2000)
    return () => clearTimeout(t)
  }, [setScene])

  return (
    <SceneWrapper sceneKey="tagline">
      <h2 style={{ fontSize: 'clamp(22px, 4vw, 40px)', fontWeight: 300, color: '#f8fafc', letterSpacing: '-0.01em', margin: 0 }}>
        Здесь шахматы{' '}
        <GradientText>адаптируются</GradientText>{' '}
        под вас
      </h2>
    </SceneWrapper>
  )
}

function CalibrateIntroScene() {
  const setScene = useGameStore((s) => s.setScene)
  return (
    <SceneWrapper sceneKey="calibrate_intro">
      <div style={{ padding: '32px 24px', maxWidth: 520 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>♟</div>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#f8fafc',
            margin: '0 0 12px',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Давайте определим ваш уровень
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 15, margin: 0 }}>
          3 задачи · 2 минуты
        </p>
        <CTAButton onClick={() => setScene('puzzle_1')}>Начать</CTAButton>
      </div>
    </SceneWrapper>
  )
}

function PuzzleScene({ index }: { index: number }) {
  return (
    <SceneWrapper sceneKey={`puzzle_${index}`}>
      <CalibrationBoard puzzleIndex={index} />
    </SceneWrapper>
  )
}

function CalibrateResultScene() {
  const { calibrationScore, chessLevel, setScene, setChessLevel } = useGameStore(
    useShallow((s) => ({
      calibrationScore: s.calibrationScore,
      chessLevel: s.chessLevel,
      setScene: s.setScene,
      setChessLevel: s.setChessLevel,
    })),
  )

  const levelMap: { threshold: number; level: ChessLevel; label: string; color: string; emoji: string }[] = [
    { threshold: 0, level: 'beginner', label: 'Начинающий', color: '#06b6d4', emoji: '🌱' },
    { threshold: 2, level: 'intermediate', label: 'Средний', color: '#7c3aed', emoji: '⚡' },
    { threshold: 4, level: 'advanced', label: 'Продвинутый', color: '#f59e0b', emoji: '🔥' },
  ]

  const determined = levelMap.reduce((acc, cur) => (calibrationScore >= cur.threshold ? cur : acc))

  useEffect(() => {
    setChessLevel(determined.level)
  }, [determined.level, setChessLevel])

  return (
    <SceneWrapper sceneKey="calibrate_result">
      <div style={{ padding: '32px 24px', maxWidth: 520, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{determined.emoji}</div>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: '#f8fafc',
            margin: '0 0 16px',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Ваш уровень определён
        </h2>
        <div
          style={{
            display: 'inline-block',
            padding: '8px 24px',
            borderRadius: 100,
            background: `${determined.color}22`,
            border: `1px solid ${determined.color}55`,
            color: determined.color,
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: 12,
          }}
        >
          {determined.label}
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 8px' }}>
          Счёт калибровки: {calibrationScore} / 6
        </p>
        <CTAButton onClick={() => setScene('playing')}>Начать игру</CTAButton>
      </div>
    </SceneWrapper>
  )
}

// --- MAIN FLOW ---

export default function OnboardingFlow() {
  const scene = useGameStore((s) => s.scene)

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence mode="wait">
        {scene === 'welcome' && <WelcomeScene />}
        {scene === 'tagline' && <TaglineScene />}
        {scene === 'calibrate_intro' && <CalibrateIntroScene />}
        {(scene === 'calibrate_board' || scene === 'puzzle_1') && <PuzzleScene index={0} />}
        {scene === 'puzzle_2' && <PuzzleScene index={1} />}
        {scene === 'puzzle_3' && <PuzzleScene index={2} />}
        {scene === 'calibrate_result' && <CalibrateResultScene />}
      </AnimatePresence>
    </div>
  )
}
