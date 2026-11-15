'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from 'motion/react'

export default function TiltCard({
  children,
  className = '',
  maxTilt = 7,
  spotlightColor = 'rgba(249, 115, 22, 0.22)',
  borderGlow = true,
}: {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  spotlightColor?: string
  borderGlow?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(25)
  const mousePxX = useMotionValue(160)
  const mousePxY = useMotionValue(100)

  const springConfig = { stiffness: 280, damping: 24, mass: 0.65 }
  const rotateX = useSpring(rawRotateX, springConfig)
  const rotateY = useSpring(rawRotateY, springConfig)

  const glareBg = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, rgba(255, 255, 255, 0.42), ${spotlightColor} 38%, transparent 72%)`
  const borderBg = useMotionTemplate`radial-gradient(240px circle at ${mousePxX}px ${mousePxY}px, rgba(249, 115, 22, 0.85), rgba(147, 197, 253, 0.45) 55%, transparent 80%)`

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const px = relX / rect.width
    const py = relY / rect.height

    rawRotateY.set((px - 0.5) * (maxTilt * 2))
    rawRotateX.set((0.5 - py) * (maxTilt * 2))
    mouseX.set(px * 100)
    mouseY.set(py * 100)
    mousePxX.set(relX)
    mousePxY.set(relY)
  }

  function handleMouseEnter() {
    setIsHovered(true)
  }

  function handleMouseLeave() {
    setIsHovered(false)
    rawRotateX.set(0)
    rawRotateY.set(0)
  }

  return (
    <div style={{ perspective: '1100px' }} className={`relative ${className}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: isHovered ? -7 : 0,
          scale: isHovered ? 1.012 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 320,
          damping: 26,
        }}
        className="relative h-full will-change-transform rounded-3xl"
      >
        {borderGlow && (
          <motion.div
            aria-hidden="true"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: borderBg }}
            className="pointer-events-none -inset-[1.5px] absolute rounded-[25px] z-0 motion-reduce:hidden"
          />
        )}

        <div style={{ transformStyle: 'preserve-3d' }} className="relative z-10 h-full">
          {children}
        </div>

        <motion.div
          aria-hidden="true"
          animate={{ opacity: isHovered ? 0.85 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ background: glareBg }}
          className="pointer-events-none absolute inset-0 rounded-3xl z-20 mix-blend-overlay motion-reduce:hidden"
        />
      </motion.div>
    </div>
  )
}