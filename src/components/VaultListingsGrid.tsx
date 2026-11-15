'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import type { Listing } from '@/lib/types'
import { ListingCard } from './ListingCard'

export default function VaultListingsGrid({ listings }: { listings: Listing[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing, index) => {
        const isDimmed = hoveredId !== null && hoveredId !== listing.id
        return (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 22 }}
            animate={{
              opacity: isDimmed ? 0.86 : 1,
              y: 0,
              scale: isDimmed ? 0.985 : 1,
            }}
            transition={{
              opacity: { duration: 0.22 },
              scale: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 0.42, delay: Math.min(index * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] },
            }}
            onMouseEnter={() => setHoveredId(listing.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="h-full"
          >
            <ListingCard listing={listing} priority={index < 4} />
          </motion.div>
        )
      })}
    </div>
  )
}
