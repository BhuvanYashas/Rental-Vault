import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RentalRow, { type RentalRowTransaction } from '@/components/RentalRow'

export const dynamic = 'force-dynamic'

type MyRentalQueryRow = RentalRowTransaction & {
  reviews?: { id: string }[] | null
}

export default async function MyRentalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/my-rentals')

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
      <main className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-red-700 bg-red-50 border border-red-200 rounded-xl p-4 font-mono text-sm font-semibold">
          {error.message}
        </p>
      </main>
    )
  }

  const rows = (data ?? []) as unknown as MyRentalQueryRow[]
  const txnIds = rows.map((t) => t.id)
  const { data: claims } = txnIds.length
    ? await supabase
        .from('claims')
        .select('id, transaction_id, damage_amount, description, status, dispute_reason, disputed_at, resolution, resolved_at, escalation_reason, escalated_at, platform_resolution, platform_notes, platform_resolved_at')
        .in('transaction_id', txnIds)
    : { data: [] }

  const claimByTxn = new Map((claims ?? []).map((c) => [c.transaction_id, c]))

  const active = rows.filter((t) => t.status === 'ACTIVE')
  const past = rows.filter((t) => t.status !== 'ACTIVE')

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 md:py-10">
      <Link href="/" className="text-sm text-[#0F172A] hover:text-white mb-6 inline-block font-bold transition-colors">
        ← Back to listings
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A]">My Rentals</h1>
        <p className="text-[#0F172A]/85 mt-1 font-semibold tabular-nums">{active.length} active · {past.length} past</p>
      </header>

      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="inline-block text-xs font-mono uppercase tracking-wider bg-[#EA580C] text-white px-3 py-1 rounded-full mb-4 font-bold shadow-sm">
            Active
          </h2>
          <div className="space-y-4">
            {active.map((t) => (
              <RentalRow key={t.id} transaction={t} claim={claimByTxn.get(t.id)} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="inline-block text-xs font-mono uppercase tracking-wider bg-[#0F172A] text-white px-3 py-1 rounded-full mb-4 font-bold shadow-sm">
            Past
          </h2>
          <div className="space-y-4">
            {past.map((t) => (
              <RentalRow
                key={t.id}
                transaction={t}
                claim={claimByTxn.get(t.id)}
                hasReviewed={Boolean(t.reviews && t.reviews.length > 0)}
              />
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && past.length === 0 && (
        <div className="text-center py-20 vault-card-3d rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-[#F97316] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_0_0_#020617]">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-[#0F172A] mb-1.5">Your vault is empty</h3>
          <p className="text-slate-600 text-sm font-medium mb-6">Browse the collection and rent your first item.</p>
          <Link href="/" className="vault-btn-amber-3d text-white px-6 py-2.5 rounded-xl text-sm font-bold inline-block">
            Explore Items
          </Link>
        </div>
      )}
    </main>
  )
}