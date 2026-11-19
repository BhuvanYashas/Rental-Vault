import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShieldCheck, Star } from 'lucide-react'
import { createClient, hasSupabaseEnv } from '@/lib/supabase/server'
import { getFallbackItemPhoto, resolveItemPhotoUrl } from '@/lib/itemPhotos'
import { getPreviewListingById } from '@/lib/mockCatalog'
import RentButton from '@/components/RentButton'
import VaultImage from '@/components/VaultImage'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  if (!hasSupabaseEnv()) {
    const preview = getPreviewListingById(id)
    if (!preview || !preview.items) {
      return { title: 'Item Not Found | Rental Vault' }
    }
    const title = `${preview.items.name} — ₹${preview.rate_per_day}/day | Rental Vault`
    const description = `Rent a ${preview.items.name} (${preview.items.category}) on Rental Vault. Verified, insured, and escrowed.`
    return { title, description }
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('listings')
    .select(`
      rate_per_day,
      items ( name, category, photos )
    `)
    .eq('id', id)
    .single()

  if (!data || !data.items) {
    return { title: 'Item Not Found | Rental Vault' }
  }

  const item = data.items as unknown as { name: string; category: string; photos?: string[] | null }
  const title = `${item.name} — ₹${data.rate_per_day}/day | Rental Vault`
  const description = `Rent a ${item.name} (${item.category}) on Rental Vault. Verified, insured, and escrowed.`
  const imageUrl = resolveItemPhotoUrl(item.name, item.category, item.photos)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(imageUrl ? { images: [{ url: imageUrl, width: 1200, height: 630 }] } : {}),
      type: 'website',
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let listing: {
    id: string
    rate_per_day: number
    deposit: number
    active: boolean
  }
  let item: {
    id: string
    owner_id: string | null
    name: string
    category: string
    grade: string | null
    state: string | null
    serial_number: string | null
    photos: string[] | null
    notes?: string | null
    average_rating: number | null
    review_count: number | null
  }
  let user: { id: string } | null = null
  let walletBalance = 0
  let reviewsList: Array<{
    id: string
    rating: number
    comment: string | null
    created_at: string
    reviewer_name: string
  }> = []
  let custodyEventsList: Array<{
    id: string
    state: string
    notes: string | null
    created_at: string
  }> = []

  if (!hasSupabaseEnv()) {
    const preview = getPreviewListingById(id)
    if (!preview || !preview.items) notFound()

    listing = {
      id: preview.id,
      rate_per_day: preview.rate_per_day,
      deposit: preview.deposit,
      active: preview.active,
    }
    item = {
      id: preview.items.id,
      owner_id: preview.items.owner_id,
      name: preview.items.name,
      category: preview.items.category,
      grade: preview.items.grade,
      state: preview.items.state,
      serial_number: preview.items.serial_number ?? null,
      photos: preview.items.photos,
      notes: preview.notes,
      average_rating: preview.items.average_rating ?? null,
      review_count: preview.items.review_count ?? null,
    }
    reviewsList = preview.reviews
    custodyEventsList = preview.custody_events
  } else {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('listings')
      .select(`
        id, rate_per_day, deposit, active,
        items ( id, owner_id, name, category, grade, state, photos, average_rating, review_count )
      `)
      .eq('id', id)

    if (error || !data || data.length === 0) notFound()

    const row = data[0]
    listing = {
      id: row.id,
      rate_per_day: row.rate_per_day,
      deposit: row.deposit,
      active: row.active,
    }
    const baseItem = row.items as unknown as Omit<typeof item, 'serial_number'>
    item = {
      ...baseItem,
      serial_number: null,
    }

    const authResult = await supabase.auth.getUser()
    user = authResult.data.user
    if (user) {
      const [{ data: profile }, { data: serialRow }] = await Promise.all([
        supabase.from('profiles').select('wallet_balance').eq('id', user.id).single(),
        supabase.from('items').select('serial_number').eq('id', item.id).maybeSingle(),
      ])
      walletBalance = profile?.wallet_balance || 0
      item.serial_number = serialRow?.serial_number ?? null
    }

    const [{ data: itemReviews }, { data: custodyEvents }, { data: notesRow }] = await Promise.all([
      supabase
        .from('reviews')
        .select('id, rating, comment, created_at, reviewer_id')
        .eq('item_id', item.id)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('custody_events')
        .select('id, state, notes, created_at')
        .eq('item_id', item.id)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('items')
        .select('notes')
        .eq('id', item.id)
        .maybeSingle(),
    ])

    item.notes = (notesRow as { notes?: string | null } | null)?.notes ?? null

    const reviewerIds = Array.from(
      new Set((itemReviews ?? []).map((r) => r.reviewer_id).filter(Boolean)),
    )
    const { data: reviewerProfiles } = reviewerIds.length
      ? await supabase.from('profiles').select('id, username, full_name').in('id', reviewerIds)
      : { data: [] }
    const reviewerMap = new Map(
      (reviewerProfiles ?? []).map((p) => [p.id, p.username || p.full_name || 'Verified Renter']),
    )

    reviewsList = (itemReviews ?? []).map((rev) => ({
      id: rev.id,
      rating: rev.rating,
      comment: rev.comment,
      created_at: rev.created_at,
      reviewer_name: rev.reviewer_id ? reviewerMap.get(rev.reviewer_id) || 'Verified Renter' : 'Verified Renter',
    }))

    custodyEventsList = (custodyEvents ?? []).map((evt) => ({
      id: evt.id,
      state: evt.state,
      notes: evt.notes,
      created_at: evt.created_at,
    }))
  }

  const isOwner = Boolean(user && item.owner_id && user.id === item.owner_id)
  const mainPhoto = resolveItemPhotoUrl(item.name, item.category, item.photos)
  const fallbackPhoto = getFallbackItemPhoto(item.name, item.category)
  const extraPhotos = (item.photos ?? []).slice(1).filter(Boolean)

  return (
    <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-8 md:py-10 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-white/85 backdrop-blur-sm border border-white shadow-sm hover:bg-white px-4 py-2 rounded-xl text-sm text-[#0F172A] font-bold transition-all group"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.2] group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <div className="vault-card-3d rounded-3xl p-6 md:p-8 flex flex-col h-full gap-6">
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 vault-inset-3d">
              <VaultImage
                src={mainPhoto}
                fallbackSrc={fallbackPhoto}
                alt={item.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>

            {extraPhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {extraPhotos.slice(0, 4).map((url, idx) => (
                  <div
                    key={url + idx}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                  >
                    <VaultImage
                      src={url}
                      fallbackSrc={fallbackPhoto}
                      alt={`${item.name} view ${idx + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 15vw"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-2">
                  <span className="uppercase tracking-wider">{item.category}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Verified Item
                  </span>
                  {(item.review_count ?? 0) > 0 && (
                    <>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="inline-flex items-center gap-1 text-[#EA580C] tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" aria-hidden="true" />
                        {item.average_rating} ({item.review_count})
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                  {item.name}
                </h1>
              </div>

              <div className="flex flex-col items-center justify-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Grade</span>
                <span className="text-2xl font-black text-[#0F172A] font-mono">{item.grade ?? 'A'}</span>
              </div>
            </div>

            {item.notes && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">Owner Notes</p>
                <p className="text-sm text-[#0F172A] font-medium leading-relaxed">{item.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-200">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Serial Number</p>
                <p className="font-mono text-sm font-bold text-[#0F172A]">{item.serial_number || 'Not registered'}</p>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Custody State</p>
                <p className="font-mono text-sm font-bold text-[#0F172A]">{item.state}</p>
              </div>
            </div>

            <div className="vault-card-3d-dark rounded-2xl p-5 text-white mt-auto">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
                <p className="text-xs font-bold tracking-widest uppercase text-[#FB923C]">Vault Trust Layer</p>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                Photo-graded at intake and return. Serial registry enforced. Pooled damage cover. Escrow released only after verified return.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col">
          <div className="vault-card-3d rounded-3xl p-6 md:p-7 sticky top-24 flex-1">
            <div className="mb-5">
              <p className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500 mb-1">Rental Rate</p>
              <div className="flex items-baseline gap-1 tabular-nums">
                <span className="text-4xl font-black text-[#0F172A]">₹{listing.rate_per_day.toLocaleString('en-IN')}</span>
                <span className="text-base text-slate-500 font-bold">/day</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-6 vault-inset-3d flex justify-between items-center">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">Refundable</p>
                <p className="text-sm font-bold text-[#0F172A]">Security Deposit</p>
              </div>
              <p className="text-xl font-black text-[#0F172A] tabular-nums">₹{listing.deposit.toLocaleString('en-IN')}</p>
            </div>

            {!listing.active ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-amber-800 mb-1 font-bold">Pending Approval</p>
                <p className="text-sm text-[#0F172A] font-medium">
                  This item is awaiting operator inspection before rentals open.
                </p>
              </div>
            ) : !user ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                <p className="text-sm text-[#0F172A] font-semibold">Sign in to rent this item and verify intake photos.</p>
                <Link
                  href={`/login?redirect=/listing/${listing.id}`}
                  className="block w-full vault-btn-amber-3d text-white rounded-xl py-3 font-bold text-sm"
                >
                  Sign in to Rent
                </Link>
              </div>
            ) : isOwner ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">Your Vault Listing</p>
                <p className="text-sm text-[#0F172A] font-medium">
                  You listed this item in the vault. Manage its status and completed returns from your dashboard.
                </p>
                <Link
                  href="/owner/dashboard"
                  className="block w-full vault-btn-navy-3d text-white rounded-xl py-3 font-bold text-sm"
                >
                  Go to Owner Dashboard →
                </Link>
              </div>
            ) : item.state === 'IN_VAULT' ? (
              <div className="space-y-4">
                <RentButton
                  listingId={listing.id}
                  itemId={item.id}
                  deposit={listing.deposit}
                  ratePerDay={listing.rate_per_day}
                  walletBalance={walletBalance}
                />
                <p className="text-center text-xs text-slate-500 font-medium leading-relaxed">
                  By renting, you agree to the vault&apos;s inspection terms upon return.
                </p>
              </div>
            ) : item.state === 'RENTED' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-amber-800 mb-1 font-bold">Currently Rented</p>
                <p className="text-[#0F172A] font-bold mb-2">This item is out on rental.</p>
                <Link href="/my-rentals" className="text-sm font-bold text-[#EA580C] hover:underline">
                  Go to My Rentals →
                </Link>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Unavailable</p>
                <p className="text-[#0F172A] font-bold">Currently <span className="font-mono">{item.state}</span>.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        <div className="vault-card-3d rounded-3xl p-6 md:p-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-[#0F172A]">Verified Renter Reviews</h2>
            {(item.review_count ?? 0) > 0 && (
              <span className="text-xs font-mono font-bold text-[#0F172A] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg tabular-nums">
                {item.average_rating} ★ · {item.review_count} total
              </span>
            )}
          </div>

          {reviewsList.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <p className="text-sm font-bold text-[#0F172A]">No verified reviews yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Reviews unlock automatically after a renter completes and returns this item.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-sm font-bold text-[#0F172A]">
                      {rev.reviewer_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#EA580C] tabular-nums">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(Math.max(0, 5 - rev.rating))}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                        {new Date(rev.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-sm text-slate-700 leading-relaxed">{rev.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="vault-card-3d rounded-3xl p-6 md:p-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-[#0F172A]">Vault Custody Provenance</h2>
            <span className="text-xs font-mono font-bold text-[#0F172A] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg tabular-nums">
              {custodyEventsList.length} event{custodyEventsList.length === 1 ? '' : 's'}
            </span>
          </div>

          {custodyEventsList.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <p className="text-sm font-bold text-[#0F172A]">No custody events logged yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Every vault check-in, rental dispatch, and return inspection appears here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {custodyEventsList.map((evt) => (
                <div key={evt.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0F172A] text-white">
                      {evt.state}
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed">
                      {evt.notes || 'Custody state updated'}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0 tabular-nums">
                    {new Date(evt.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}