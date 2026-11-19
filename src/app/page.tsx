import Link from 'next/link'
import { Package, Search } from 'lucide-react'
import { createClient, hasSupabaseEnv } from '@/lib/supabase/server'
import VaultHero from '@/components/VaultHero'
import VaultTrustPillars from '@/components/VaultTrustPillars'
import VaultListingsGrid from '@/components/VaultListingsGrid'
import { getPreviewListings } from '@/lib/mockCatalog'
import type { Listing } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; available?: string; sort?: string }>
}) {
  const { category, search, available, sort } = await searchParams
  const onlyAvailable = available === '1'
  const activeSort = sort || 'newest'

  let listings: Listing[] = []
  let categories: string[] = ['All']

  if (hasSupabaseEnv()) {
    const supabase = await createClient()

    let query = supabase
      .from('listings')
      .select(`
        id, item_id, rate_per_day, deposit, active,
        items!inner ( id, owner_id, name, category, grade, state, photos, average_rating, review_count, created_at )
      `)
      .eq('active', true)

    if (category && category !== 'All') {
      query = query.eq('items.category', category)
    }

    if (search) {
      query = query.ilike('items.name', `%${search}%`)
    }

    if (onlyAvailable) {
      query = query.eq('items.state', 'IN_VAULT')
    }

    if (activeSort === 'price_asc') {
      query = query.order('rate_per_day', { ascending: true })
    } else if (activeSort === 'price_desc') {
      query = query.order('rate_per_day', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: listingsData } = await query
    listings = (listingsData as unknown as Listing[]) ?? []

    if (activeSort === 'top_rated') {
      listings = [...listings].sort((a, b) => {
        const ratingDiff = (b.items?.average_rating ?? 0) - (a.items?.average_rating ?? 0)
        if (ratingDiff !== 0) return ratingDiff
        return (b.items?.review_count ?? 0) - (a.items?.review_count ?? 0)
      })
    }

    const { data: categoryData } = await supabase
      .from('items')
      .select('category, listings!inner(active)')
      .eq('listings.active', true)
      .order('category')

    categories = [
      'All',
      ...Array.from(new Set(categoryData?.map((c) => c.category).filter(Boolean))),
    ] as string[]
  } else {
    const preview = getPreviewListings({
      category,
      search,
      onlyAvailable,
      sort: activeSort,
    })
    listings = preview.listings
    categories = preview.categories
  }

  const hasFilters = Boolean(search || (category && category !== 'All') || onlyAvailable || (sort && sort !== 'newest'))
  const availableCount = listings.filter((l) => l.items?.state === 'IN_VAULT').length
  const totalReviews = listings.reduce((sum, l) => sum + (l.items?.review_count ?? 0), 0)

  function buildFilterHref(overrides: { category?: string; available?: string; sort?: string; search?: string }) {
    const params = new URLSearchParams()
    const nextCategory = overrides.category !== undefined ? overrides.category : category
    const nextAvailable = overrides.available !== undefined ? overrides.available : available
    const nextSort = overrides.sort !== undefined ? overrides.sort : sort
    const nextSearch = overrides.search !== undefined ? overrides.search : search

    if (nextCategory && nextCategory !== 'All') params.set('category', nextCategory)
    if (nextSearch) params.set('search', nextSearch)
    if (nextAvailable === '1') params.set('available', '1')
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort)

    const qs = params.toString()
    return qs ? `/?${qs}` : '/'
  }

  return (
    <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-8 md:py-12">
      <VaultHero />

      {/* Search & Filter Console */}
      <section className="mb-8 vault-card-3d rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <form className="relative flex items-center flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 z-10">
              <Search className="w-4 h-4 stroke-[2]" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search verified gear (e.g. DSLR Camera, Mountain Bike, Projector)..."
              className="w-full rounded-full pl-11 pr-32 py-3 text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/25 bg-white border border-slate-200 shadow-sm transition-colors text-sm font-medium"
            />
            {category && <input type="hidden" name="category" value={category} />}
            {onlyAvailable && <input type="hidden" name="available" value="1" />}
            {activeSort !== 'newest' && <input type="hidden" name="sort" value={activeSort} />}

            {search && (
              <Link
                href={buildFilterHref({ search: '' })}
                aria-label="Clear search"
                className="absolute right-24 text-xs font-bold text-slate-500 hover:text-[#0F172A] px-2 py-1 rounded-lg transition-colors"
              >
                Clear
              </Link>
            )}

            <button
              type="submit"
              className="absolute right-1.5 vault-btn-navy-3d text-white px-5 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={buildFilterHref({ available: onlyAvailable ? '' : '1' })}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap inline-flex items-center gap-2 ${
                onlyAvailable
                  ? 'vault-btn-amber-3d text-white'
                  : 'bg-white text-[#0F172A] border border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <span>Available Now Only</span>
            </Link>

            <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-full p-1">
              {[
                { key: 'newest', label: 'Newest' },
                { key: 'price_asc', label: 'Price ↑' },
                { key: 'price_desc', label: 'Price ↓' },
                { key: 'top_rated', label: 'Top Rated' },
              ].map((opt) => (
                <Link
                  key={opt.key}
                  href={buildFilterHref({ sort: opt.key })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    activeSort === opt.key
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map((cat) => {
            const isActive = category === cat || (!category && cat === 'All')
            return (
              <Link
                key={cat}
                href={buildFilterHref({ category: cat })}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'vault-btn-navy-3d text-white'
                    : 'bg-white text-[#0F172A] border border-slate-200 shadow-sm hover:bg-slate-50'
                }`}
              >
                {cat}
              </Link>
            )
          })}

          {hasFilters && (
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold vault-btn-amber-3d text-white whitespace-nowrap"
            >
              Reset filters
            </Link>
          )}
        </div>
      </section>

      <VaultTrustPillars />

      {!listings || listings.length === 0 ? (
        <div className="text-center py-20 vault-card-3d rounded-3xl px-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mx-auto mb-5 shadow-md">
            <Package className="w-7 h-7 text-[#F97316]" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0F172A] mb-1.5">No items found</h3>
          <p className="text-slate-600 text-sm font-medium mb-6 max-w-md mx-auto">
            {hasFilters
              ? 'Try adjusting your search or clearing the active filters.'
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
        <>
          <VaultListingsGrid listings={listings} />

          <div className="mt-10 bg-white/85 backdrop-blur-sm border border-white rounded-2xl shadow-sm px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold text-[#0F172A] tabular-nums">
            <span>
              Showing {listings.length} {listings.length === 1 ? 'item' : 'items'} · {availableCount} ready in vault · {totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}
            </span>
            <Link
              href="/owner/new-item"
              className="text-[#0F172A] hover:text-[#EA580C] transition-colors underline decoration-[#EA580C] decoration-2 underline-offset-4"
            >
              Have idle gear? List an item in the vault →
            </Link>
          </div>
        </>
      )}
    </main>
  )
}