'use client'

import { Camera, MapPin, ShieldCheck } from 'lucide-react'
import TiltCard from './TiltCard'

const PILLARS = [
  {
    title: 'Photo-Graded Custody',
    desc: 'Condition verified at intake and return by vault operators.',
    iconBg: 'bg-[#0F172A]',
    spotlight: 'rgba(15, 23, 42, 0.08)',
    icon: Camera,
  },
  {
    title: 'Escrow-Protected Deposit',
    desc: 'Security deposits held safely until verified return.',
    iconBg: 'bg-[#EA580C]',
    spotlight: 'rgba(234, 88, 12, 0.12)',
    icon: ShieldCheck,
  },
  {
    title: 'Walk-to-Vault Pickup',
    desc: 'Instant handoff and claim mediation at local hubs.',
    iconBg: 'bg-emerald-600',
    spotlight: 'rgba(16, 185, 129, 0.1)',
    icon: MapPin,
  },
]

export default function VaultTrustPillars() {
  return (
    <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
      {PILLARS.map((pillar) => {
        const Icon = pillar.icon
        return (
          <TiltCard
            key={pillar.title}
            maxTilt={5}
            spotlightColor={pillar.spotlight}
            borderGlow
          >
            <div
              style={{ transformStyle: 'preserve-3d' }}
              className="vault-card-3d rounded-3xl p-5 flex items-center gap-4 h-full"
            >
              <div
                className={`vault-depth-1 w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-sm ${pillar.iconBg}`}
              >
                <Icon className="w-5 h-5 stroke-[2]" aria-hidden="true" />
              </div>
              <div className="vault-depth-1">
                <p className="text-sm font-extrabold text-[#0F172A] tracking-tight">{pillar.title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                  {pillar.desc}
                </p>
              </div>
            </div>
          </TiltCard>
        )
      })}
    </section>
  )
}
