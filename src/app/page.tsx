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
      items!inner ( id, name, category, grade, state, photos ) 
    `) 

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
      <header className="mb-14 text-center max-w-5xl mx-auto flex flex-col items-center">
        <div className="inline-block bg-[#D97706] text-white px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest font-bold mb-6 shadow-sm">
          Neighbourhood vault · Bengaluru
        </div>
        
        <h1 className="text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#0F172A] to-[#1E293B] leading-[1.1]">
          Idle goods, <br className="hidden md:block" /> held in trust.
        </h1>
        
        <p className="text-[#0F172A] mt-6 text-xl font-medium max-w-3xl mx-auto">
          Verified items. Escrow protected. Walk-to-vault. Rent durable goods
          from a trusted hub in your ward.
        </p>
      </header>

      <div className="max-w-4xl mx-auto mb-12 space-y-8">
        <form className="relative flex items-center w-full max-w-2xl mx-auto group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[#5C7FA8] group-focus-within:text-[#0F172A] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            name="search"
            defaultValue={search}
            placeholder="Search for an item (e.g. Camera)..."
            className="w-full border border-[#5C7FA8]/40 rounded-full pl-14 pr-36 py-5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 bg-white shadow-sm transition-all text-lg font-medium"
          />
          {category && <input type="hidden" name="category" value={category} />}
          
          <div className="absolute right-3">
            <button type="submit" className="bg-[#0F172A] text-white px-8 py-3 rounded-full font-bold hover:bg-[#1E293B] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 text-sm">
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center items-center gap-2">
          {categories.map((cat) => {
            const isActive = category === cat || (!category && cat === 'All')
            return (
              <Link
                key={cat}
                href={cat === 'All' ? (search ? `/?search=${search}` : '/') : `/?category=${cat}${search ? `&search=${search}` : ''}`}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${
                  isActive
                    ? 'bg-[#0F172A] text-white border-[#0F172A] scale-105'
                    : 'bg-white text-[#1E293B] border-[#5C7FA8]/30 hover:border-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                {cat}
              </Link>
            )
          })}
          
          {/* 👇 FIXED: Made it look like an actionable pill button 👇 */}
          {(search || (category && category !== 'All')) && (
            <Link 
              href="/" 
              className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#D97706] text-white border border-[#D97706] shadow-sm hover:bg-[#B45309] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ml-2"
            >
              Clear Filters
            </Link>
          )}
        </div>
      </div>

      {(!listings || listings.length === 0) ? (
        <div className="text-center py-24 bg-white/50 border border-[#5C7FA8]/20 rounded-3xl">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-[#0F172A] mb-2">No items found</h3>
          <p className="text-[#1E293B] font-medium mb-6">Try adjusting your search or category filter.</p>
          <Link href="/" className="bg-[#0F172A] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#1E293B] transition shadow-sm inline-block">
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(listings as unknown as Listing[]).map((listing, index) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              priority={index < 3} 
            />
          ))}
        </div>
      )}
    </main>
  )
}