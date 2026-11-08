import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ReturnedRentalRow from '@/components/ReturnedRentalRow'
import ReturnButton from '@/components/ReturnButton'
import ApproveListingButton from '@/components/ApproveListingButton'
import ChatButton from '@/components/ChatButton'
import KycReviewRow from '@/components/KycReviewRow'

export const dynamic = 'force-dynamic'

export default async function OperatorPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/operator')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'operator') redirect('/')

  const { data: items } = await supabase.from('items').select('id, name, category, grade, state, serial_number').order('name')
  
  const { data: pendingKyc } = await supabase
    .from('profiles')
    .select('id, full_name, username, kyc_status, created_at')
    .eq('kyc_status', 'pending')

  const { data: pendingListings } = await supabase
    .from('listings')
    .select(`
      id, rate_per_day, deposit,
      items ( id, name, category, photos, owner_id )
    `)
    .eq('active', false)
    .order('created_at', { ascending: false })

  const { data: rentals } = await supabase.from('transactions').select(`id, start_date, end_date, escrow_amount, renter_id, created_at, listings ( id, rate_per_day, items ( id, name, category, grade ) )`).eq('status', 'ACTIVE').order('created_at', { ascending: false })
  
  const { data: returned } = await supabase
    .from('transactions')
    .select(`
      id, start_date, end_date, escrow_amount, renter_id, created_at, 
      listings ( id, items ( id, name, category, custody_events ( id, state, photo_url, created_at ) ) )
    `)
    .eq('status', 'RETURNED')
    .order('created_at', { ascending: false })
    .limit(20)
  
  // Fetch reviews separately for the returned items
  let reviewMap = new Map()
  if (returned && returned.length > 0) {
    const txnIds = returned.map(r => r.id)
    const { data: reviews } = await supabase
      .from('reviews')
      .select('transaction_id, rating')
      .in('transaction_id', txnIds)
      
    if (reviews) {
      reviewMap = new Map(reviews.map(r => [r.transaction_id, r]))
    }
  }
  
  const { data: claims } = await supabase
    .from('claims')
    .select('id, transaction_id, damage_amount, description, status, dispute_reason, disputed_at, resolution, resolved_at, escalation_reason, escalated_at, platform_resolution, platform_notes, platform_resolved_at')
  
  const claimsByTxn = new Map((claims ?? []).map((c) => [c.transaction_id, c]))

  const { data: events } = await supabase.from('custody_events').select(`id, state, notes, created_at, actor_id, items ( id, name )`).order('created_at', { ascending: false }).limit(20)

  const ids = new Set<string>()
  events?.forEach((e) => e.actor_id && ids.add(e.actor_id))
  rentals?.forEach((r) => r.renter_id && ids.add(r.renter_id))
  returned?.forEach((r) => r.renter_id && ids.add(r.renter_id))
  pendingListings?.forEach((p: any) => p.items?.owner_id && ids.add(p.items.owner_id))

  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').in('id', Array.from(ids))
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const totalItems = items?.length ?? 0
  const inVault = items?.filter((i) => i.state === 'IN_VAULT').length ?? 0
  const rented = items?.filter((i) => i.state === 'RENTED').length ?? 0
  const openClaims = claims?.filter((c) => c.status === 'OPEN' || c.status === 'DISPUTED' || c.status === 'ESCALATED').length ?? 0

  return (
    <main className="max-w-6xl mx-auto p-8 space-y-12">
      
      <header>
        <div className="inline-block bg-[#D97706] text-white px-3 py-1 rounded-md text-xs font-mono uppercase tracking-widest font-bold mb-3 shadow-sm">
          Operator view
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A]">Vault Command Center</h1>
        <p className="text-[#1E293B] mt-2 font-medium text-lg">Custody, verification, and audit at a glance.</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard label="Total items" value={totalItems} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        <StatCard label="In vault" value={inVault} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
        <StatCard label="Rented" value={rented} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <StatCard label="Open claims" value={openClaims} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
          Pending KYC Verifications
          {pendingKyc && pendingKyc.length > 0 && (
            <span className="bg-red-500 text-white text-xs py-0.5 px-2.5 rounded-full animate-pulse">{pendingKyc.length}</span>
          )}
        </h2>
        
        {!pendingKyc || pendingKyc.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-[#5C7FA8]/30 rounded-2xl p-8 text-center text-[#1E293B] font-medium">
            No pending KYC verifications.
          </div>
        ) : (
          <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl divide-y divide-[#E2E8F0] shadow-sm overflow-hidden">
            {pendingKyc.map((person) => (
              <KycReviewRow key={person.id} person={person} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
          Pending Approvals
          {pendingListings && pendingListings.length > 0 && (
            <span className="bg-[#D97706] text-white text-xs py-0.5 px-2.5 rounded-full animate-pulse">{pendingListings.length}</span>
          )}
        </h2>
        
        {!pendingListings || pendingListings.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-[#5C7FA8]/30 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-3 border border-[#E2E8F0]">
               <svg className="w-6 h-6 text-[#5C7FA8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-[#0F172A] font-bold text-lg">All caught up!</p>
            <p className="text-[#1E293B] font-medium mt-1">No items waiting for approval.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingListings.map((listing: any) => {
              const item = listing.items
              const owner = item?.owner_id ? profileMap.get(item.owner_id) : null
              return (
                <div key={listing.id} className="bg-white border border-[#5C7FA8]/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    {item?.photos?.[0] ? (
                      <Image src={item.photos[0]} alt={item.name} width={64} height={64} className="w-16 h-16 object-cover rounded-xl border border-[#E2E8F0]" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#5C7FA8]">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#0F172A] text-lg">{item?.name ?? 'Unknown Item'}</p>
                      <p className="text-xs text-[#1E293B] font-medium mt-0.5">{item?.category} · Owner: {owner?.full_name ?? 'Unknown'}</p>
                      <p className="text-sm font-bold text-[#0F172A] mt-2 bg-[#F1F5F9] inline-block px-2 py-1 rounded">₹{listing.rate_per_day}/day · Dep ₹{listing.deposit}</p>
                    </div>
                  </div>
                  <div>
                    <ApproveListingButton listingId={listing.id} itemId={item?.id} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Active Rentals</h2>
        
        {!rentals || rentals.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-[#5C7FA8]/30 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-3 border border-[#E2E8F0]">
               <svg className="w-6 h-6 text-[#5C7FA8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-[#0F172A] font-bold text-lg">Vault is quiet</p>
            <p className="text-[#1E293B] font-medium mt-1">No active rentals right now.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl divide-y divide-[#E2E8F0] shadow-sm overflow-hidden">
            {rentals.map((r) => {
              const renter = r.renter_id ? profileMap.get(r.renter_id) : null
              const listing = r.listings as any
              const item = listing?.items
              return (
                <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-[#F8FAFC]/50 transition-colors">
                  <div>
                    <p className="font-bold text-[#0F172A] text-lg">{item?.name ?? '—'}</p>
                    <p className="text-xs text-[#1E293B] mt-1 font-medium bg-[#F1F5F9] inline-block px-2 py-1 rounded">{item?.category} · Grade {item?.grade}</p>
                    <p className="text-sm text-[#1E293B] mt-2 font-medium">Renter: <span className="font-bold text-[#0F172A]">{renter?.full_name ?? r.renter_id?.slice(0, 8) ?? '—'}</span></p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0F172A]">Escrow ₹{r.escrow_amount}</p>
                      <p className="text-xs text-[#1E293B] font-medium mt-1">{r.start_date} → {r.end_date}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-64">
                      <ChatButton transactionId={r.id} itemName={item?.name || 'Item'} />
                      <ReturnButton 
                        listingId={listing?.id} 
                        itemId={item?.id} 
                        endDate={r.end_date}
                        ratePerDay={listing?.rate_per_day || 0}
                        itemName={item?.name || 'Item'}
                        renterName={renter?.full_name || 'Renter'}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Recently Returned — Claims</h2>
        
        {!returned || returned.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-[#5C7FA8]/30 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-3 border border-[#E2E8F0]">
               <svg className="w-6 h-6 text-[#5C7FA8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-[#0F172A] font-bold text-lg">No returns yet</p>
            <p className="text-[#1E293B] font-medium mt-1">Returned items will appear here for claim review.</p>
          </div>
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
              
              // Get review from our Map
              const review = reviewMap.get(r.id) || null

              return (
                <ReturnedRentalRow
                  key={r.id} 
                  transactionId={r.id} 
                  itemName={item?.name ?? '—'} 
                  category={item?.category ?? ''} 
                  renterName={renter?.full_name ?? '—'}
                  startDate={r.start_date} 
                  endDate={r.end_date} 
                  escrowAmount={r.escrow_amount} 
                  intakePhoto={intakePhoto ?? null} 
                  returnPhoto={returnPhoto ?? null} 
                  claim={claim}
                  review={review} 
                />
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Vault Inventory</h2>
        <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-150">
              <thead className="bg-[#F8FAFC] text-left border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#1E293B] font-bold">Item</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#1E293B] font-bold">Category</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#1E293B] font-bold">Grade</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#1E293B] font-bold">Serial</th>
                  <th className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#1E293B] font-bold text-right">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {items?.map((it) => (
                  <tr key={it.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#0F172A] group-hover:text-[#D97706] transition-colors">{it.name}</td>
                    <td className="px-6 py-4 text-[#1E293B] font-medium">
                      <span className="bg-[#F1F5F9] px-2.5 py-1 rounded-md text-xs font-bold text-[#0F172A]">{it.category}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[#0F172A]">{it.grade ?? '—'}</td>
                    <td className="px-6 py-4 font-mono text-[#1E293B] text-xs">{it.serial_number ?? '—'}</td>
                    <td className="px-6 py-4 text-right"><StateBadge state={it.state} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Recent Custody Events</h2>
        
        {!events || events.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-[#5C7FA8]/30 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-3 border border-[#E2E8F0]">
               <svg className="w-6 h-6 text-[#5C7FA8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-[#0F172A] font-bold text-lg">No activity yet</p>
            <p className="text-[#1E293B] font-medium mt-1">Events will be logged here as items are rented and returned.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl divide-y divide-[#E2E8F0] shadow-sm overflow-hidden">
            {events.map((e) => {
              const actor = e.actor_id ? profileMap.get(e.actor_id) : null
              const item = e.items as any
              const isReturn = e.state === 'IN_VAULT'
              return (
                <div key={e.id} className="p-5 flex items-center justify-between text-sm hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`w-3 h-3 rounded-full shadow-sm ${isReturn ? 'bg-emerald-500' : 'bg-[#D97706]'}`} />
                    <div>
                      <p className="text-[#0F172A] font-bold text-base">
                        {item?.name ?? '—'} <span className="text-[#5C7FA8] font-normal mx-1">→</span> 
                        <span className="font-mono text-xs bg-[#F1F5F9] px-2 py-1 rounded-md text-[#0F172A] border border-[#E2E8F0] ml-1">{e.state}</span>
                      </p>
                      <p className="text-xs text-[#1E293B] mt-1 font-medium">{e.notes}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#0F172A] font-bold">{actor?.full_name ?? '—'}</p>
                    <p className="text-xs font-mono text-[#5C7FA8] mt-1">{new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
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

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] hover:border-[#0F172A]/30 transition-all duration-300 ease-out cursor-default group relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="relative z-10 flex items-center justify-between mb-4">
        <p className="text-xs font-mono uppercase tracking-widest text-[#1E293B] font-bold group-hover:text-[#0F172A] transition-colors">{label}</p>
        <div className="text-[#5C7FA8] group-hover:text-[#D97706] group-hover:scale-110 transition-all duration-300">{icon}</div>
      </div>
      <p className="relative z-10 text-4xl font-extrabold tracking-tight text-[#0F172A]">{value}</p>
    </div>
  )
}

function StateBadge({ state }: { state: string | null }) {
  const s = state ?? 'UNKNOWN'
  const color = s === 'IN_VAULT' ? 'bg-emerald-100 text-emerald-800' : s === 'RENTED' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-full ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s === 'IN_VAULT' ? 'bg-emerald-600' : s === 'RENTED' ? 'bg-amber-600' : 'bg-neutral-500'}`}></span>
      {s}
    </span>
  )
}