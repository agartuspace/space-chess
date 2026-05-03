'use client'

import { motion, useReducedMotion, type Transition } from 'framer-motion'

interface BlobConfig {
  id: string
  gradient: string
  initial: { x: string; y: string; scale: number }
  animate: { x: string[]; y: string[]; scale: number[] }
  width: string
  height: string
  transition: Transition
}

const blobs: BlobConfig[] = [
  {
    id: 'purple',
    gradient: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.18) 0%, rgba(124, 58, 237, 0.06) 50%, transparent 75%)',
    initial: { x: '-10%', y: '20%', scale: 1 },
    animate: { x: ['-10%', '-5%', '-12%', '-10%'], y: ['20%', '30%', '15%', '20%'], scale: [1, 1.08, 0.95, 1] },
    width: '70vw',
    height: '70vh',
    transition: { duration: 18, repeat: Infinity, ease: 'easeInOut' as const },
  },
  {
    id: 'cyan',
    gradient: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.12) 0%, rgba(6, 182, 212, 0.04) 50%, transparent 75%)',
    initial: { x: '50%', y: '-10%', scale: 1 },
    animate: { x: ['50%', '60%', '45%', '50%'], y: ['-10%', '0%', '-15%', '-10%'], scale: [1, 0.92, 1.05, 1] },
    width: '60vw',
    height: '60vh',
    transition: { duration: 22, repeat: Infinity, ease: 'easeInOut' as const, delay: 3 },
  },
  {
    id: 'pink',
    gradient: 'radial-gradient(ellipse at center, rgba(219, 39, 119, 0.1) 0%, rgba(219, 39, 119, 0.03) 50%, transparent 75%)',
    initial: { x: '30%', y: '60%', scale: 1 },
    animate: { x: ['30%', '25%', '38%', '30%'], y: ['60%', '55%', '65%', '60%'], scale: [1, 1.1, 0.98, 1] },
    width: '50vw',
    height: '50vh',
    transition: { duration: 26, repeat: Infinity, ease: 'easeInOut' as const, delay: 6 },
  },
]

export default function NebulaBackground() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1424 50%, #0a0e1a 100%)',
      }}
    >
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          initial={blob.initial}
          animate={prefersReducedMotion ? blob.initial : blob.animate}
          transition={blob.transition}
          style={{
            position: 'absolute',
            width: blob.width,
            height: blob.height,
            background: blob.gradient,
            borderRadius: '50%',
            filter: 'blur(40px)',
            willChange: 'transform',
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(124, 58, 237, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
