import Link from 'next/link'
import type { Listing } from '@/lib/types'
import TiltCard from './TiltCard'

export function ListingCard({ listing }: { listing: Listing }) {
  if (!listing.items) return null

  return (
    <TiltCard className="h-full">
      <Link
        href={`/listing/${listing.id}`}
        className="group relative flex flex-col h-full bg-white border border-[#5C7FA8]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0F172A]/20 transition-all duration-300"
        style={{ transform: 'translateZ(20px)' }} // Creates the 3D depth for inner elements
      >
        <div className="p-6 flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-[#0F172A] text-xl group-hover:text-[#D97706] transition-colors leading-tight">
                {listing.items.name}
              </h3>
              <p className="text-xs text-[#1E293B] mt-1 font-bold tracking-wide uppercase">
                {listing.items.category}
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]">
              Grade {listing.items.grade}
            </span>
          </div>

          <div className="flex justify-between items-end mt-6 pt-5 border-t border-[#E2E8F0]/60">
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

        {/* Hover Button - slides up on hover */}
        <div className="px-6 pb-6 pt-0 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="w-full bg-[#D97706] text-white text-center rounded-xl py-3 text-sm font-bold shadow-md hover:bg-[#B45309] transition-colors">
            Rent this item
          </div>
        </div>
      </Link>
    </TiltCard>
  )
}