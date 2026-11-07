import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/profile')

  // Fetch the extended profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, age, role, created_at')
    .eq('id', user.id)
    .single()

  // Fallback to email prefix if username is somehow missing
  const displayName = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  // Role badge styling
  const roleConfig: Record<string, { label: string, color: string, icon: string }> = {
    renter: { label: 'Renter', color: 'bg-emerald-100 text-emerald-800', icon: '👤' },
    operator: { label: 'Vault Operator', color: 'bg-amber-100 text-amber-800', icon: '🛡️' },
    platform: { label: 'Platform Reviewer', color: 'bg-indigo-100 text-indigo-800', icon: '⚖️' },
  }

  const currentRole = roleConfig[profile?.role || 'renter'] || roleConfig.renter

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link
        href="/"
        className="text-sm text-[#0F172A] hover:text-[#D97706] font-bold mb-8 inline-block transition-colors"
      >
        ← Back to home
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A]">
          Your Profile
        </h1>
        <p className="text-[#1E293B] mt-2 font-medium text-lg">
          Manage your account details and view your current role.
        </p>
      </header>

      <div className="bg-white border border-[#5C7FA8]/40 rounded-3xl shadow-lg overflow-hidden relative">
        
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Profile Header Banner */}
        <div className="bg-[#0F172A] p-8 pb-12 relative z-10 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center text-white text-4xl font-black shadow-inner border-4 border-[#0F172A]">
            {initial}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{displayName}</h2>
            <p className="text-slate-400 font-medium mt-1">{user.email}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8 pt-0 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-6">
            
            {/* Role Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-2">Account Role</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${currentRole.color}`}>
                <span>{currentRole.icon}</span>
                {currentRole.label}
              </span>
            </div>

            {/* Member Since Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-2">Member Since</p>
              <p className="text-lg font-bold text-[#0F172A]">
                {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Age Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-2">Age</p>
              <p className="text-lg font-bold text-[#0F172A]">
                {profile?.age ? `${profile.age} years old` : 'Not provided'}
              </p>
            </div>

            {/* Verification Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-mono uppercase tracking-widest text-[#5C7FA8] font-bold mb-2">Account Status</p>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-100 text-emerald-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verified
              </span>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex justify-end">
            {/* We can use the SignOutButton component here if imported, or just a simple link to home */}
            <Link
              href="/my-rentals"
              className="bg-[#0F172A] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#1E293B] transition-colors shadow-sm"
            >
              View My Rentals →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}