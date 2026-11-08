import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DisputeClaimButton from '@/components/DisputeClaimButton'
import EscalateClaimButton from '@/components/EscalateClaimButton'
import ChatButton from '@/components/ChatButton'

export const dynamic = 'force-dynamic'

// === STRICT TYPES FOR THE DASHBOARD ===
type RentalTransaction = {
  id: string
  status: string
  start_date: string
  end_date: string
  escrow_amount: number
  listings: {
    id: string
    rate_per_day: number
    deposit: number
    items: {
      id: string
      name: string
      category: string
      grade: string
      state: string
      custody_events: {
        id: string
        state: string
        notes: string | null
        photo_url: string | null
        created_at: string
      }[]
    }
  }
}

type ClaimData = {
  id: string
  status: string
  damage_amount: number
  description: string | null
  dispute_reason: string | null
  resolution: string | null
  escalation_reason: string | null
  platform_resolution: string | null
  platform_notes: string | null
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
      )
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

  const active = (data as unknown as RentalTransaction[] || []).filter((t) => t.status === 'ACTIVE')
  const past = (data as unknown as RentalTransaction[] || []).filter((t) => t.status !== 'ACTIVE')

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
            {active.map((t) => <RentalRow key={t.id} transaction={t} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-4 font-bold">Past</h2>
          <div className="space-y-3">
            {past.map((t) => (
              <RentalRow key={t.id} transaction={t} claim={claimByTxn.get(t.id) as ClaimData ?? null} />
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && past.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-[#5C7FA8] shadow-sm">
          <p className="text-lg font-bold text-[#0F172A]">No rentals yet</p>
          <p className="text-sm text-[#1E293B] mt-1 mb-6 font-medium">Browse the vault to rent your first item.</p>
          <Link href="/" className="inline-block bg-[#D97706] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#B45309] transition shadow-sm">Browse items</Link>
        </div>
      )}
    </main>
  )
}

function RentalRow({ transaction, claim = null }: { transaction: RentalTransaction, claim?: ClaimData | null }) {
  const item = transaction.listings?.items
  if (!item) return null

  const isActive = transaction.status === 'ACTIVE'
  const events = (item.custody_events ?? []).slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const latestIntakePhoto = events.find((e) => e.state === 'RENTED' && e.photo_url)?.photo_url
  const latestReturnPhoto = events.find((e) => e.state === 'IN_VAULT' && e.photo_url)?.photo_url

  return (
    <div className="bg-white border border-[#5C7FA8] rounded-xl p-5 shadow-sm">
      <Link href={`/listing/${transaction.listings.id}`} className="block hover:opacity-80 transition">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-[#0F172A]">{item.name}</h3>
            <p className="text-xs text-[#1E293B] mt-0.5 font-medium">{item.category}</p>
          </div>
          <span className={`text-xs font-mono px-2.5 py-1 rounded font-bold ${isActive ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'}`}>
            {transaction.status}
          </span>
        </div>

        <div className="flex justify-between text-xs text-[#1E293B] mt-4 pt-4 border-t border-[#E2E8F0] font-medium">
          <span className="font-mono">{transaction.start_date} → {transaction.end_date}</span>
          <span className="font-mono font-bold text-[#0F172A]">Escrow ₹{transaction.escrow_amount}</span>
        </div>
      </Link>

      <div className="mt-3 flex justify-end">
        <ChatButton transactionId={transaction.id} itemName={item.name} />
      </div>

      {!isActive && (latestIntakePhoto || latestReturnPhoto) && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] grid grid-cols-2 gap-3">
          {latestIntakePhoto && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">Intake</p>
              <Image src={latestIntakePhoto} alt={`${item.name} intake`} width={400} height={300} className="w-full h-32 object-cover rounded-lg border border-[#5C7FA8]" />
            </div>
          )}
          {latestReturnPhoto && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">Return</p>
              <Image src={latestReturnPhoto} alt={`${item.name} return`} width={400} height={300} className="w-full h-32 object-cover rounded-lg border border-[#5C7FA8]" />
            </div>
          )}
        </div>
      )}

      {claim && <ClaimBanner claim={claim} />}

      {isActive && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
          <p className="text-sm text-[#0F172A] bg-[#E2E8F0] rounded-lg p-4 border border-[#5C7FA8]/30 font-medium">
            Please bring this item to the vault to return it. An operator will verify the condition and release your escrow.
          </p>
        </div>
      )}
    </div>
  )
}

function ClaimBanner({ claim }: { claim: ClaimData }) {
  const colorByStatus: Record<string, string> = { OPEN: 'bg-amber-50 border-amber-200', DISPUTED: 'bg-red-50 border-red-200', RESOLVED: 'bg-emerald-50 border-emerald-200', ESCALATED: 'bg-amber-50 border-amber-300' }
  const labelByStatus: Record<string, string> = { OPEN: 'Damage claim filed', DISPUTED: 'Claim disputed — under review', RESOLVED: 'Claim resolved', ESCALATED: 'Re-review requested — awaiting platform' }
  const canEscalate = claim.status === 'RESOLVED' && claim.resolution === 'VAULT_WINS' && !claim.platform_resolution

  return (
    <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
      <div className={`rounded-lg p-4 border ${colorByStatus[claim.status] ?? 'bg-neutral-50 border-neutral-200'}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] font-bold">{labelByStatus[claim.status] ?? claim.status}</p>
          <p className="font-bold text-[#0F172A]">₹{claim.damage_amount}</p>
        </div>
        {claim.description && <p className="text-sm text-[#1E293B] font-medium">{claim.description}</p>}
        {claim.status === 'DISPUTED' && claim.dispute_reason && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-xs font-mono uppercase tracking-widest text-red-700 mb-1 font-bold">Your dispute</p>
            <p className="text-sm text-red-800 font-medium">{claim.dispute_reason}</p>
          </div>
        )}
        {claim.status === 'RESOLVED' && claim.resolution && !claim.platform_resolution && (
          <div className="mt-3 pt-3 border-t border-emerald-200">
            <p className="text-xs font-mono uppercase tracking-widest text-emerald-700 mb-1 font-bold">Outcome</p>
            <p className="text-sm text-emerald-900 font-bold">{claim.resolution === 'VAULT_WINS' ? `Charged ₹${claim.damage_amount} to your escrow` : 'No charge — resolved in your favor'}</p>
          </div>
        )}
        {claim.status === 'ESCALATED' && claim.escalation_reason && (
          <div className="mt-3 pt-3 border-t border-amber-300">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-800 mb-1 font-bold">Your re-review request</p>
            <p className="text-sm text-amber-900 font-medium">{claim.escalation_reason}</p>
          </div>
        )}
        {claim.platform_resolution && (
          <div className="mt-3 pt-3 border-t border-indigo-300">
            <p className="text-xs font-mono uppercase tracking-widest text-indigo-700 mb-1 font-bold">Final ruling · Platform</p>
            <p className="text-sm font-bold text-indigo-900">{claim.platform_resolution === 'RENTER_WINS' ? 'Reversed in your favor — no charge' : 'Upheld — charge stands'}</p>
            {claim.platform_notes && <p className="text-sm text-indigo-800 mt-2 font-medium">{claim.platform_notes}</p>}
          </div>
        )}
        {claim.status === 'OPEN' && <DisputeClaimButton claimId={claim.id} />}
        {canEscalate && <EscalateClaimButton claimId={claim.id} />}
      </div>
    </div>
  )
}