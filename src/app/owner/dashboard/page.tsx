import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReturnedRentalRow from '@/components/ReturnedRentalRow'
import TiltCard from '@/components/TiltCard'

export const dynamic = 'force-dynamic'

export default async function OwnerDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/owner/dashboard')

  const { data: ownedListings } = await supabase
    .from('listings')
    .select(`
      id, rate_per_day, deposit, active,
      items!inner ( id, name, category, state, grade, owner_id, photos, average_rating, review_count )
    `)
    .eq('items.owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: returnedRentals, error } = await supabase
    .from('transactions')
    .select(`
      id, start_date, end_date, escrow_amount, renter_id, created_at, status,
      listings!inner (
        id,
        items!inner (
          id, name, category, owner_id,
          custody_events ( id, state, photo_url, created_at )
        )
      )
    `)
    .eq('status', 'RETURNED')
    .eq('listings.items.owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-10">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 font-medium">
          Could not load your owner dashboard: {error.message}
        </div>
      </main>
    )
  }

  let reviewMap = new Map()
  let claimsByTxn = new Map()
  if (returnedRentals && returnedRentals.length > 0) {
    const txnIds = returnedRentals.map((r) => r.id)
    const [{ data: reviews }, { data: claims }] = await Promise.all([
      supabase.from('reviews').select('transaction_id, rating').in('transaction_id', txnIds),
      supabase
        .from('claims')
        .select('id, transaction_id, damage_amount, description, status')
        .in('transaction_id', txnIds),
    ])

    if (reviews) {
      reviewMap = new Map(reviews.map((r) => [r.transaction_id, r]))
    }
    if (claims) {
      claimsByTxn = new Map(claims.map((c) => [c.transaction_id, c]))
    }
  }

  const renterIds = Array.from(
    new Set((returnedRentals ?? []).map((r) => r.renter_id).filter(Boolean)),
  )

  const { data: profiles } = renterIds.length
    ? await supabase.from('profiles').select('id, full_name, username').in('id', renterIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const typedOwnedListings = (ownedListings ?? []) as unknown as Array<{
    id: string
    rate_per_day: number
    deposit: number
    active: boolean
    items: {
      id: string
      name: string
      category: string
      state: string | null
      grade: string | null
      photos: string[] | null
      average_rating: number | null
      review_count: number | null
    }
  }>

  const totalListed = typedOwnedListings.length
  const liveInVaultCount = typedOwnedListings.filter((l) => l.active && l.items.state === 'IN_VAULT').length
  const currentlyRentedCount = typedOwnedListings.filter((l) => l.active && l.items.state === 'RENTED').length
  const returnedEscrowTotal = (returnedRentals ?? []).reduce((sum, r) => sum + (Number(r.escrow_amount) || 0), 0)

  return (
    <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-8 md:py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A]">My Vault Items</h1>
          <p className="text-[#0F172A]/85 mt-1 font-semibold">
            Track your listed gear, approval status, and completed returns.
          </p>
        </div>
        <Link
          href="/owner/new-item"
          className="inline-flex items-center justify-center gap-2 vault-btn-amber-3d text-white px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
        >
          + List New Item
        </Link>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <TiltCard maxTilt={4}>
          <div className="vault-card-3d rounded-2xl p-5 h-full">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">Listed Items</p>
            <p className="text-3xl font-black text-[#0F172A] tabular-nums">{totalListed}</p>
          </div>
        </TiltCard>
        <TiltCard maxTilt={4}>
          <div className="vault-card-3d rounded-2xl p-5 h-full">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">Live in Vault</p>
            <p className="text-3xl font-black text-emerald-700 tabular-nums">{liveInVaultCount}</p>
          </div>
        </TiltCard>
        <TiltCard maxTilt={4}>
          <div className="vault-card-3d rounded-2xl p-5 h-full">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">Currently Rented</p>
            <p className="text-3xl font-black text-[#EA580C] tabular-nums">{currentlyRentedCount}</p>
          </div>
        </TiltCard>
        <TiltCard maxTilt={4}>
          <div className="vault-card-3d rounded-2xl p-5 h-full">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">Returned Escrow</p>
            <p className="text-3xl font-black text-[#0F172A] tabular-nums">₹{returnedEscrowTotal}</p>
          </div>
        </TiltCard>
      </section>

      <section>
        <h2 className="text-lg font-extrabold text-[#0F172A] mb-4">Your Listed Inventory</h2>
        {typedOwnedListings.length === 0 ? (
          <div className="vault-card-3d rounded-3xl p-10 text-center">
            <p className="text-[#0F172A] font-bold text-lg">No items listed yet</p>
            <p className="text-slate-600 text-sm font-medium mt-1 mb-5">
              Deposit idle tools, cameras, or appliances into the vault to start earning.
            </p>
            <Link
              href="/owner/new-item"
              className="inline-block vault-btn-navy-3d text-white px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              List your first item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {typedOwnedListings.map((listing) => {
              const item = listing.items
              const photo = item.photos?.[0]
              const statusLabel = !listing.active
                ? 'Pending Approval'
                : item.state === 'RENTED'
                ? 'Currently Rented'
                : item.state === 'IN_VAULT'
                ? 'Live in Vault'
                : item.state
              const statusClass = !listing.active
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : item.state === 'RENTED'
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'

              return (
                <TiltCard key={listing.id} maxTilt={5}>
                  <Link
                    href={`/listing/${listing.id}`}
                    className="vault-title-card-3d rounded-2xl overflow-hidden flex flex-col justify-between h-full group"
                  >
                    <div className="vault-title-header-3d px-4 py-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider truncate">
                        {item.category} · Grade {item.grade ?? 'A'}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={item.name}
                          fill
                          referrerPolicy="no-referrer"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col justify-between gap-3 flex-1 bg-white">
                      <div>
                        <h3 className="font-extrabold text-[#0F172A] text-base leading-snug line-clamp-1">{item.name}</h3>
                        {(item.review_count ?? 0) > 0 && (
                          <p className="text-xs font-bold text-amber-600 mt-1 tabular-nums">
                            ★ {item.average_rating} ({item.review_count})
                          </p>
                        )}
                      </div>
                      <div className="flex items-baseline justify-between pt-3 border-t border-slate-100 text-sm tabular-nums">
                        <span className="font-black text-[#0F172A]">₹{listing.rate_per_day}<span className="text-xs font-medium text-slate-500">/day</span></span>
                        <span className="text-xs text-slate-600 font-semibold">Deposit ₹{listing.deposit}</span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-extrabold text-[#0F172A] mb-4">Recently Returned</h2>

        <div className="flex flex-col gap-4">
          {returnedRentals && returnedRentals.length > 0 ? (
            (returnedRentals as unknown as Array<{
              id: string
              start_date: string
              end_date: string
              escrow_amount: number
              renter_id: string | null
              listings: {
                id: string
                items: {
                  id: string
                  name: string
                  category: string
                  custody_events?: Array<{
                    id: string
                    state: string
                    photo_url: string | null
                    created_at: string
                  }> | null
                } | null
              } | null
            }>).map((rental) => {
              const listing = rental.listings
              const item = listing?.items
              const renter = rental.renter_id ? profileMap.get(rental.renter_id) : null
              const review = reviewMap.get(rental.id) || null
              const claim = claimsByTxn.get(rental.id) || null

              const events = (item?.custody_events ?? [])
                .slice()
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              const intakePhoto = events.find((e) => e.state === 'RENTED' && e.photo_url)?.photo_url
              const returnPhoto = events.find((e) => e.state === 'IN_VAULT' && e.photo_url)?.photo_url

              return (
                <ReturnedRentalRow
                  key={rental.id}
                  transactionId={rental.id}
                  itemName={item?.name ?? '—'}
                  category={item?.category ?? ''}
                  renterName={renter?.username || renter?.full_name || '—'}
                  startDate={rental.start_date}
                  endDate={rental.end_date}
                  escrowAmount={rental.escrow_amount}
                  intakePhoto={intakePhoto ?? null}
                  returnPhoto={returnPhoto ?? null}
                  claim={claim}
                  review={review}
                  canOpenClaim={false}
                />
              )
            })
          ) : (
            <div className="vault-card-3d rounded-3xl p-10 text-center">
              <p className="text-[#0F172A] font-bold text-lg">No returns yet</p>
              <p className="text-slate-600 text-sm font-medium mt-1">
                Completed rentals for your items will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}