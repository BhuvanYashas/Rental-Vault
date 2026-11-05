import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DisputeClaimButton from '@/components/DisputeClaimButton'
import EscalateClaimButton from '@/components/EscalateClaimButton'

export const dynamic = 'force-dynamic'

export default async function MyRentalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/my-rentals')

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
          id, name, category, grade, state,
          custody_events (id, state, notes, photo_url, created_at)
        )
      )
    `)
    .eq('renter_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <p className="text-red-600 font-mono text-sm">{error.message}</p>
      </main>
    )
  }

  const txnIds = (data ?? []).map((t) => t.id)
  const { data: claims } = txnIds.length
    ? await supabase
        .from('claims')
        .select(
          'id, transaction_id, damage_amount, description, status, dispute_reason, disputed_at, resolution, resolved_at, escalation_reason, escalated_at, platform_resolution, platform_notes, platform_resolved_at',
        )
        .in('transaction_id', txnIds)
    : { data: [] }

  const claimByTxn = new Map(
    (claims ?? []).map((c) => [c.transaction_id, c]),
  )

  const active = (data || []).filter((t) => t.status === 'ACTIVE')
  const past = (data || []).filter((t) => t.status !== 'ACTIVE')

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link
        href="/"
        className="text-sm text-neutral-800 hover:text-neutral-900 mb-8 inline-block font-medium"
      >
        ← Back to listings
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          My Rentals
        </h1>
        <p className="text-neutral-800 mt-2 font-medium">
          {active.length} active · {past.length} past
        </p>
      </header>

      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-800 mb-4 font-bold">
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
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-800 mb-4 font-bold">
            Past
          </h2>
          <div className="space-y-3">
            {past.map((t) => (
              <RentalRow
                key={t.id}
                transaction={t}
                claim={claimByTxn.get(t.id) ?? null}
              />
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && past.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-neutral-200 shadow-sm">
          <p className="text-lg font-semibold text-neutral-900">No rentals yet</p>
          <p className="text-sm text-neutral-500 mt-1 mb-6">
            Browse the vault to rent your first item.
          </p>
          <Link
            href="/"
            className="inline-block bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition"
          >
            Browse items
          </Link>
        </div>
      )}
    </main>
  )
}

function RentalRow({
  transaction,
  claim = null,
}: {
  transaction: any
  claim?: any
}) {
  const item = transaction.listings?.items
  if (!item) return null

  const isActive = transaction.status === 'ACTIVE'

  const events = (item.custody_events ?? [])
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

  const latestIntakePhoto = events.find(
    (e: any) => e.state === 'RENTED' && e.photo_url,
  )?.photo_url

  const latestReturnPhoto = events.find(
    (e: any) => e.state === 'IN_VAULT' && e.photo_url,
  )?.photo_url

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
      <Link
        href={`/listing/${transaction.listings.id}`}
        className="block hover:opacity-80 transition"
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-neutral-900">{item.name}</h3>
            <p className="text-xs text-neutral-600 mt-0.5">{item.category}</p>
          </div>
          <span
            className={`text-xs font-mono px-2.5 py-1 rounded font-medium ${
              isActive
                ? 'bg-amber-100 text-amber-800'
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            {transaction.status}
          </span>
        </div>

        <div className="flex justify-between text-xs text-neutral-600 mt-4 pt-4 border-t border-neutral-100">
          <span className="font-mono">
            {transaction.start_date} → {transaction.end_date}
          </span>
          <span className="font-mono font-medium">Escrow ₹{transaction.escrow_amount}</span>
        </div>
      </Link>

      {!isActive && (latestIntakePhoto || latestReturnPhoto) && (
        <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-3">
          {latestIntakePhoto && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-700 mb-2 font-medium">
                Intake
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={latestIntakePhoto}
                alt={`${item.name} intake`}
                className="w-full h-32 object-cover rounded-lg border border-neutral-200"
              />
            </div>
          )}
          {latestReturnPhoto && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-700 mb-2 font-medium">
                Return
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={latestReturnPhoto}
                alt={`${item.name} return`}
                className="w-full h-32 object-cover rounded-lg border border-neutral-200"
              />
            </div>
          )}
        </div>
      )}

      {claim && <ClaimBanner claim={claim} />}

      {isActive && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <p className="text-sm text-neutral-800 bg-neutral-50 rounded-lg p-4 border border-neutral-200 font-medium">
            Please bring this item to the vault to return it. An operator will verify the condition and release your escrow.
          </p>
        </div>
      )}
    </div>
  )
}

