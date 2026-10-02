import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RentButton } from '@/components/RentButton'
import { ReturnButton } from '@/components/ReturnButton'

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
      id,
      rate_per_day,
      deposit,
      active,
      items (
        id,
        name,
        category,
        grade,
        state,
        serial_number
      )
    `)
    .eq('id', id)

  if (error || !data || data.length === 0) {
    notFound()
  }

  const listing = data[0]
  const item = listing.items as unknown as {
  id: string
  name: string
  category: string
  grade: string
  state: string
  serial_number: string | null
}

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-900 mb-8 inline-block"
      >
        ← Back to listings
      </Link>

      <div className="bg-white border border-neutral-200 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {item.name}
            </h1>
            <p className="text-neutral-500">{item.category}</p>
          </div>
          <span className="text-sm font-mono px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700">
            Grade {item.grade}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 border-y border-neutral-200 mb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1">
              Rental rate
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              ₹{listing.rate_per_day}
              <span className="text-sm font-normal text-neutral-500"> /day</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1">
              Security deposit
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              ₹{listing.deposit}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Serial number</span>
            <span className="font-mono text-neutral-900">
              {item.serial_number || '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Current state</span>
            <span className="font-mono text-neutral-900">{item.state}</span>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-xl p-5 mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
            Trust layer
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Photo-graded at intake and return. Serial registry enforced. Pooled
            damage cover. Escrow released only after verified return.
          </p>
        </div>

        {item.state === 'IN_VAULT' ? (
          <RentButton
            listingId={listing.id}
            itemId={item.id}
            deposit={listing.deposit}
          />
        ) : item.state === 'RENTED' ? (
          <ReturnButton listingId={listing.id} itemId={item.id} />
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-700 mb-1">
              Status
            </p>
            <p className="text-neutral-900 font-medium">
              This item is currently{' '}
              <span className="font-mono">{item.state}</span>.
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              It will return to the vault once the rental ends.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}