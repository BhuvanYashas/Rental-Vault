'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const HEADLINE_WORDS = ['Idle', 'goods,', 'held', 'in', 'trust.']

const SWAP_PHRASES = [
  'Photo-graded custody.',
  'Escrow-protected deposits.',
  'Walk-to-vault pickup.',
  'Serial-verified gear.',
]

export default function VaultHero() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % SWAP_PHRASES.length)
    }, 2800)
    return () => window.clearInterval(id)
  }, [])

  return (
    <header className="mb-8 text-center max-w-4xl mx-auto">
      {/* Aceternity Moving Border Badge */}
      <div className="relative inline-flex p-[1.5px] rounded-full overflow-hidden mb-4 shadow-[0_10px_24px_-6px_rgba(234,88,12,0.55),0_4px_0_0_#9A3412]">
        <span
          aria-hidden="true"
          className="vault-moving-border-beam pointer-events-none"
        />
        <span className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-b from-[#F97316] to-[#EA580C] text-white text-[11px] font-mono uppercase tracking-[0.18em] font-bold">
          <span>Neighbourhood Vault · Bengaluru</span>
        </span>
      </div>

      {/* Componentry Kinetic Text Reveal */}
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.08] text-balance drop-shadow-[0_2px_0_rgba(255,255,255,0.28)]">
        {HEADLINE_WORDS.map((word, idx) => (
          <span
            key={word + idx}
            className="inline-block mr-[0.24em] last:mr-0"
          >
            {word}
          </span>
        ))}
      </h1>

      {/* Componentry Flipping Word Swap + Subheading */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 text-base md:text-lg font-semibold text-[#0F172A]/90 max-w-3xl mx-auto leading-relaxed">
        <div className="relative h-7 overflow-hidden inline-flex items-center justify-center min-w-[230px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={SWAP_PHRASES[phraseIndex]}
              initial={{ opacity: 0, y: 14, rotateX: -35 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -14, rotateX: 35 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="font-extrabold text-[#0F172A] underline decoration-[#EA580C] decoration-2 underline-offset-4 whitespace-nowrap"
            >
              {SWAP_PHRASES[phraseIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-[#0F172A]/80">
          Rent durable goods from a trusted hub in your ward.
        </span>
      </div>
    </header>
  )
}
