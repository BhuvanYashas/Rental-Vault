import Link from 'next/link'
import { Lock, Plus } from 'lucide-react'
import { createClient, hasSupabaseEnv } from '@/lib/supabase/server'
import UserNav from './UserNav'
import NotificationBell from './NotificationBell'

export default async function Header() {
  let user: { id: string; email?: string } | null = null
  let role: string | null = null
  let kycStatus: string | null = null
  let username = ''

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      user = data.user

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, username, full_name, kyc_status')
          .eq('id', user.id)
          .single()
        role = profile?.role ?? null
        kycStatus = profile?.kyc_status ?? null
        username = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'User'
      }
    } catch {
      user = null
    }
  }

  return (
    <header className="border-b border-white/10 shadow-lg bg-[#0F172A]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-extrabold tracking-tight text-white text-lg md:text-xl hover:text-[#FB923C] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded-lg px-1"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#F97316] to-[#EA580C] border border-white/25 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Lock className="w-4 h-4 stroke-[2.3]" aria-hidden="true" />
          </span>
          <span>Rental Vault</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-slate-200">
          <Link
            href="/"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded-md"
          >
            Browse
          </Link>
          {user && (
            <>
              <Link
                href="/my-rentals"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded-md"
              >
                My Rentals
              </Link>
              <Link
                href="/owner/dashboard"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded-md"
              >
                My Items
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {user ? (
            <>
              <Link
                href="/owner/new-item"
                className="hidden sm:inline-flex items-center gap-1.5 vault-btn-amber-3d text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Plus className="w-4 h-4 stroke-[2.3]" aria-hidden="true" />
                <span>List Item</span>
              </Link>
              <div className="flex items-center gap-3 pl-3 border-l border-white/15">
                <NotificationBell />
                <UserNav email={user.email ?? ''} username={username} role={role} kycStatus={kycStatus} />
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="vault-btn-amber-3d text-white px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Sign in / Join
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden border-t border-white/10 px-5 py-2 flex items-center gap-4 overflow-x-auto text-xs font-bold text-slate-200"
      >
        <Link href="/" className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1">
          Browse
        </Link>
        {user ? (
          <>
            <Link href="/my-rentals" className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1">
              My Rentals
            </Link>
            <Link href="/owner/dashboard" className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1">
              My Items
            </Link>
            <Link
              href="/owner/new-item"
              className="ml-auto text-[#FB923C] hover:text-white font-extrabold transition-colors whitespace-nowrap shrink-0 py-1"
            >
              + List Item
            </Link>
          </>
        ) : (
          <Link href="/login?mode=signup" className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1">
            Create Account
          </Link>
        )}
      </nav>
    </header>
  )
}