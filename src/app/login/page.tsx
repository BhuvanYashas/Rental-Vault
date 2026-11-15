'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient, hasSupabaseBrowserEnv } from '@/lib/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect') || '/my-rentals'
  const redirect = rawRedirect.startsWith('/') ? rawRedirect : '/my-rentals'
  const urlMode = searchParams.get('mode')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [age, setAge] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [modeOverride, setModeOverride] = useState<{
    forUrlMode: string | null
    value: 'signin' | 'signup' | 'forgot'
  } | null>(null)

  const mode: 'signin' | 'signup' | 'forgot' =
    modeOverride && modeOverride.forUrlMode === urlMode
      ? modeOverride.value
      : urlMode === 'signup'
      ? 'signup'
      : 'signin'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [cookieBlocked, setCookieBlocked] = useState(false)

  function selectMode(next: 'signin' | 'signup' | 'forgot') {
    setModeOverride({ forUrlMode: urlMode, value: next })
    setError(null)
    setMessage(null)
    setCookieBlocked(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setCookieBlocked(false)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return setError('Please enter a valid email address.')
    }

    if (mode === 'signup') {
      const trimmedUsername = username.trim()
      if (trimmedUsername.length < 2) {
        return setError('Username must be at least 2 characters.')
      }

      const ageNum = parseInt(age, 10)
      if (!ageNum || ageNum < 13 || ageNum > 120) {
        return setError('Please enter a valid age between 13 and 120.')
      }

      if (password.length < 6) {
        return setError('Password must be at least 6 characters.')
      }
    } else if (mode === 'signin' && password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }

    setLoading(true)

    try {
      if (mode === 'forgot') {
        if (!hasSupabaseBrowserEnv()) {
          setError('Supabase environment variables are missing.')
          return
        }
        const supabase = createClient()
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/update-password`,
        })
        if (resetError) {
          setError(resetError.message)
          return
        }
        setMessage('Check your email for a password reset link!')
        return
      }

      if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            password,
            username: username.trim(),
            age: parseInt(age, 10),
            origin: window.location.origin,
          }),
        })
        const data = await res.json()

        if (!res.ok || data.error) {
          setError(data.error || 'Could not create account.')
          return
        }

        if (data.duplicate) {
          setError('An account with this email already exists. Please sign in instead.')
          return
        }

        if (!data.hasSession) {
          setModeOverride({ forUrlMode: urlMode, value: 'signin' })
          setMessage('Account created! Please check your email to confirm your address, then sign in.')
          setPassword('')
          return
        }

        if (!document.cookie.includes('sb-')) {
          setCookieBlocked(true)
          setMessage('Account created, but your browser is blocking session cookies inside this embedded iframe.')
          return
        }

        window.location.assign(redirect)
        return
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Invalid login credentials.')
        return
      }

      if (!document.cookie.includes('sb-')) {
        setCookieBlocked(true)
        setMessage('Signed in, but your browser is blocking session cookies inside this embedded iframe.')
        return
      }

      window.location.assign(redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isSignin = mode === 'signin'
  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'

  return (
    <div className="w-full max-w-md">
      {!isForgot && (
        <div className="bg-[#0F172A]/20 backdrop-blur-sm rounded-2xl p-1.5 flex mb-6 border border-white/30 shadow-inner">
          <button
            type="button"
            onClick={() => selectMode('signin')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              isSignin ? 'bg-white text-[#0F172A] shadow-[0_4px_12px_-2px_rgba(15,23,42,0.25)]' : 'text-[#0F172A] hover:bg-white/40'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => selectMode('signup')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              isSignup ? 'bg-white text-[#0F172A] shadow-[0_4px_12px_-2px_rgba(15,23,42,0.25)]' : 'text-[#0F172A] hover:bg-white/40'
            }`}
          >
            Create account
          </button>
        </div>
      )}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="vault-card-3d p-8 rounded-3xl space-y-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isForgot ? 'Reset password' : isSignin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {isForgot
              ? 'Enter your email to receive a reset link.'
              : isSignin
              ? 'Sign in to access your vault.'
              : 'Join the neighbourhood vault today.'}
          </p>
        </div>

        <div className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
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
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
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
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-medium"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-medium"
            />
          </div>

          {!isForgot && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
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
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {isSignin && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => selectMode('forgot')}
                    className="text-xs font-bold text-[#B45309] hover:text-[#92400E] hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-semibold">
            {error}
          </p>
        )}
        {message && (
          <div className="text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-semibold space-y-2">
            <p>{message}</p>
            {cookieBlocked && (
              <a
                href={`/login?redirect=${encodeURIComponent(redirect)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block vault-btn-navy-3d text-white px-4 py-2 rounded-lg text-xs font-bold"
              >
                Open Login in Full Browser Tab →
              </a>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full vault-btn-amber-3d text-white rounded-xl py-3.5 font-bold disabled:opacity-50"
        >
          {loading ? 'Please wait…' : isForgot ? 'Send Reset Link' : isSignin ? 'Sign in to vault' : 'Create my account'}
        </button>

        <div className="text-center pt-1">
          {isSignin && (
            <p className="text-sm text-slate-600 font-medium">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => selectMode('signup')}
                className="text-[#B45309] font-bold hover:underline transition-colors"
              >
                Create one
              </button>
            </p>
          )}
          {isSignup && (
            <p className="text-sm text-slate-600 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => selectMode('signin')}
                className="text-[#B45309] font-bold hover:underline transition-colors"
              >
                Sign in
              </button>
            </p>
          )}
          {isForgot && (
            <button
              type="button"
              onClick={() => selectMode('signin')}
              className="text-sm font-bold text-slate-600 hover:text-slate-900"
            >
              Back to Sign in
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-[#0F172A] font-bold">Loading secure connection…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}