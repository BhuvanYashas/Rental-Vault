import Link from 'next/link'
import type { Listing } from '@/lib/types'

export function ListingCard({ listing }: { listing: Listing }) {
  // 👇 This fixes the 3 TypeScript errors
  if (!listing.items) return null 

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group relative flex flex-col bg-white border border-[#5C7FA8] rounded-xl overflow-hidden hover:border-[#0F172A] hover:shadow-lg transition-all duration-200"
    >
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#0F172A] text-lg group-hover:text-[#D97706] transition-colors">
              {listing.items.name}
            </h3>
            <p className="text-xs text-[#1E293B] mt-1 font-medium">
              {listing.items.category}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#E2E8F0] text-[#0F172A]">
            {listing.items.grade}
          </span>
        </div>

        <div className="flex justify-between items-end mt-4 pt-4 border-t border-[#E2E8F0]">
          <div>
            <p className="text-lg font-bold text-[#0F172A]">
              ₹{listing.rate_per_day}
              <span className="text-xs font-normal text-[#1E293B]"> /day</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-[#1E293B]">
              Deposit ₹{listing.deposit}
            </p>
          </div>
        </div>
      </div>

      {/* Hover Button - hidden by default, slides up on hover */}
      <div className="px-5 pb-5 pt-0 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 ease-out">
        <div className="w-full bg-[#D97706] text-white text-center rounded-lg py-2.5 text-sm font-bold shadow-sm hover:bg-[#B45309]">
          Rent this item
        </div>
      </div>
    </Link>
  )
}