'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/my-rentals'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>(
  searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: email.split('@')[0] } },
      })
      setLoading(false)
      if (error) return setError(error.message)
      router.push(redirect)
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setError(error.message)
    router.push(redirect)
    router.refresh()
  }

  const isSignin = mode === 'signin'

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 bg-white p-6 rounded-lg border border-neutral-200 shadow-sm"
    >
      <h1 className="text-2xl font-semibold text-neutral-900">
        {isSignin ? 'Sign in' : 'Create account'}
      </h1>

      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-neutral-300 rounded px-3 py-2 text-neutral-900 placeholder:text-neutral-400"
      />

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          required
          minLength={6}
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-neutral-900 placeholder:text-neutral-400"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-900"
        >
          {showPassword ? (
            // Eye-off icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            // Eye icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-neutral-900 text-white rounded py-2 font-medium hover:bg-neutral-800 disabled:opacity-50"
      >
        {loading ? 'Please wait…' : isSignin ? 'Sign in' : 'Sign up'}
      </button>

      <button
        type="button"
        onClick={() => {
          setError(null)
          setMode(isSignin ? 'signup' : 'signin')
        }}
        className="w-full text-sm text-blue-600 hover:text-blue-800 hover:underline"
      >
        {isSignin
          ? "Don't have an account? Create one"
          : 'Already have an account? Sign in'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-neutral-500">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}