import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import PlatformResolveButton from '@/components/PlatformResolveButton'

export const dynamic = 'force-dynamic'

// === STRICT TYPES ===
type EscalatedClaim = {
  id: string
  damage_amount: number
  description: string | null
  dispute_reason: string | null
  escalation_reason: string | null
  evidence: string[] | null
  transactions: {
    id: string
    start_date: string
    end_date: string
    escrow_amount: number
    renter_id: string
    listings: {
      items: {
        id: string
        name: string
        category: string
      }
    }
  }
}

export default async function PlatformPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/platform')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'platform') redirect('/')

  // 👇 1. ADDED "evidence" TO THE QUERY
  const { data: escalated } = await supabase
    .from('claims')
    .select(`
      id, damage_amount, description, dispute_reason, disputed_at,
      escalation_reason, escalated_at, evidence,
      transactions (
        id, start_date, end_date, escrow_amount, renter_id,
        listings ( items ( id, name, category ) )
      )
    `)
    .eq('status', 'ESCALATED')
    .order('escalated_at', { ascending: true })

  const renterIds = Array.from(
    new Set((escalated ?? []).map((c: any) => c.transactions?.renter_id).filter(Boolean)),
  )

  const { data: profiles } = renterIds.length
    ? await supabase.from('profiles').select('id, username, full_name').in('id', renterIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const claims = escalated as unknown as EscalatedClaim[] | null

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-10">
      <header>
        <p className="text-xs font-mono uppercase tracking-widest text-indigo-600 mb-2 font-bold">Platform Mediation</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A]">Escalated Claims</h1>
        <p className="text-[#1E293B] mt-2 font-medium text-lg">
          {claims?.length ?? 0} case{(claims?.length ?? 0) === 1 ? '' : 's'} awaiting your final ruling.
        </p>
      </header>

      {!claims || claims.length === 0 ? (
        <div className="bg-white/50 border-2 border-dashed border-[#5C7FA8]/30 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4 border border-[#E2E8F0]">
             <svg className="w-8 h-8 text-[#5C7FA8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-[#0F172A] font-bold text-xl mb-1">Inbox Zero</h3>
          <p className="text-[#1E293B] font-medium">There are no escalated claims requiring review right now.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {claims.map((c) => {
            const txn = c.transactions
            const item = txn?.listings?.items
            const renter = txn?.renter_id ? profileMap.get(txn.renter_id) : null
            
            return (
              <div key={c.id} className="bg-white border border-[#5C7FA8]/40 rounded-3xl shadow-lg overflow-hidden">
                
                {/* Header */}
                <div className="bg-[#0F172A] p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                     </div>
                     <div>
                       <p className="text-xs font-mono uppercase tracking-widest text-indigo-300 font-bold mb-1">Case #{c.id.split('-')[0]}</p>
                       <h2 className="text-2xl font-bold">{item?.name ?? 'Unknown Item'}</h2>
                     </div>
                  </div>
                  <div className="text-left md:text-right">
                     <p className="text-xs font-mono text-indigo-300 mb-1">Escrow Disputed</p>
                     <p className="text-3xl font-black">₹{c.damage_amount}</p>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  
                  {/* The 3 Perspectives */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0]">
                      <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">1. Operator Claim</p>
                      <p className="text-sm text-[#0F172A] font-medium leading-relaxed">{c.description || 'No description provided.'}</p>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                      <p className="text-xs font-mono uppercase tracking-widest text-red-700 mb-2 font-bold">2. Renter Dispute</p>
                      <p className="text-sm text-red-900 font-medium leading-relaxed">{c.dispute_reason || 'No dispute reason provided.'}</p>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                      <p className="text-xs font-mono uppercase tracking-widest text-amber-700 mb-2 font-bold">3. Renter Escalation</p>
                      <p className="text-sm text-amber-900 font-medium leading-relaxed">{c.escalation_reason || 'No escalation reason provided.'}</p>
                    </div>
                  </div>

                  {/* 👇 2. THE EVIDENCE GALLERY */}
                  {c.evidence && c.evidence.length > 0 && (
                    <div className="border-t border-[#E2E8F0] pt-6">
                      <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-3 font-bold">Submitted Evidence</p>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {c.evidence.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="relative shrink-0 rounded-xl overflow-hidden border border-[#E2E8F0] hover:opacity-80 transition-opacity">
                            <Image 
                              src={url} 
                              alt={`Evidence ${i + 1}`} 
                              width={200} 
                              height={200} 
                              className="w-32 h-32 object-cover" 
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-[#5C7FA8] font-mono border-b border-[#E2E8F0] pb-6 gap-2">
                    <p>Renter: <span className="text-[#0F172A] font-bold">{renter?.username || renter?.full_name || 'Unknown'}</span></p>
                    <p>{txn?.start_date} → {txn?.end_date}</p>
                  </div>

                  {/* Ruling Section */}
                  <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0]">
                    <PlatformResolveButton claimId={c.id} />
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}