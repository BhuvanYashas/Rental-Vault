import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReturnedRentalRow from '@/components/ReturnedRentalRow'
import ReturnButton from '@/components/ReturnButton'

export const dynamic = 'force-dynamic'

export default async function OperatorPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/operator')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'operator') redirect('/')

  const { data: items } = await supabase.from('items').select('id, name, category, grade, state, serial_number').order('name')
  const { data: rentals } = await supabase.from('transactions').select(`id, start_date, end_date, escrow_amount, renter_id, created_at, listings ( id, items ( id, name, category, grade ) )`).eq('status', 'ACTIVE').order('created_at', { ascending: false })
  const { data: returned } = await supabase.from('transactions').select(`id, start_date, end_date, escrow_amount, renter_id, created_at, listings ( id, items ( id, name, category, custody_events ( id, state, photo_url, created_at ) ) )`).eq('status', 'RETURNED').order('created_at', { ascending: false }).limit(20)
  
  const { data: claims } = await supabase.from('claims').select('id, transaction_id, damage_amount, description, status, dispute_reason, disputed_at, resolution, resolved_at')
  const claimsByTxn = new Map((claims ?? []).map((c) => [c.transaction_id, c]))

  const { data: events } = await supabase.from('custody_events').select(`id, state, notes, created_at, actor_id, items ( id, name )`).order('created_at', { ascending: false }).limit(20)

  const ids = new Set<string>()
  events?.forEach((e) => e.actor_id && ids.add(e.actor_id))
  rentals?.forEach((r) => r.renter_id && ids.add(r.renter_id))
  returned?.forEach((r) => r.renter_id && ids.add(r.renter_id))

  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').in('id', Array.from(ids))
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const totalItems = items?.length ?? 0
  const inVault = items?.filter((i) => i.state === 'IN_VAULT').length ?? 0
  const rented = items?.filter((i) => i.state === 'RENTED').length ?? 0
  const openClaims = claims?.filter((c) => c.status === 'OPEN' || c.status === 'DISPUTED').length ?? 0

  return (
    <main className="max-w-6xl mx-auto p-8 space-y-10">
      <header>
        <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] mb-2 font-bold">Operator view</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Vault dashboard</h1>
        <p className="text-[#1E293B] mt-2 font-medium">Custody, verification, and audit at a glance.</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total items" value={totalItems} />
        <Stat label="In vault" value={inVault} />
        <Stat label="Rented" value={rented} />
        <Stat label="Open claims" value={openClaims} />
      </section>

      <section>
        <h2 className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-4 font-bold">Active rentals</h2>
        {!rentals || rentals.length === 0 ? (
          <EmptyState label="No active rentals right now." />
        ) : (
          <div className="bg-white border border-[#5C7FA8] rounded-xl divide-y divide-[#E2E8F0] shadow-sm">
            {rentals.map((r) => {
              const renter = r.renter_id ? profileMap.get(r.renter_id) : null
              const listing = r.listings as any
              const item = listing?.items
              return (
                <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#0F172A]">{item?.name ?? '—'}</p>
                    <p className="text-xs text-[#1E293B] mt-0.5 font-medium">{item?.category} · Grade {item?.grade}</p>
                    <p className="text-xs text-[#1E293B] mt-1 font-medium">Renter: <span className="font-mono text-[#0F172A] font-bold">{renter?.full_name ?? r.renter_id?.slice(0, 8) ?? '—'}</span></p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-xs font-mono text-[#1E293B] font-medium">{r.start_date} → {r.end_date}</p>
                      <p className="text-sm font-bold text-[#0F172A] mt-1">Escrow ₹{r.escrow_amount}</p>
                    </div>
                    <div className="w-full md:w-64">
                      <ReturnButton listingId={listing?.id} itemId={item?.id} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-4 font-bold">Recently returned — claims</h2>
        {!returned || returned.length === 0 ? (
          <EmptyState label="No returned rentals yet." />
        ) : (
          <div className="space-y-4">
            {returned.map((r) => {
              const listing = r.listings as any
              const item = listing?.items
              const events = (item?.custody_events ?? []).slice().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              const intakePhoto = events.find((e: any) => e.state === 'RENTED' && e.photo_url)?.photo_url
              const returnPhoto = events.find((e: any) => e.state === 'IN_VAULT' && e.photo_url)?.photo_url
              const renter = r.renter_id ? profileMap.get(r.renter_id) : null
              const claim = claimsByTxn.get(r.id) ?? null
              return (
                <ReturnedRentalRow
                  key={r.id} transactionId={r.id} itemName={item?.name ?? '—'} category={item?.category ?? ''} renterName={renter?.full_name ?? '—'}
                  startDate={r.start_date} endDate={r.end_date} escrowAmount={r.escrow_amount} intakePhoto={intakePhoto ?? null} returnPhoto={returnPhoto ?? null} claim={claim}
                />
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-4 font-bold">Vault inventory</h2>
        <div className="bg-white border border-[#5C7FA8] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-left border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-[#0F172A] font-bold">Item</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-[#0F172A] font-bold">Category</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-[#0F172A] font-bold">Grade</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-[#0F172A] font-bold">Serial</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-[#0F172A] font-bold text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {items?.map((it) => (
                <tr key={it.id}>
                  <td className="px-5 py-3 font-bold text-[#0F172A]">{it.name}</td>
                  <td className="px-5 py-3 text-[#1E293B] font-medium">{it.category}</td>
                  <td className="px-5 py-3 font-mono text-[#0F172A]">{it.grade ?? '—'}</td>
                  <td className="px-5 py-3 font-mono text-[#1E293B] text-xs">{it.serial_number ?? '—'}</td>
                  <td className="px-5 py-3 text-right"><StateBadge state={it.state} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-4 font-bold">Recent custody events</h2>
        {!events || events.length === 0 ? (
          <EmptyState label="No events recorded yet." />
        ) : (
          <div className="bg-white border border-[#5C7FA8] rounded-xl divide-y divide-[#E2E8F0] shadow-sm">
            {events.map((e) => {
              const actor = e.actor_id ? profileMap.get(e.actor_id) : null
              const item = e.items as any
              const isReturn = e.state === 'IN_VAULT'
              return (
                <div key={e.id} className="p-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isReturn ? 'bg-emerald-500' : 'bg-[#D97706]'}`} />
                    <div>
                      <p className="text-[#0F172A] font-bold">
                        {item?.name ?? '—'} {' → '} <span className="font-mono text-xs bg-[#E2E8F0] px-1.5 py-0.5 rounded text-[#0F172A]">{e.state}</span>
                      </p>
                      <p className="text-xs text-[#1E293B] mt-1 font-medium">{e.notes}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#0F172A] font-bold">{actor?.full_name ?? '—'}</p>
                    <p className="text-xs font-mono text-[#1E293B] mt-0.5">{new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[#5C7FA8] rounded-xl p-5 shadow-sm">
      <p className="text-xs font-mono uppercase tracking-widest text-[#1E293B] font-bold">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-[#0F172A] mt-2">{value}</p>
    </div>
  )
}

function StateBadge({ state }: { state: string | null }) {
  const s = state ?? 'UNKNOWN'
  const color = s === 'IN_VAULT' ? 'bg-emerald-100 text-emerald-800' : s === 'RENTED' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'
  return <span className={`inline-block text-xs font-mono font-bold px-2.5 py-1 rounded ${color}`}>{s}</span>
}

function EmptyState({ label }: { label: string }) {
  return <div className="bg-white border border-[#5C7FA8] rounded-xl p-8 text-center text-[#1E293B] font-medium shadow-sm">{label}</div>
} 