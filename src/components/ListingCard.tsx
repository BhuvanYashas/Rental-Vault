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
    <TiltCard className="h-full" maxTilt={8}>
      <Link
        href={`/listing/${listing.id}`}
        style={{ transformStyle: 'preserve-3d' }}
        className="group relative flex flex-col h-full vault-title-card-3d rounded-3xl overflow-hidden hover:shadow-[0_32px_56px_-14px_rgba(15,23,42,0.52)] transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
      >
        {/* Top 3D Title Card Header Plate */}
        <div className="vault-title-header-3d px-5 pt-5 pb-4 text-white relative">
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono tracking-wider mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="uppercase font-bold text-[#93C5FD] truncate">{listing.items.category}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300 shrink-0">Grade {listing.items.grade ?? 'A'}</span>
            </div>
            {reviewCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[#FB923C] font-bold tabular-nums shrink-0">
                <svg className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating} ({reviewCount})
              </span>
            )}
          </div>

          <h3 className="vault-depth-1 font-extrabold text-white text-xl leading-snug tracking-tight group-hover:text-[#FB923C] transition-colors line-clamp-1">
            {listing.items.name}
          </h3>
        </div>

        {/* Middle Full-Fitted 3D Photo Stage */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 vault-stage-3d">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={listing.items.name}
              fill
              priority={priority}
              referrerPolicy="no-referrer"
              className="object-cover group-hover:scale-[1.05] transition-transform duration-300 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#DBE7F5] via-slate-100 to-[#C8DAEE] text-[#334155] gap-2">
              <div className="w-12 h-12 rounded-xl bg-white/85 shadow-[0_4px_0_0_#CBD5E1] flex items-center justify-center text-[#0F172A]">
                <svg aria-hidden="true" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-600">{listing.items.category}</span>
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-[1.5px] flex items-center justify-center">
              <span className="bg-[#0F172A]/95 text-white text-xs font-mono font-semibold px-3 py-1.5 rounded-lg tracking-wide uppercase shadow-[0_4px_0_0_#020617]">
                {listing.items.state === 'RENTED' ? 'Currently Rented' : listing.items.state}
              </span>
            </div>
          )}
        </div>

        {/* Bottom 3D Pricing & Action Bar */}
        <div className="px-5 py-4 mt-auto flex items-center justify-between gap-3 bg-gradient-to-b from-[#F4F8FD] to-[#E2ECF8] border-t border-white/90">
          <div>
            <p className="text-xl font-black text-[#0F172A] tabular-nums leading-none">
              ₹{listing.rate_per_day.toLocaleString('en-IN')}
              <span className="text-xs font-semibold text-slate-500 ml-1">/day</span>
            </p>
            <p className="text-[11px] font-semibold text-slate-600 mt-1.5 tabular-nums">
              Deposit <span className="font-bold text-[#0F172A]">₹{listing.deposit.toLocaleString('en-IN')}</span>
            </p>
          </div>

          <span className="vault-depth-2 inline-flex items-center gap-1 vault-btn-amber-3d text-white px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0">
            <span>{isAvailable ? 'Rent' : 'View'}</span>
            <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </div>
      </Link>
    </TiltCard>
  )
}