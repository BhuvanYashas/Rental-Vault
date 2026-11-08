import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RentalRow from '@/components/RentalRow'

export const dynamic = 'force-dynamic'

export default async function MyRentalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/my-rentals')

  // 👇 ADDED "reviews ( id )" TO THE QUERY 👇
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id, status, start_date, end_date, escrow_amount, created_at,
      listings (
        id, rate_per_day, deposit,
        items (
          id, name, category, grade, state,
          custody_events (id, state, notes, photo_url, created_at)
        )
      ),
      reviews ( id )
    `)
    .eq('renter_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <p className="text-red-700 font-mono text-sm font-bold">{error.message}</p>
      </main>
    )
  }

  const txnIds = (data ?? []).map((t) => t.id)
  const { data: claims } = txnIds.length
    ? await supabase
        .from('claims')
        .select('id, transaction_id, damage_amount, description, status, dispute_reason, disputed_at, resolution, resolved_at, escalation_reason, escalated_at, platform_resolution, platform_notes, platform_resolved_at')
        .in('transaction_id', txnIds)
    : { data: [] }

  const claimByTxn = new Map((claims ?? []).map((c) => [c.transaction_id, c]))

  const active = (data || []).filter((t) => t.status === 'ACTIVE')
  const past = (data || []).filter((t) => t.status !== 'ACTIVE')

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link href="/" className="text-sm text-[#0F172A] hover:text-[#D97706] mb-8 inline-block font-bold transition">
        ← Back to listings
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">My Rentals</h1>
        <p className="text-[#1E293B] mt-2 font-medium">{active.length} active · {past.length} past</p>
      </header>

      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#D97706] mb-4 font-bold">Active</h2>
          <div className="space-y-3">
            {active.map((t) => (
              <RentalRow key={t.id} transaction={t} claim={claimByTxn.get(t.id)} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-4 font-bold">Past</h2>
          <div className="space-y-3">
            {past.map((t: any) => (
              <RentalRow 
                key={t.id} 
                transaction={t} 
                claim={claimByTxn.get(t.id)} 
                hasReviewed={t.reviews && t.reviews.length > 0}
              />
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && past.length === 0 && (
        <div className="text-center py-24 bg-white/50 border border-[#5C7FA8]/20 rounded-3xl">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Your vault is empty</h3>
          <p className="text-[#1E293B] font-medium mb-6">Browse the collection and rent your first item.</p>
          <Link href="/" className="bg-[#0F172A] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#1E293B] transition shadow-sm inline-block">
            Explore Items
          </Link>
        </div>
      )}
    </main>
  )
}