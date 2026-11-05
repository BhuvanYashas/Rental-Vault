import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/ListingCard'
import type { Listing } from '@/lib/types'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const { category, search } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select(`
      id, rate_per_day, deposit, active,
      items!inner ( id, name, category, grade, state )
    `)
    .eq('active', true)

  if (category && category !== 'All') {
    query = query.eq('items.category', category)
  }

  if (search) {
    query = query.ilike('items.name', `%${search}%`)
  }

  const { data: listings, error } = await query.order('created_at', { ascending: false })

  const { data: categoryData } = await supabase
    .from('items')
    .select('category')
    .order('category')
  
  const categories = ['All', ...Array.from(new Set(categoryData?.map((c) => c.category).filter(Boolean)))] as string[]

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

      {/* Toolbar: Search + Filters */}
      <div className="space-y-4 mb-8">
        <form className="flex gap-2">
          <input 
            type="text" 
            name="search"
            defaultValue={search}
            placeholder="Search for an item (e.g. Camera)..."
            className="w-full md:w-96 border border-[#5C7FA8] rounded-full px-5 py-2.5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A] bg-white shadow-sm"
          />
          {category && <input type="hidden" name="category" value={category} />}
          <button type="submit" className="bg-[#0F172A] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#1E293B] transition shadow-sm">
            Search
          </button>
          {(search || category) && (
            <Link href="/" className="px-4 py-2.5 text-[#1E293B] font-bold hover:text-[#D97706] transition flex items-center">
              Clear
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = category === cat || (!category && cat === 'All')
            return (
              <Link
                key={cat}
                href={cat === 'All' ? (search ? `/?search=${search}` : '/') : `/?category=${cat}${search ? `&search=${search}` : ''}`}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md'
                    : 'bg-white text-[#1E293B] border-[#5C7FA8] hover:border-[#0F172A]'
                }`}
              >
                {cat}
              </Link>
            )
          })}
        </div>
      </div>

      {(!listings || listings.length === 0) ? (
        <div className="text-center py-20 bg-white border border-[#5C7FA8] rounded-xl shadow-sm">
          <p className="text-[#0F172A] font-bold text-lg mb-1">No results found</p>
          <p className="text-[#1E293B] font-medium mb-4">Try a different search or category.</p>
          <Link href="/" className="text-[#D97706] font-bold hover:underline">Clear all filters</Link>
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