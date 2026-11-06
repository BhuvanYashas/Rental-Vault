import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from './SignOutButton'

export default async function Header() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? null
  }

  return (
    <header className="border-b border-[#0F172A] bg-[#0F172A] shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
        
        {/* Logo - prevents wrapping */}
        <Link
          href="/"
          className="font-extrabold tracking-tight text-white text-lg md:text-xl hover:text-[#D97706] transition-colors whitespace-nowrap"
        >
          Rental Vault
        </Link>

        {/* Nav Links - smaller text and gaps on mobile */}
        <nav className="flex items-center gap-3 md:gap-5 text-xs md:text-sm font-medium overflow-x-auto">
          <Link href="/" className="px-2 py-1.5 text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap">
            Browse
          </Link>

          {user ? (
            <>
              <Link
                href="/my-rentals"
                className="px-2 py-1.5 text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap hidden sm:block"
              >
                Rentals
              </Link>
              
              <Link
                href="/owner/dashboard"
                className="px-2 py-1.5 text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap hidden sm:block"
              >
                Items
              </Link>

              <Link
                href="/owner/new-item"
                className="px-2 py-1.5 text-[#D97706] font-bold hover:bg-[#D97706]/10 rounded-lg transition-colors whitespace-nowrap"
              >
                + List
              </Link>

              {role === 'operator' && (
                <Link
                  href="/operator"
                  className="px-2 py-1.5 text-[#D97706] font-bold hover:bg-[#D97706]/10 rounded-lg transition-colors whitespace-nowrap ml-1"
                >
                  Operator
                </Link>
              )}
              
              <div className="ml-1 pl-3 border-l border-white/20 whitespace-nowrap">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2 py-1.5 text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
              >
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                className="bg-[#D97706] text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg hover:bg-[#B45309] transition shadow-sm font-bold whitespace-nowrap ml-1"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}