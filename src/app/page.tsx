import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/ListingCard'
import type { Listing } from '@/lib/types'

export default async function Home() {
  const supabase = await createClient()

  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      id,
      rate_per_day,
      deposit,
      active,
      items (
        id,
        name,
        category,
        grade,
        state
      )
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="max-w-5xl mx-auto p-8">
        <p className="text-red-600 font-mono text-sm">
          Failed to load listings: {error.message}
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <header className="mb-10 flex items-start justify-between">
  <div>
    <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
      Rental Vault
    </h1>
    <p className="text-neutral-500 mt-2">
      Verified items. Escrow protected. Walk-to-vault.
    </p>
  </div>
  <Link
    href="/my-rentals"
    className="text-sm font-medium bg-neutral-900 text-white rounded-lg px-4 py-2 hover:bg-neutral-800 transition"
  >
    My Rentals
  </Link>
</header>

      {(!listings || listings.length === 0) ? (
        <div className="text-center py-20 text-neutral-400">
          <p>No listings yet.</p>
          <p className="text-sm mt-2">
            Insert a row into the <code>listings</code> table to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(listings as Listing[]).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  )
}