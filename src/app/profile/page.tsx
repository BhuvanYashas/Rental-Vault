import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from '@/components/ProfileEditForm'
import KYCUpload from '@/components/KYCUpload'
import WalletCard from '@/components/WalletCard'

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

  const { data: activity } = await supabase
    .from('custody_events')
    .select(`id, state, notes, created_at, items ( name )`)
    .eq('actor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const displayName = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  const roleConfig: Record<string, { label: string; color: string }> = {
    renter: { label: 'Renter', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    operator: { label: 'Vault Operator', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    platform: { label: 'Platform Reviewer', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  }
  const currentRole = roleConfig[profile?.role || 'renter'] || roleConfig.renter

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-10">
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
            <div className="bg-[#0F172A] p-6 pb-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center text-white text-3xl font-black border-4 border-[#0F172A] mb-3">
                {initial}
              </div>
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
              <p className="text-slate-300 text-sm mt-0.5">{user.email}</p>
            </div>

            <div className="p-6 pt-0 -mt-5 space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                  Account Role
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border ${currentRole.color}`}>
                  {currentRole.label}
                </span>
              </div>

              <ProfileEditForm initialUsername={displayName} initialAge={profile?.age?.toString() || ''} />

              <KYCUpload currentStatus={profile?.kyc_status || 'unverified'} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <WalletCard balance={profile?.wallet_balance || 0} />

          <div className="grid grid-cols-2 gap-4">
            <div className="vault-card-3d rounded-2xl p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">Age</p>
              <p className="text-xl font-bold text-[#0F172A] tabular-nums">
                {profile?.age ? `${profile.age} years old` : 'Not set'}
              </p>
            </div>
            <div className="vault-card-3d rounded-2xl p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">Member Since</p>
              <p className="text-xl font-bold text-[#0F172A]">
                {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="vault-card-3d rounded-3xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
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
                    <p className="text-xs text-slate-500 font-mono shrink-0">
                      {new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}