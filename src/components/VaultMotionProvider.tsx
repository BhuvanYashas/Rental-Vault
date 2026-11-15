'use client'

import { MotionConfig } from 'motion/react'

export default function VaultMotionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
