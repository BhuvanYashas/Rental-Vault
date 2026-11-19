'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'

export default function TiltCard({
  children,
  className = '',
  maxTilt = 7,
  spotlightColor = 'rgba(249, 115, 22, 0.14)',
  borderGlow = true,
}: {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  spotlightColor?: string
  borderGlow?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)

  const pointerX = useMotionValue(0.5)
  const pointerY = useMotionValue(0.5)

  const springConfig = { stiffness: 260, damping: 24, mass: 0.6 }
  const smoothX = useSpring(pointerX, springConfig)
  const smoothY = useSpring(pointerY, springConfig)

  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt])
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt])

  const spotX = useTransform(smoothX, (v) => `${(v * 100).toFixed(1)}%`)
  const spotY = useTransform(smoothY, (v) => `${(v * 100).toFixed(1)}%`)

  const spotlightBg = useMotionTemplate`radial-gradient(360px circle at ${spotX} ${spotY}, ${spotlightColor}, transparent 72%)`

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const nx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const ny = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    pointerX.set(nx)
    pointerY.set(ny)
  }

  function handleMouseEnter() {
    if (prefersReducedMotion) return
    setIsHovered(true)
  }

  function handleMouseLeave() {
    setIsHovered(false)
    pointerX.set(0.5)
    pointerY.set(0.5)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px' }}
      className={`relative h-full ${className}`}
    >
      <motion.div
        style={
          prefersReducedMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }
        }
        animate={
          prefersReducedMotion
            ? undefined
            : {
                y: isHovered ? -4 : 0,
              }
        }
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full will-change-transform"
      >
        {children}

        {!prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            style={{ background: spotlightBg }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 rounded-3xl z-20"
          />
        )}

        {borderGlow && !prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/60 z-20"
          />
        )}
      </motion.div>
    </div>
  )
}