import Link from 'next/link'
import Image from 'next/image'
import type { Listing } from '@/lib/types'
import TiltCard from './TiltCard'

export function ListingCard({
  listing,
  priority = false,
}: {
  listing: Listing
  priority?: boolean
}) {
  if (!listing.items) return null

  const photoUrl = listing.items.photos?.[0]
  const rating = listing.items.average_rating ?? 0
  const reviewCount = listing.items.review_count ?? 0
  const isAvailable = listing.items.state === 'IN_VAULT'

  return (
    <TiltCard className="h-full" maxTilt={6}>
      <Link
        href={`/listing/${listing.id}`}
        className="group relative flex flex-col h-full vault-card-3d rounded-2xl overflow-hidden hover:shadow-[0_26px_48px_-12px_rgba(15,23,42,0.42)] transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 border-b border-slate-200/80">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={listing.items.name}
              fill
              priority={priority}
              className="object-cover group-hover:scale-[1.04] transition-transform duration-300 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#DBE7F5] via-slate-100 to-[#C8DAEE] text-[#334155] gap-2">
              <div className="w-12 h-12 rounded-xl bg-white/80 shadow-sm flex items-center justify-center text-[#0F172A]">
                <svg aria-hidden="true" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-600">{listing.items.category}</span>
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-[#0F172A]/95 text-white text-xs font-mono font-semibold px-3 py-1.5 rounded-md tracking-wide uppercase shadow-md">
                {listing.items.state === 'RENTED' ? 'Currently Rented' : listing.items.state}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
              <span className="uppercase tracking-wider font-semibold text-[#0F172A]/75">{listing.items.category}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-700">Grade {listing.items.grade ?? 'A'}</span>
              {reviewCount > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-[#C2410C] font-semibold tabular-nums">
                    <svg className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {rating} ({reviewCount})
                  </span>
                </>
              )}
            </div>

            <h3 className="font-bold text-[#0F172A] text-lg leading-snug group-hover:text-[#EA580C] transition-colors line-clamp-1">
              {listing.items.name}
            </h3>
          </div>

          <div className="flex items-baseline justify-between pt-3.5 border-t border-slate-100">
            <p className="text-xl font-extrabold text-[#0F172A] tabular-nums">
              ₹{listing.rate_per_day}
              <span className="text-xs font-semibold text-slate-500 ml-1">/day</span>
            </p>
            <p className="text-xs font-medium text-slate-600 tabular-nums">
              Deposit <span className="font-bold text-[#0F172A]">₹{listing.deposit}</span>
            </p>
          </div>
        </div>
      </Link>
    </TiltCard>
  )
}