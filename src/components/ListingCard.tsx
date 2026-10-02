import Link from 'next/link'
import type { Listing } from '@/lib/types'

export function ListingCard({ listing }: { listing: Listing }) {
  const item = listing.items
  if (!item) return null

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="block border border-neutral-200 rounded-xl p-5 bg-white hover:border-amber-400 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-neutral-900">{item.name}</h3>
        <span className="text-xs font-mono px-2 py-1 rounded bg-neutral-100 text-neutral-700">
          {item.grade}
        </span>
      </div>

      <p className="text-sm text-neutral-500 mb-4">{item.category}</p>

      <div className="flex items-baseline justify-between">
        <span className="text-lg font-semibold text-neutral-900">
          ₹{listing.rate_per_day}
          <span className="text-xs font-normal text-neutral-500"> /day</span>
        </span>
        <span className="text-xs text-neutral-500">
          Deposit ₹{listing.deposit}
        </span>
      </div>
    </Link>
  )
}