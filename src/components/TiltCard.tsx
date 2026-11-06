'use client'

import { useRef, useState } from 'react'

export default function TiltCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate percentage from center (-0.5 to 0.5)
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    // Adjust the multiplier (e.g., 15) to make the tilt stronger or weaker
    const tiltX = yPct * -15
    const tiltY = xPct * 15

    setRotation({ x: tiltX, y: tiltY })
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
    setIsHovering(false)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-100 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${
          isHovering ? 1.02 : 1
        }, ${isHovering ? 1.02 : 1}, 1)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  )
}