function ClaimBanner({ claim }: { claim: any }) {
  const colorByStatus: Record<string, string> = {
    OPEN: 'bg-amber-50 border-amber-200',
    DISPUTED: 'bg-red-50 border-red-200',
    RESOLVED: 'bg-emerald-50 border-emerald-200',
    ESCALATED: 'bg-amber-50 border-amber-300',
  }
  const labelByStatus: Record<string, string> = {
    OPEN: 'Damage claim filed',
    DISPUTED: 'Claim disputed — under review',
    RESOLVED: 'Claim resolved',
    ESCALATED: 'Re-review requested — awaiting platform',
  }

  const canEscalate =
    claim.status === 'RESOLVED' &&
    claim.resolution === 'VAULT_WINS' &&
    !claim.platform_resolution

  return (
    <div className="mt-4 pt-4 border-t border-neutral-100">
      <div
        className={`rounded-lg p-4 border ${
          colorByStatus[claim.status] ?? 'bg-neutral-50 border-neutral-200'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-800 font-bold">
            {labelByStatus[claim.status] ?? claim.status}
          </p>
          <p className="font-bold text-neutral-900">
            ₹{claim.damage_amount}
          </p>
        </div>

        {claim.description && (
          <p className="text-sm text-neutral-700">{claim.description}</p>
        )}

        {claim.status === 'DISPUTED' && claim.dispute_reason && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-xs font-mono uppercase tracking-widest text-red-700 mb-1 font-bold">
              Your dispute
            </p>
            <p className="text-sm text-red-800">{claim.dispute_reason}</p>
          </div>
        )}

        {claim.status === 'RESOLVED' &&
          claim.resolution &&
          !claim.platform_resolution && (
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <p className="text-xs font-mono uppercase tracking-widest text-emerald-700 mb-1 font-bold">
                Outcome
              </p>
              <p className="text-sm text-emerald-900 font-medium">
                {claim.resolution === 'VAULT_WINS'
                  ? `Charged ₹${claim.damage_amount} to your escrow`
                  : 'No charge — resolved in your favor'}
              </p>
            </div>
          )}

        {claim.status === 'ESCALATED' && claim.escalation_reason && (
          <div className="mt-3 pt-3 border-t border-amber-300">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-800 mb-1 font-bold">
              Your re-review request
            </p>
            <p className="text-sm text-amber-900">{claim.escalation_reason}</p>
          </div>
        )}

        {claim.platform_resolution && (
          <div className="mt-3 pt-3 border-t border-indigo-300">
            <p className="text-xs font-mono uppercase tracking-widest text-indigo-700 mb-1 font-bold">
              Final ruling · Platform
            </p>
            <p className="text-sm font-bold text-indigo-900">
              {claim.platform_resolution === 'RENTER_WINS'
                ? 'Reversed in your favor — no charge'
                : 'Upheld — charge stands'}
            </p>
            {claim.platform_notes && (
              <p className="text-sm text-indigo-800 mt-2">
                {claim.platform_notes}
              </p>
            )}
          </div>
        )}

        {claim.status === 'OPEN' && (
          <DisputeClaimButton claimId={claim.id} />
        )}

        {canEscalate && <EscalateClaimButton claimId={claim.id} />}
      </div>
    </div>
  )
}