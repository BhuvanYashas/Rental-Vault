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
        options: { data: { username: trimmedUsername, age: ageNum } },
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
      <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 flex mb-6 border border-white/30">
        <button
          type="button"
          onClick={() => { setMode('signin'); setError(null) }}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition ${
            isSignin ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#0F172A] hover:bg-white/20'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null) }}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition ${
            !isSignin ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#0F172A] hover:bg-white/20'
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-[#5C7FA8] shadow-lg space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            {isSignin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-[#1E293B] mt-1 font-medium">
            {isSignin ? 'Sign in to rent or manage items.' : 'Get started with the vault in under a minute.'}
          </p>
        </div>

        <div className="space-y-4">
          {!isSignin && (
            <>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">Username</label>
                <input
                  type="text" required minLength={2} maxLength={30} placeholder="e.g. arjun_k"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">Age</label>
                <input
                  type="number" required min={13} max={120} placeholder="e.g. 24"
                  value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">Email</label>
            <input
              type="email" required placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="At least 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#5C7FA8] rounded-lg px-3 py-2.5 pr-10 text-[#0F172A] placeholder:text-[#5C7FA8] focus:outline-none focus:border-[#0F172A]"
              />
              <button
                type="button" onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5C7FA8] hover:text-[#0F172A]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full bg-[#D97706] text-white rounded-lg py-3 font-bold hover:bg-[#B45309] transition shadow-sm disabled:opacity-50"
        >
          {loading ? 'Please wait…' : isSignin ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Suspense fallback={<div className="text-[#0F172A] font-bold">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}   