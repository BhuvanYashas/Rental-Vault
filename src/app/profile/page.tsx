import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from '@/components/ProfileEditForm'
import KYCUpload from '@/components/KYCUpload'
import WalletCard from '@/components/WalletCard'

import TiltCard from '@/components/TiltCard'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, age, role, kyc_status, wallet_balance, created_at')
    .eq('id', user.id)
    .single()

  const [{ data: activity }, { data: walletTxns }] = await Promise.all([
    supabase
      .from('custody_events')
      .select(`id, state, notes, created_at, items ( name )`)
      .eq('actor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('wallet_transactions')
      .select('id, amount, type, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const displayName = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  const roleConfig: Record<string, { label: string; color: string }> = {
    renter: { label: 'Renter', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    operator: { label: 'Vault Operator', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    platform: { label: 'Platform Reviewer', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  }
  const currentRole = roleConfig[profile?.role || 'renter'] || roleConfig.renter

  return (
    <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-8 md:py-10">
      <Link href="/" className="text-sm text-[#0F172A] hover:text-white font-bold mb-6 inline-block transition-colors">
        ← Back to home
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A]">Your Profile</h1>
        <p className="text-[#0F172A]/85 mt-1 font-semibold">Manage your account, identity verification, and wallet.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="vault-card-3d rounded-3xl overflow-hidden">
            <div className="vault-title-header-3d p-6 pb-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#F97316] to-[#EA580C] flex items-center justify-center text-white text-3xl font-black border-4 border-[#0F172A] shadow-[0_6px_0_0_#9A3412,0_12px_24px_-4px_rgba(234,88,12,0.55)] mb-3">
                {initial}
              </div>
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
              <p className="text-slate-300 text-sm mt-0.5">{user.email}</p>
            </div>

            <div className="p-6 pt-0 -mt-5 space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_8px_18px_-6px_rgba(15,23,42,0.2)] text-center">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                  Account Role
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border ${currentRole.color}`}>
                  {currentRole.label}
                </span>
              </div>

              <ProfileEditForm initialUsername={displayName} initialAge={profile?.age?.toString() || ''} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <KYCUpload currentStatus={profile?.kyc_status || 'unverified'} />

          <TiltCard maxTilt={4}>
            <WalletCard balance={profile?.wallet_balance || 0} />
          </TiltCard>

          <div className="grid grid-cols-2 gap-4">
            <TiltCard maxTilt={5}>
              <div className="vault-card-3d rounded-2xl p-5 h-full">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">Age</p>
                <p className="text-xl font-bold text-[#0F172A] tabular-nums">
                  {profile?.age ? `${profile.age} years old` : 'Not set'}
                </p>
              </div>
            </TiltCard>
            <TiltCard maxTilt={5}>
              <div className="vault-card-3d rounded-2xl p-5 h-full">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">Member Since</p>
                <p className="text-xl font-bold text-[#0F172A]">
                  {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </TiltCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="vault-card-3d rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Wallet Transaction Ledger</h3>
                <span className="text-xs font-mono font-bold text-slate-500 tabular-nums">
                  {walletTxns?.length ?? 0} entries
                </span>
              </div>
              {!walletTxns || walletTxns.length === 0 ? (
                <p className="text-sm text-slate-600 font-medium">No wallet transactions recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {walletTxns.map((tx) => {
                    const isCredit = Number(tx.amount) >= 0
                    const absAmount = Math.abs(Number(tx.amount))
                    return (
                      <div key={tx.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {tx.type}
                            </span>
                            <span className="text-xs text-slate-500 font-mono tabular-nums">
                              {new Date(tx.created_at).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                            {tx.description || 'Wallet movement'}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-extrabold font-mono shrink-0 tabular-nums ${
                            isCredit ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {isCredit ? `+₹${absAmount}` : `-₹${absAmount}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="vault-card-3d rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Custody Activity</h3>
              {!activity || activity.length === 0 ? (
                <p className="text-sm text-slate-600 font-medium">No recent activity found.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {(activity as unknown as Array<{
                    id: string
                    state: string
                    notes: string | null
                    created_at: string
                    items?: { name?: string } | null
                  }>).map((e) => (
                    <div key={e.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {e.items?.name || 'Item'} · <span className="font-mono text-xs text-slate-600">{e.state}</span>
                        </p>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{e.notes}</p>
                      </div>
                      <p className="text-xs text-slate-500 font-mono shrink-0 tabular-nums">
                        {new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}