import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UserNav from './UserNav'
import NotificationBell from './NotificationBell'

export default async function Header() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role: string | null = null
  let username: string = ''

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username, full_name')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? null
    username = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'User'
  }

  return (
    <header className="border-b border-[#0F172A] bg-[#0F172A] shadow-lg sticky top-0 z-50">
      <div className="w-full px-6 md:px-10 py-3 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <Link 
          href="/" 
          className="font-extrabold tracking-tight text-white text-lg md:text-xl hover:text-[#D97706] transition-colors whitespace-nowrap focus:outline-none"
        >
          Rental Vault
        </Link>

        {/* Right Side: Nav Links + User Profile */}
        <div className="flex items-center gap-6 md:gap-8">
          
          {/* Main Nav Links */}
          <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium">
            <Link 
              href="/" 
              className="text-white hover:text-[#D97706] transition-colors hidden sm:block focus:outline-none"
            >
              Browse
            </Link>

            {user && (
              <Link
                href="/owner/new-item"
                className="text-[#D97706] font-bold hover:text-[#B45309] transition-colors whitespace-nowrap hidden sm:block focus:outline-none"
              >
                + List Item
              </Link>
            )}
          </nav>

          {/* Divider & User Account Section */}
          {user ? (
            <div className="flex items-center gap-4 pl-6 md:pl-8 border-l border-white/20">
              <NotificationBell />
              <UserNav email={user.email!} username={username} role={role} />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-white hover:text-[#D97706] transition-colors focus:outline-none"
              >
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                className="bg-[#D97706] text-white px-5 py-2 rounded-lg hover:bg-[#B45309] transition shadow-sm text-sm font-bold focus:outline-none"
              >
                Sign up
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  )
}