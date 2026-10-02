import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const TEST_RENTER_ID = '00000000-0000-0000-0000-000000000003'

export default async function MyRentalsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      status,
      start_date,
      end_date,
      escrow_amount,
      created_at,
      listings (
        id,
        rate_per_day,
        deposit,
        items (
          id,
          name,
          category,
          grade,
          state
        )
      )
    `)
    .eq('renter_id', TEST_RENTER_ID)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <p className="text-red-600 font-mono text-sm">{error.message}</p>
      </main>
    )
  }

  const active = (data || []).filter((t) => t.status === 'ACTIVE')
  const past = (data || []).filter((t) => t.status !== 'ACTIVE')

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-900 mb-8 inline-block"
      >
        ← Back to listings
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          My Rentals
        </h1>
        <p className="text-neutral-500 mt-2">
          {active.length} active · {past.length} past
        </p>
      </header>

      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4">
            Active
          </h2>
          <div className="space-y-3">
            {active.map((t) => (
              <RentalRow key={t.id} transaction={t} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4">
            Past
          </h2>
          <div className="space-y-3">
            {past.map((t) => (
              <RentalRow key={t.id} transaction={t} />
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && past.length === 0 && (
        <div className="text-center py-20 text-neutral-400">
          <p>No rentals yet.</p>
          <p className="text-sm mt-2">
            Browse the vault and rent your first item.
          </p>
        </div>
      )}
    </main>
  )
}

function RentalRow({ transaction }: { transaction: any }) {
  const item = transaction.listings?.items
  if (!item) return null

  const isActive = transaction.status === 'ACTIVE'

  return (
    <Link
      href={`/listing/${transaction.listings.id}`}
      className="block bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-400 transition"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-neutral-900">{item.name}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{item.category}</p>
        </div>
        <span
          className={`text-xs font-mono px-2.5 py-1 rounded ${
            isActive
              ? 'bg-amber-50 text-amber-700'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {transaction.status}
        </span>
      </div>

      <div className="flex justify-between text-xs text-neutral-500 mt-4 pt-4 border-t border-neutral-100">
        <span className="font-mono">
          {transaction.start_date} → {transaction.end_date}
        </span>
        <span className="font-mono">
          Escrow ₹{transaction.escrow_amount}
        </span>
      </div>
    </Link>
  )
}