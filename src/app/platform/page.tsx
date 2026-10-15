import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlatformResolveButton from '@/components/PlatformResolveButton'

export const dynamic = 'force-dynamic'

export default async function PlatformPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/platform')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'platform') redirect('/')

  const { data: escalated } = await supabase
    .from('claims')
    .select(`
      id,
      damage_amount,
      description,
      dispute_reason,
      disputed_at,
      escalation_reason,
      escalated_at,
      resolution,
      resolved_at,
      transactions (
        id,
        start_date,
        end_date,
        escrow_amount,
        renter_id,
        listings (
          items ( id, name, category )
        )
      )
    `)
    .eq('status', 'ESCALATED')
    .order('escalated_at', { ascending: true })

  const renterIds = Array.from(
    new Set((escalated ?? []).map((c: any) => c.transactions?.renter_id).filter(Boolean)),
  )

  const { data: profiles } = renterIds.length
    ? await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', renterIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-8">
      <header>
        <p className="text-xs font-mono uppercase tracking-widest text-amber-700 mb-2">
          Platform reviewer
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Escalated claims
        </h1>
        <p className="text-neutral-700 mt-2">
          {escalated?.length ?? 0} awaiting your ruling.
        </p>
      </header>

      {!escalated || escalated.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center text-neutral-500">
          No escalated claims right now.
        </div>
      ) : (
        <div className="space-y-6">
          {escalated.map((c: any) => {
            const txn = c.transactions
            const item = txn?.listings?.items
            const renter = txn?.renter_id ? profileMap.get(txn.renter_id) : null
            return (
              <div
                key={c.id}
                className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {item?.name ?? '—'}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {item?.category} · Renter:{' '}
                      <span className="font-mono">
                        {renter?.username ?? renter?.full_name ?? '—'}
                      </span>
                    </p>
                  </div>
                  <p className="text-lg font-bold text-neutral-900">
                    ₹{c.damage_amount}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-1">
                      Operator claim
                    </p>
                    <p className="text-neutral-800">
                      {c.description || '(no description)'}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs font-mono uppercase tracking-widest text-red-700 mb-1">
                      Renter dispute
                    </p>
                    <p className="text-red-900">
                      {c.dispute_reason || '(no reason provided)'}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-mono uppercase tracking-widest text-amber-800 mb-1">
                    Re-review request
                  </p>
                  <p className="text-amber-900 text-sm">
                    {c.escalation_reason || '(no reason provided)'}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <PlatformResolveButton claimId={c.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}