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
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold tracking-tight text-neutral-900"
        >
          Rental Vault
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-600 hover:text-neutral-900">
            Browse
          </Link>

          {user ? (
            <>
              <Link
                href="/my-rentals"
                className="text-neutral-600 hover:text-neutral-900"
              >
                My Rentals
              </Link>
              {role === 'operator' && (
                <Link
                  href="/operator"
                  className="text-amber-600 hover:text-amber-800 font-medium"
                >
                  Dashboard
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-neutral-600 hover:text-neutral-900"
              >
                Sign in
              </Link>
              
            </>
          )}
        </nav>
      </div>
    </header>
  )
}