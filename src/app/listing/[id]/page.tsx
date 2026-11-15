import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import RentButton from '@/components/RentButton'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
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
  const imageUrl = item.photos?.[0]

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
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(`
      id, rate_per_day, deposit, active,
      items ( id, name, category, grade, state, serial_number, photos, notes, average_rating, review_count )
    `)
    .eq('id', id)

  if (error || !data || data.length === 0) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let walletBalance = 0
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single()
    walletBalance = profile?.wallet_balance || 0
  }

  const listing = data[0]
  const item = listing.items as unknown as {
    id: string
    name: string
    category: string
    grade: string | null
    state: string | null
    serial_number: string | null
    photos: string[] | null
    notes: string | null
    average_rating: number | null
    review_count: number | null
  }

  const mainPhoto = item.photos?.[0]

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-[#0F172A] hover:text-white font-bold mb-6 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <div className="vault-card-3d rounded-3xl p-6 md:p-8 flex flex-col h-full gap-6">
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 vault-inset-3d">
              {mainPhoto ? (
                <Image
                  src={mainPhoto}
                  alt={item.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 gap-2">
                  <svg aria-hidden="true" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-500">Photo verified at vault intake</span>
                </div>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                  <span className="uppercase tracking-wider">{item.category}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Item
                  </span>
                  {(item.review_count ?? 0) > 0 && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 text-amber-700 tabular-nums">
                        <svg className="w-3.5 h-3.5 fill-amber-500 text-amber-500" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {item.average_rating} ({item.review_count})
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {item.name}
                </h1>
              </div>

              <div className="flex flex-col items-center justify-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Grade</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{item.grade ?? 'A'}</span>
              </div>
            </div>

            {item.notes && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">Owner Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed">{item.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-200">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Serial Number</p>
                <p className="font-mono text-sm font-semibold text-slate-900">{item.serial_number || 'Not registered'}</p>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Custody State</p>
                <p className="font-mono text-sm font-semibold text-slate-900">{item.state}</p>
              </div>
            </div>

            <div className="vault-card-3d-dark rounded-2xl p-5 text-white mt-auto">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-[#F97316]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-bold tracking-widest uppercase text-[#FB923C]">Vault Trust Layer</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
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
                <span className="text-4xl font-black text-[#0F172A]">₹{listing.rate_per_day}</span>
                <span className="text-base text-slate-600 font-semibold">/day</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 vault-inset-3d flex justify-between items-center">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">Refundable</p>
                <p className="text-sm font-bold text-[#0F172A]">Security Deposit</p>
              </div>
              <p className="text-xl font-bold text-[#0F172A] tabular-nums">₹{listing.deposit}</p>
            </div>

            {!listing.active ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-amber-800 mb-1 font-bold">Pending Approval</p>
                <p className="text-sm text-slate-800 font-medium">
                  This item is awaiting operator inspection before rentals open.
                </p>
              </div>
            ) : !user ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3">
                <p className="text-sm text-slate-700 font-medium">Sign in to rent this item and verify intake photos.</p>
                <Link
                  href={`/login?redirect=/listing/${listing.id}`}
                  className="block w-full vault-btn-amber-3d text-white rounded-xl py-3 font-bold text-sm"
                >
                  Sign in to Rent
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
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-amber-800 mb-1 font-bold">Currently Rented</p>
                <p className="text-slate-900 font-bold mb-2">This item is out on rental.</p>
                <Link href="/my-rentals" className="text-sm font-bold text-[#B45309] hover:underline">
                  Go to My Rentals →
                </Link>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Unavailable</p>
                <p className="text-slate-900 font-bold">Currently <span className="font-mono">{item.state}</span>.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}