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
    <header className="border-b border-[#0F172A] bg-[#0F172A] shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold tracking-tight text-white text-lg"
        >
          Rental Vault
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          {/* Changed text to white, hover to amber */}
          <Link href="/" className="text-white hover:text-[#D97706] transition">
            Browse
          </Link>

          {user ? (
            <>
              <Link
                href="/my-rentals"
                className="text-white hover:text-[#D97706] transition"
              >
                My Rentals
              </Link>
              {role === 'operator' && (
                <Link
                  href="/operator"
                  className="text-[#D97706] font-bold hover:text-[#B45309] transition"
                >
                  Dashboard
                </Link>
              )}
              {role === 'platform' && (
                <Link
                  href="/platform"
                  className="text-[#D97706] font-bold hover:text-[#B45309] transition"
                >
                  Platform
                </Link>
              )}
              <div className="ml-2 border-l border-white/20 pl-4">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white hover:text-[#D97706] transition"
              >
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                className="bg-[#D97706] text-white px-4 py-2 rounded-lg hover:bg-[#B45309] transition shadow-sm"
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