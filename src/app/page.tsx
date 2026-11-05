import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/ListingCard'
import type { Listing } from '@/lib/types'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createClient()

  // Build the query
  let query = supabase
    .from('listings')
    .select(`
      id, rate_per_day, deposit, active,
      items!inner ( id, name, category, grade, state )
    `)
    .eq('active', true)

  // Apply filter if a category is selected
  if (category && category !== 'All') {
    query = query.eq('items.category', category)
  }

  const { data: listings, error } = await query.order('created_at', { ascending: false })

  // We need to fetch all categories to build the filter bar
  const { data: categoryData } = await supabase
    .from('items')
    .select('category')
    .order('category')
  
  // Get unique categories
  const categories = ['All', ...Array.from(new Set(categoryData?.map((c) => c.category).filter(Boolean)))] as string[]

  if (error) {
    return (
      <main className="max-w-5xl mx-auto p-8">
        <p className="text-red-700 font-mono text-sm font-bold">
          Failed to load listings: {error.message}
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <header className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] mb-2 font-bold">
          Neighbourhood vault · Bengaluru
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">
          Idle goods, held in trust.
        </h1>
        <p className="text-[#1E293B] mt-3 max-w-xl font-medium">
          Verified items. Escrow protected. Walk-to-vault. Rent durable goods
          from a trusted hub in your ward — or earn from what you already own.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => {
          const isActive = category === cat || (!category && cat === 'All')
          return (
            <Link
              key={cat}
              href={cat === 'All' ? '/' : `/?category=${cat}`}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                isActive
                  ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md'
                  : 'bg-white text-[#0F172A] border-[#5C7FA8] hover:border-[#0F172A]'
              }`}
            >
              {cat}
            </Link>
          )
        })}
      </div>

      {(!listings || listings.length === 0) ? (
        <div className="text-center py-20 bg-white border border-[#5C7FA8] rounded-xl">
          <p className="text-[#1E293B] font-medium">No listings found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(listings as unknown as Listing[]).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  )
}