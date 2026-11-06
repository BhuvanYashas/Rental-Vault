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
    <main className="max-w-6xl mx-auto p-8">
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] mb-3 font-bold">
          Neighbourhood vault · Bengaluru
        </p>
        <h1 className="text-5xl font-black tracking-tight text-[#0F172A] leading-tight">
          Idle goods, held in trust.
        </h1>
        <p className="text-[#1E293B] mt-4 text-lg font-medium">
          Verified items. Escrow protected. Walk-to-vault. Rent durable goods
          from a trusted hub in your ward.
        </p>
      </header>

      {/* Modern Search & Filter Bar */}
      <div className="max-w-4xl mx-auto mb-12 space-y-6">
        
        {/* Search Input */}
        <form className="relative flex items-center w-full max-w-xl mx-auto group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#5C7FA8] group-focus-within:text-[#0F172A] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            name="search"
            defaultValue={search}
            placeholder="Search for an item (e.g. Camera)..."
            className="w-full border border-[#5C7FA8]/40 rounded-full pl-12 pr-32 py-4 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 bg-white shadow-sm transition-all text-lg font-medium"
          />
          {category && <input type="hidden" name="category" value={category} />}
          
          <div className="absolute right-2">
            <button type="submit" className="bg-[#0F172A] text-white px-6 py-2 rounded-full font-bold hover:bg-[#1E293B] transition shadow-sm text-sm">
              Search
            </button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const isActive = category === cat || (!category && cat === 'All')
            return (
              <Link
                key={cat}
                href={cat === 'All' ? (search ? `/?search=${search}` : '/') : `/?category=${cat}${search ? `&search=${search}` : ''}`}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all border shadow-sm ${
                  isActive
                    ? 'bg-[#0F172A] text-white border-[#0F172A] scale-105'
                    : 'bg-white text-[#1E293B] border-[#5C7FA8]/30 hover:border-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                {cat}
              </Link>
            )
          })}
          {(search || (category && category !== 'All')) && (
            <Link href="/" className="px-5 py-2 rounded-full text-sm font-bold text-[#D97706] hover:bg-[#D97706]/10 transition-all border border-transparent">
              Clear Filters
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      {(!listings || listings.length === 0) ? (
        <div className="text-center py-24 bg-white/50 border border-[#5C7FA8]/20 rounded-3xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-[#0F172A] mb-2">No items found</h3>
          <p className="text-[#1E293B] font-medium mb-6">Try adjusting your search or category filter.</p>
          <Link href="/" className="bg-[#0F172A] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#1E293B] transition shadow-sm inline-block">
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(listings as unknown as Listing[]).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  )
}