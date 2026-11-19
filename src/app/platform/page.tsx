import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import PlatformResolveButton from '@/components/PlatformResolveButton'

export const dynamic = 'force-dynamic'

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
    new Set(
      ((escalated ?? []) as unknown as EscalatedClaim[])
        .map((c) => c.transactions?.renter_id)
        .filter(Boolean),
    ),
  )

  const { data: profiles } = renterIds.length
    ? await supabase.from('profiles').select('id, username, full_name').in('id', renterIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))
  const claims = escalated as unknown as EscalatedClaim[] | null

  return (
    <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-8 md:py-10 space-y-8">
      <header>
        <p className="inline-block text-xs font-mono uppercase tracking-[0.18em] bg-[#0F172A] text-white px-3 py-1 rounded-full mb-3 font-bold shadow-sm">
          Platform Mediation
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A]">Escalated Claims</h1>
        <p className="text-[#0F172A]/85 mt-1.5 font-semibold text-base md:text-lg tabular-nums">
          {claims?.length ?? 0} case{(claims?.length ?? 0) === 1 ? '' : 's'} awaiting your final ruling.
        </p>
      </header>

      {!claims || claims.length === 0 ? (
        <div className="vault-card-3d rounded-3xl p-14 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-slate-900 font-bold text-xl mb-1">Inbox Zero</h3>
          <p className="text-slate-600 text-sm font-medium">There are no escalated claims requiring review right now.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {claims.map((c) => {
            const txn = c.transactions
            const item = txn?.listings?.items
            const renter = txn?.renter_id ? profileMap.get(txn.renter_id) : null

            return (
              <div key={c.id} className="vault-card-3d rounded-3xl overflow-hidden">
                <div className="bg-[#0F172A] p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold mb-0.5">
                        Case #{c.id.split('-')[0]}
                      </p>
                      <h2 className="text-xl md:text-2xl font-bold">{item?.name ?? 'Unknown Item'}</h2>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs font-mono text-indigo-300 mb-0.5">Escrow Disputed</p>
                    <p className="text-2xl md:text-3xl font-black tabular-nums">₹{c.damage_amount}</p>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-600 mb-2 font-bold">1. Operator Claim</p>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">{c.description || 'No description provided.'}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <p className="text-xs font-mono uppercase tracking-wider text-red-700 mb-2 font-bold">2. Renter Dispute</p>
                      <p className="text-sm text-red-900 font-medium leading-relaxed">{c.dispute_reason || 'No dispute reason provided.'}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <p className="text-xs font-mono uppercase tracking-wider text-amber-800 mb-2 font-bold">3. Renter Escalation</p>
                      <p className="text-sm text-amber-950 font-medium leading-relaxed">{c.escalation_reason || 'No escalation reason provided.'}</p>
                    </div>
                  </div>

                  {c.evidence && c.evidence.length > 0 && (
                    <div className="border-t border-slate-200 pt-5">
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-700 mb-3 font-bold">Submitted Evidence</p>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {c.evidence.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="relative shrink-0 rounded-xl overflow-hidden border border-slate-200 hover:opacity-85 transition-opacity"
                          >
                            <Image
                              src={url}
                              alt={`Evidence ${i + 1}`}
                              width={200}
                              height={200}
                              referrerPolicy="no-referrer"
                              className="w-32 h-32 object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-slate-600 font-mono border-b border-slate-200 pb-5 gap-2">
                    <p>Renter: <span className="text-slate-900 font-bold">{renter?.username || renter?.full_name || 'Unknown'}</span></p>
                    <p className="tabular-nums">{txn?.start_date} → {txn?.end_date}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
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