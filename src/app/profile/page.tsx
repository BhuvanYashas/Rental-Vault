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

  const roleConfig: Record<string, { label: string, color: string, icon: string }> = {
    renter: { label: 'Renter', color: 'bg-emerald-100 text-emerald-800', icon: '👤' },
    operator: { label: 'Vault Operator', color: 'bg-amber-100 text-amber-800', icon: '🛡️' },
    platform: { label: 'Platform Reviewer', color: 'bg-indigo-100 text-indigo-800', icon: '⚖️' },
  }
  const currentRole = roleConfig[profile?.role || 'renter'] || roleConfig.renter

  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-sm text-[#0F172A] hover:text-[#D97706] font-bold mb-8 inline-block transition-colors">
        ← Back to home
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A]">Your Profile</h1>
        <p className="text-[#1E293B] mt-2 font-medium text-lg">Manage your account and view recent activity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#5C7FA8]/40 rounded-3xl shadow-lg overflow-hidden relative">
            <div className="bg-[#0F172A] p-6 pb-12 flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center text-white text-4xl font-black shadow-inner border-4 border-[#0F172A] mb-4">
                {initial}
              </div>
              <h2 className="text-2xl font-bold text-white">{displayName}</h2>
              <p className="text-slate-400 text-sm mt-1">{user.email}</p>
            </div>
            
            <div className="p-6 pt-0 relative z-10 -mt-6 space-y-6">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-2">Account Role</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${currentRole.color}`}>
                  <span>{currentRole.icon}</span> {currentRole.label}
                </span>
              </div>
              
              <div className="flex justify-center">
                <ProfileEditForm initialUsername={displayName} initialAge={profile?.age?.toString() || ''} />
              </div>

              <div className="w-full">
                <KYCUpload currentStatus={profile?.kyc_status || 'unverified'} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-2">Age</p>
                <p className="text-lg font-bold text-[#0F172A]">{profile?.age ? `${profile.age} years old` : 'Not set'}</p>
              </div>
              <div className="bg-white border border-[#5C7FA8]/40 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-2">Member Since</p>
                <p className="text-lg font-bold text-[#0F172A]">
                  {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div>
              <WalletCard balance={profile?.wallet_balance || 0} />
            </div>
          </div>

          <div className="bg-white border border-[#5C7FA8]/40 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#0F172A] mb-4">Recent Activity</h3>
            {!activity || activity.length === 0 ? (
              <p className="text-sm text-[#1E293B] font-medium">No recent activity found.</p>
            ) : (
              <div className="space-y-4">
                {activity.map((e: any) => (
                  <div key={e.id} className="flex items-start gap-3 pb-3 border-b border-[#E2E8F0] last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${e.state === 'IN_VAULT' ? 'bg-emerald-500' : 'bg-[#D97706]'}`} />
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">{e.items?.name || 'Item'} → {e.state}</p>
                      <p className="text-xs text-[#1E293B] font-medium mt-0.5">{e.notes}</p>
                      <p className="text-[10px] text-[#5C7FA8] font-mono mt-1">{new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
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