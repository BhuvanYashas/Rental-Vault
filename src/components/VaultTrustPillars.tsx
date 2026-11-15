'use client'

import { motion } from 'motion/react'
import TiltCard from './TiltCard'

const PILLARS = [
  {
    title: 'Photo-Graded Custody',
    desc: 'Condition verified at intake and return by vault operators.',
    iconBg: 'bg-gradient-to-b from-[#1E293B] to-[#0F172A] shadow-[0_4px_0_0_#020617,inset_0_1px_0_rgba(255,255,255,0.2)]',
    spotlight: 'rgba(59, 130, 246, 0.22)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Escrow-Protected Deposit',
    desc: 'Security deposits held safely until verified return.',
    iconBg: 'bg-gradient-to-b from-[#F97316] to-[#EA580C] shadow-[0_4px_0_0_#9A3412,inset_0_1px_0_rgba(255,255,255,0.35)]',
    spotlight: 'rgba(249, 115, 22, 0.24)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Walk-to-Vault Pickup',
    desc: 'Instant handoff and claim mediation at local hubs.',
    iconBg: 'bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_4px_0_0_#065F46,inset_0_1px_0_rgba(255,255,255,0.35)]',
    spotlight: 'rgba(16, 185, 129, 0.22)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function VaultTrustPillars() {
  return (
    <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
      {PILLARS.map((pillar, index) => (
        <motion.div
          key={pillar.title}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.42,
            delay: index * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <TiltCard maxTilt={6} spotlightColor={pillar.spotlight}>
            <div
              style={{ transformStyle: 'preserve-3d' }}
              className="vault-card-3d rounded-3xl p-5 flex items-start gap-3.5 h-full"
            >
              <div
                className={`vault-depth-1 w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 ${pillar.iconBg}`}
              >
                {pillar.icon}
              </div>
              <div className="vault-depth-1">
                <p className="text-sm font-extrabold text-[#0F172A]">{pillar.title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                  {pillar.desc}
                </p>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      ))}
    </section>
  )
}
