import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link href="/" className="text-sm text-[#0F172A] hover:text-[#D97706] font-bold mb-8 inline-block transition">
        ← Back to listings
      </Link>

      <div className="bg-white border border-[#5C7FA8] rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Your Profile</h1>
        <p className="text-[#1E293B] font-medium mb-8">Manage your account details.</p>

        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
            <span className="text-[#1E293B] font-medium">Email</span>
            <span className="font-mono text-[#0F172A] font-bold">{user.email}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
            <span className="text-[#1E293B] font-medium">Username</span>
            <span className="font-mono text-[#0F172A] font-bold">{profile?.username || 'Not set'}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
            <span className="text-[#1E293B] font-medium">Age</span>
            <span className="font-mono text-[#0F172A] font-bold">{profile?.age || 'Not set'}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
            <span className="text-[#1E293B] font-medium">Account Role</span>
            <span className="font-mono font-bold uppercase px-2 py-1 rounded bg-[#E2E8F0] text-[#0F172A]">
              {profile?.role}
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}