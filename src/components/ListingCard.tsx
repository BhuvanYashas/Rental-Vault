import Link from 'next/link'
import Image from 'next/image'
import type { Listing } from '@/lib/types'
import TiltCard from './TiltCard'

export function ListingCard({ 
  listing, 
  priority = false 
}: { 
  listing: Listing
  priority?: boolean 
}) {
  if (!listing.items) return null

  const photoUrl = listing.items.photos?.[0]
  
  // Cast to any to access the new columns we just added to the database
  const rating = (listing.items as any).average_rating
  const reviewCount = (listing.items as any).review_count

  return (
    <TiltCard className="h-full">
      <Link
        href={`/listing/${listing.id}`}
        className="group relative flex flex-col h-full bg-white border border-[#5C7FA8]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_0_25px_rgba(217,119,6,0.2)] hover:border-[#0F172A]/20 transition-all duration-300"
      >
        <div className="relative w-full h-48 overflow-hidden bg-[#F8FAFC]">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={listing.items.name}
              fill
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1]">
              <svg aria-hidden="true" className="w-12 h-12 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-[#0F172A] text-xl group-hover:text-[#D97706] transition-colors leading-tight">
                {listing.items.name}
              </h3>
              
              {/* 👇 ADDED THE STAR RATING BADGE HERE 👇 */}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-[#1E293B] font-bold tracking-wide uppercase">
                  {listing.items.category}
                </p>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-1 bg-[#FEF3C7] px-2 py-0.5 rounded text-[#B45309] text-xs font-bold">
                    <span>⭐</span>
                    <span>{rating}</span>
                    <span className="text-[10px] opacity-70">({reviewCount})</span>
                  </div>
                )}
              </div>

            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]">
              Grade {listing.items.grade}
            </span>
          </div>

          <div className="flex justify-between items-end mt-4 pt-4 border-t border-[#E2E8F0]/60">
            <div>
              <p className="text-2xl font-black text-[#0F172A]">
                ₹{listing.rate_per_day}
                <span className="text-sm font-semibold text-[#1E293B] ml-1">/day</span>
              </p>
            </div>
            <div className="text-right bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#1E293B] font-bold">Deposit</p>
              <p className="text-sm font-bold text-[#0F172A]">₹{listing.deposit}</p>
            </div>
          </div>
        </div>
      </Link>
    </TiltCard>
  )
}