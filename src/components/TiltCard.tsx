'use client'

import { useRef, useState } from 'react'

export default function TiltCard({
  children,
  className = '',
  maxTilt = 6,
}: {
  children: React.ReactNode
  className?: string
  maxTilt?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState(
    'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)',
  )
  const [glare, setGlare] = useState({ x: 50, y: 20, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    const rotateY = (px - 0.5) * (maxTilt * 2)
    const rotateX = (0.5 - py) * (maxTilt * 2)

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0, -8px, 18px)`,
    )
    setGlare({ x: px * 100, y: py * 100, opacity: 0.42 })
  }

  function handleMouseEnter() {
    setIsHovered(true)
  }

  function handleMouseLeave() {
    setIsHovered(false)
    setTransform(
      'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)',
    )
    setGlare((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: isHovered
          ? 'transform 90ms ease-out'
          : 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`relative will-change-transform motion-reduce:!transform-none ${className}`}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 motion-reduce:hidden"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.1) 42%, transparent 70%)`,
        }}
      />
    </div>
  )
}