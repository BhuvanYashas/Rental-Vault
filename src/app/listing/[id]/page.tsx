import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import RentButton from '@/components/RentButton'

export const dynamic = 'force-dynamic'

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
      items ( id, name, category, grade, state, serial_number )
    `)
    .eq('id', id)

  if (error || !data || data.length === 0) notFound()

  const listing = data[0]
  const item = listing.items as unknown as { id: string; name: string; category: string; grade: string; state: string; serial_number: string | null }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link href="/" className="text-sm text-[#0F172A] hover:text-[#D97706] font-bold mb-8 inline-block transition">
        ← Back to listings
      </Link>

      <div className="bg-white border border-[#5C7FA8] rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">{item.name}</h1>
            <p className="text-[#1E293B] font-medium">{item.category}</p>
          </div>
          <span className="text-sm font-mono px-3 py-1.5 rounded-lg bg-[#E2E8F0] text-[#0F172A] font-bold">
            Grade {item.grade}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 border-y border-[#E2E8F0] mb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#1E293B] mb-1 font-bold">Rental rate</p>
            <p className="text-2xl font-bold text-[#0F172A]">₹{listing.rate_per_day} <span className="text-sm font-medium text-[#1E293B]">/day</span></p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#1E293B] mb-1 font-bold">Security deposit</p>
            <p className="text-2xl font-bold text-[#0F172A]">₹{listing.deposit}</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-[#1E293B] font-medium">Serial number</span>
            <span className="font-mono text-[#0F172A] font-bold">{item.serial_number || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#1E293B] font-medium">Current state</span>
            <span className="font-mono text-[#0F172A] font-bold bg-[#E2E8F0] px-2 py-0.5 rounded">{item.state}</span>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-5 mb-6 border border-[#E2E8F0]">
          <p className="text-xs font-mono uppercase tracking-widest text-[#1E293B] mb-2 font-bold">Trust layer</p>
          <p className="text-sm text-[#0F172A] leading-relaxed font-medium">
            Photo-graded at intake and return. Serial registry enforced. Pooled damage cover. Escrow released only after verified return.
          </p>
        </div>

        {item.state === 'IN_VAULT' ? (
          <RentButton listingId={listing.id} itemId={item.id} deposit={listing.deposit} />
        ) : item.state === 'RENTED' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-700 mb-1 font-bold">Currently rented</p>
            <p className="text-[#0F172A] font-bold">This item is out on rental.</p>
            <p className="text-sm text-[#1E293B] mt-1 font-medium">Returns are processed from <Link href="/my-rentals" className="underline font-bold text-[#0F172A]">My Rentals</Link>.</p>
          </div>
        ) : (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-1 font-bold">Unavailable</p>
            <p className="text-[#0F172A] font-bold">This item is currently <span className="font-mono">{item.state}</span>.</p>
          </div>
        )}
      </div>
    </main>
  )
}