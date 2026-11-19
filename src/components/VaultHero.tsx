'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

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
      <motion.p
        initial={false}
        animate={{ y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block mb-4 text-[11px] font-mono font-bold tracking-[0.18em] uppercase vault-btn-amber-3d text-white px-4 py-1.5 rounded-full"
      >
        Neighbourhood Vault · Bengaluru
      </motion.p>

      <motion.h1
        initial={false}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.1] text-balance"
      >
        Idle goods, held in trust.
      </motion.h1>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 text-sm md:text-base font-medium text-[#0F172A]/85 max-w-3xl mx-auto leading-relaxed">
        <div className="relative h-7 overflow-hidden inline-flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={SWAP_PHRASES[phraseIndex]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative inline-block font-bold text-[#0F172A] whitespace-nowrap pb-0.5"
            >
              {SWAP_PHRASES[phraseIndex]}
              <motion.span
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ originX: 0 }}
                className="absolute inset-x-0 bottom-0 h-[2px] bg-[#EA580C] rounded-full"
              />
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-[#0F172A]/85">
          Rent durable goods from a trusted hub in your ward.
        </span>
      </div>
    </header>
  )
}
