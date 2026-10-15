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
  const [username, setUsername] = useState('')
  const [age, setAge] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin',
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    if (mode === 'signup') {
      // Client-side validation
      const trimmedUsername = username.trim()
      if (trimmedUsername.length < 2) {
        setLoading(false)
        return setError('Username must be at least 2 characters')
      }

      const ageNum = parseInt(age, 10)
      if (!ageNum || ageNum < 13 || ageNum > 120) {
        setLoading(false)
        return setError('Enter a valid age between 13 and 120')
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: trimmedUsername,
            age: ageNum,
          },
        },
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
    <div className="w-full max-w-md">
      {/* Tab switcher */}
      <div className="bg-white/40 backdrop-blur-sm rounded-full p-1 flex mb-6 border border-white/50">
        <button
          type="button"
          onClick={() => {
            setMode('signin')
            setError(null)
          }}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition ${
            isSignin
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-700 hover:text-neutral-900'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError(null)
          }}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition ${
            !isSignin
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-700 hover:text-neutral-900'
          }`}
        >
          Create account
        </button>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-5"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {isSignin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            {isSignin
              ? 'Sign in to rent or manage items.'
              : 'Get started with the vault in under a minute.'}
          </p>
        </div>

        <div className="space-y-4">
          {!isSignin && (
            <>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={30}
                  placeholder="e.g. arjun_k"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  required
                  min={13}
                  max={120}
                  placeholder="e.g. 24"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 pr-10 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-900"
              >
                {showPassword ? (
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
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-lg py-3 font-medium transition disabled:opacity-50 ${
            isSignin
              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
        >
          {loading
            ? 'Please wait…'
            : isSignin
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Suspense fallback={<div className="text-neutral-600">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}