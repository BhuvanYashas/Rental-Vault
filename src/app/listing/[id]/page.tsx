import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import RentButton from '@/components/RentButton'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// === SECTION: SEO & OPENGRAPH METADATA ===
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the data needed for SEO (title, description, image)
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

  const item = data.items as any
  const title = `${item.name} — ₹${data.rate_per_day}/day | Rental Vault`
  const description = `Rent a ${item.name} (${item.category}) on Rental Vault. Verified, insured, and escrowed.`
  const imageUrl = item.photos?.[0] || 'https://your-project.supabase.co/storage/v1/object/public/item-photos/default-og.jpg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

// === SECTION: MAIN PAGE COMPONENT ===
export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch the listing details
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id, rate_per_day, deposit, active,
      items ( id, name, category, grade, state, serial_number )
    `)
    .eq('id', id)

  if (error || !data || data.length === 0) notFound()

  // 2. Fetch the user's wallet balance
  const { data: { user } } = await supabase.auth.getUser()
  let walletBalance = 0
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single()
    walletBalance = profile?.wallet_balance || 0
  }

  const listing = data[0]
  const item = listing.items as unknown as { 
    id: string; name: string; category: string; grade: string; state: string; serial_number: string | null 
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm text-[#1E293B] hover:text-[#D97706] font-bold mb-8 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Item Details */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white border border-[#5C7FA8]/40 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F8FAFC] rounded-bl-full -z-10 opacity-50"></div>
            
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="inline-block px-3 py-1 bg-[#F1F5F9] text-[#0F172A] text-xs font-mono font-bold rounded-full mb-4 border border-[#E2E8F0]">
                  {item.category}
                </span>
                <h1 className="text-4xl font-black text-[#0F172A] mb-2 tracking-tight">{item.name}</h1>
                <div className="flex items-center gap-3 text-sm text-[#1E293B] font-medium">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Verified Item
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-16 h-16 bg-white border-2 border-[#E2E8F0] rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-[#5C7FA8] uppercase tracking-wider mb-0.5">Grade</span>
                <span className="text-2xl font-black text-[#0F172A]">{item.grade}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-y border-[#E2E8F0] mb-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-1">Serial Number</p>
                <p className="font-mono text-[#0F172A] bg-[#F8FAFC] inline-block px-3 py-1 rounded-md border border-[#E2E8F0]">{item.serial_number || 'Not registered'}</p>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-1">Current State</p>
                <p className="font-mono text-[#0F172A] bg-[#F8FAFC] inline-block px-3 py-1 rounded-md border border-[#E2E8F0]">{item.state}</p>
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-2xl p-6 text-white relative overflow-hidden shadow-inner mt-auto">
              <div className="absolute -right-4 -top-4 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[#D97706]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <p className="text-sm font-bold tracking-widest uppercase text-[#D97706]">Vault Trust Layer</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium relative z-10">
                Photo-graded at intake and return. Serial registry enforced. Pooled damage cover. Escrow released only after verified return.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Action */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white border border-[#5C7FA8]/40 rounded-3xl p-8 shadow-lg sticky top-24 flex-1">
            <div className="mb-6">
              <p className="text-sm font-bold text-[#1E293B] mb-1">Rental Rate</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#0F172A]">₹{listing.rate_per_day}</span>
                <span className="text-lg text-[#1E293B] font-medium">/day</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-4 mb-8 border border-[#E2E8F0] flex justify-between items-center">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold">Refundable</p>
                <p className="text-sm font-bold text-[#0F172A]">Security Deposit</p>
              </div>
              <p className="text-xl font-bold text-[#0F172A]">₹{listing.deposit}</p>
            </div>

                       {item.state === 'IN_VAULT' ? (
              <div className="space-y-4">
                <RentButton 
                  listingId={listing.id} 
                  itemId={item.id} 
                  deposit={listing.deposit} 
                  ratePerDay={listing.rate_per_day} 
                  walletBalance={walletBalance} 
                />
                <p className="text-center text-xs text-[#5C7FA8] font-medium leading-relaxed">
                  By renting, you agree to the vault's inspection terms upon return.
                </p>
              </div>
            ) : item.state === 'RENTED' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                <p className="text-xs font-mono uppercase tracking-widest text-amber-700 mb-1 font-bold">Currently Rented</p>
                <p className="text-[#0F172A] font-bold mb-2">This item is out on rental.</p>
                <Link href="/my-rentals" className="text-sm font-bold text-[#D97706] hover:underline">
                  Go to My Rentals →
                </Link>
              </div>
            ) : (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-center">
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-1 font-bold">Unavailable</p>
                <p className="text-[#0F172A] font-bold">Currently <span className="font-mono">{item.state}</span>.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}