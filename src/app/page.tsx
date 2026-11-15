import Link from 'next/link'
import { createClient, hasSupabaseEnv } from '@/lib/supabase/server'
import { ListingCard } from '@/components/ListingCard'
import TiltCard from '@/components/TiltCard'
import type { Listing } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const { category, search } = await searchParams

  let listings: Listing[] = []
  let categories: string[] = ['All']

  if (hasSupabaseEnv()) {
    const supabase = await createClient()

    let query = supabase
      .from('listings')
      .select(`
        id, item_id, rate_per_day, deposit, active,
        items!inner ( id, owner_id, name, category, serial_number, grade, state, photos, average_rating, review_count, created_at )
      `)
      .eq('active', true)

    if (category && category !== 'All') {
      query = query.eq('items.category', category)
    }

    if (search) {
      query = query.ilike('items.name', `%${search}%`)
    }

    const { data: listingsData } = await query.order('created_at', { ascending: false })
    listings = (listingsData as unknown as Listing[]) ?? []

    const { data: categoryData } = await supabase
      .from('items')
      .select('category, listings!inner(active)')
      .eq('listings.active', true)
      .order('category')

    categories = [
      'All',
      ...Array.from(new Set(categoryData?.map((c) => c.category).filter(Boolean))),
    ] as string[]
  }

  const hasFilters = Boolean(search || (category && category !== 'All'))

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14">
      <header className="mb-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-b from-[#F97316] to-[#EA580C] text-white text-[11px] font-mono uppercase tracking-[0.18em] font-bold mb-5 shadow-[0_6px_18px_-4px_rgba(234,88,12,0.6),0_3px_0_0_#9A3412,inset_0_1px_0_rgba(255,255,255,0.35)]">
          Neighbourhood Vault · Bengaluru
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.08] text-balance drop-shadow-[0_2px_0_rgba(255,255,255,0.28)]">
          Idle goods, held in trust.
        </h1>

        <p className="text-[#0F172A]/85 mt-4 text-base md:text-lg font-semibold max-w-2xl mx-auto leading-relaxed">
          Verified items. Escrow protected. Walk-to-vault. Rent durable goods from a trusted hub in your ward.
        </p>
      </header>

      <section className="max-w-4xl mx-auto mb-10 space-y-5">
        <form className="relative flex items-center w-full max-w-2xl mx-auto group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0F172A] transition-colors z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search verified gear (e.g. DSLR Camera, Bosch Drill)..."
            className="w-full rounded-2xl pl-13 pr-32 py-4 text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0F172A]/15 bg-white border border-white/90 border-b-[3px] border-b-slate-300 shadow-[0_18px_36px_-12px_rgba(15,23,42,0.35),0_4px_10px_-2px_rgba(15,23,42,0.14)] transition-all text-base font-medium"
          />
          {category && <input type="hidden" name="category" value={category} />}

          <button
            type="submit"
            className="absolute right-2 vault-btn-navy-3d text-white px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap justify-center items-center gap-2.5">
          {categories.map((cat) => {
            const isActive = category === cat || (!category && cat === 'All')
            const href =
              cat === 'All'
                ? search
                  ? `/?search=${encodeURIComponent(search)}`
                  : '/'
                : `/?category=${encodeURIComponent(cat)}${search ? `&search=${encodeURIComponent(search)}` : ''}`

            return (
              <Link
                key={cat}
                href={href}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'vault-btn-navy-3d text-white'
                    : 'bg-white/95 text-[#0F172A] border border-white/90 border-b-2 border-b-slate-300 shadow-[0_6px_14px_-4px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 hover:bg-white'
                }`}
              >
                {cat}
              </Link>
            )
          })}

          {hasFilters && (
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-[#EA580C] text-white shadow-[0_3px_0_0_#9A3412] hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              Reset filters
            </Link>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        <TiltCard maxTilt={4}>
          <div className="vault-card-3d rounded-2xl p-5 flex items-start gap-3.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#020617,inset_0_1px_0_rgba(255,255,255,0.2)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0F172A]">Photo-Graded Custody</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Condition verified at intake and return by vault operators.
              </p>
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={4}>
          <div className="vault-card-3d rounded-2xl p-5 flex items-start gap-3.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#F97316] to-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#9A3412,inset_0_1px_0_rgba(255,255,255,0.35)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0F172A]">Escrow-Protected Deposit</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Security deposits held safely until verified return.
              </p>
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={4}>
          <div className="vault-card-3d rounded-2xl p-5 flex items-start gap-3.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#065F46,inset_0_1px_0_rgba(255,255,255,0.35)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0F172A]">Walk-to-Vault Pickup</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Instant handoff and claim mediation at local hubs.
              </p>
            </div>
          </div>
        </TiltCard>
      </section>

      {!listings || listings.length === 0 ? (
        <div className="text-center py-20 vault-card-3d rounded-3xl max-w-3xl mx-auto px-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mx-auto mb-4 shadow-[0_4px_0_0_#020617]">
            <svg className="w-7 h-7 text-[#F97316]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-[#0F172A] mb-1.5">No items found</h3>
          <p className="text-slate-600 text-sm font-medium mb-6 max-w-md mx-auto">
            {hasFilters
              ? 'Try adjusting your search or clearing the active category filter.'
              : 'No verified items are currently listed in this vault.'}
          </p>
          {hasFilters && (
            <Link
              href="/"
              className="vault-btn-navy-3d text-white px-5 py-2.5 rounded-xl text-sm font-bold inline-block"
            >
              Clear all filters
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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