import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { getFallbackItemPhoto, resolveItemPhotoUrl } from '@/lib/itemPhotos'
import VaultImage from './VaultImage'
import TiltCard from './TiltCard'

export function ListingCard({
  listing,
  priority = false,
}: {
  listing: Listing
  priority?: boolean
}) {
  if (!listing.items) return null

  const photoUrl = resolveItemPhotoUrl(
    listing.items.name,
    listing.items.category,
    listing.items.photos,
  )
  const fallbackPhotoUrl = getFallbackItemPhoto(
    listing.items.name,
    listing.items.category,
  )
  const rating = listing.items.average_rating ?? 0
  const reviewCount = listing.items.review_count ?? 0
  const isAvailable = listing.items.state === 'IN_VAULT'

  return (
    <TiltCard maxTilt={7} spotlightColor="rgba(249, 115, 22, 0.14)" borderGlow>
      <Link
        href={`/listing/${listing.id}`}
        style={{ transformStyle: 'preserve-3d' }}
        className="group relative flex flex-col h-full vault-title-card-3d rounded-3xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
      >
        {/* Top 3D Title Header Block */}
        <div
          style={{ transformStyle: 'preserve-3d' }}
          className="vault-title-header-3d px-5 pt-4 pb-4 text-white relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-[#93C5FD]/50 via-[#F97316] to-[#93C5FD]/50 opacity-75 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono tracking-wider mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="uppercase font-bold text-[#93C5FD] truncate">{listing.items.category}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-200 font-semibold shrink-0">Grade {listing.items.grade ?? 'A'}</span>
            </div>

            {reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 shrink-0 font-bold tabular-nums">
                <span
                  aria-label={isAvailable ? 'In Vault' : 'Rented'}
                  className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`}
                />
                <span className="inline-flex items-center gap-1 text-[#F97316]">
                  <Star className="w-3 h-3 fill-[#F97316] text-[#F97316]" aria-hidden="true" />
                  {rating} ({reviewCount})
                </span>
              </span>
            ) : (
              <span
                className={`text-[10px] font-mono uppercase tracking-widest font-bold shrink-0 ${
                  isAvailable ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isAvailable ? 'In Vault' : 'Rented'}
              </span>
            )}
          </div>

          <h3 className="vault-depth-1 font-extrabold text-white text-lg leading-snug tracking-tight group-hover:text-[#FBBF24] transition-colors line-clamp-1">
            {listing.items.name}
          </h3>
        </div>

        {/* Full-Bleed 4:3 Photo Stage */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 vault-stage-3d">
          <VaultImage
            src={photoUrl}
            fallbackSrc={fallbackPhotoUrl}
            alt={listing.items.name}
            fill
            priority={priority}
            className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />

          {!isAvailable && (
            <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-[#0F172A]/90 text-white border border-white/25 shadow-lg text-xs font-mono font-bold px-3.5 py-1.5 rounded-full tracking-wide uppercase">
                {listing.items.state === 'RENTED' ? 'Currently Rented' : listing.items.state}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Pricing & Action Strip */}
        <div
          style={{ transformStyle: 'preserve-3d' }}
          className="px-5 py-4 mt-auto flex items-center justify-between gap-3 bg-gradient-to-b from-[#F8FBFF] to-[#E4EEF9] border-t border-white/95"
        >
          <div className="vault-depth-1">
            <p className="text-lg font-black text-[#0F172A] tabular-nums leading-none">
              ₹{listing.rate_per_day.toLocaleString('en-IN')}
              <span className="text-xs font-medium text-slate-500 ml-1">/day</span>
            </p>
            <p className="text-[11px] font-semibold text-slate-600 mt-1 tabular-nums">
              Deposit ₹{listing.deposit.toLocaleString('en-IN')}
            </p>
          </div>

          <span className="vault-depth-2 inline-flex items-center gap-1.5 vault-btn-amber-3d text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0">
            <span>{isAvailable ? 'Rent' : 'View'}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </TiltCard>
  )
}