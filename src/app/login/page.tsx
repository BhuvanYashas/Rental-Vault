'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// === SECTION: MAIN FORM LOGIC ===
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
      
      {/* Tab Switcher */}
      <div className="bg-[#0F172A]/10 backdrop-blur-md rounded-full p-1.5 flex mb-8 border border-[#0F172A]/10 shadow-inner">
        <button
          type="button"
          onClick={() => { setMode('signin'); setError(null) }}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            isSignin ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#0F172A] hover:bg-white/30'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null) }}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            !isSignin ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#0F172A] hover:bg-white/30'
          }`}
        >
          Create account
        </button>
      </div>

      {/* Form Card */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-3xl border border-[#5C7FA8]/30 shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            {isSignin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-[#1E293B] mt-1 font-medium">
            {isSignin ? 'Sign in to access your vault.' : 'Join the neighbourhood vault today.'}
          </p>
        </div>

        <div className="space-y-5 relative z-10">
          {!isSignin && (
            <>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">Username</label>
                <input
                  type="text" required minLength={2} maxLength={30} placeholder="e.g. arjun_k"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-[#5C7FA8]/40 rounded-xl px-4 py-3.5 text-[#0F172A] placeholder:text-[#5C7FA8]/60 focus:outline-none focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">Age</label>
                <input
                  type="number" required min={13} max={120} placeholder="e.g. 24"
                  value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full border border-[#5C7FA8]/40 rounded-xl px-4 py-3.5 text-[#0F172A] placeholder:text-[#5C7FA8]/60 focus:outline-none focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 transition-all font-medium"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">Email</label>
            <input
              type="email" required placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#5C7FA8]/40 rounded-xl px-4 py-3.5 text-[#0F172A] placeholder:text-[#5C7FA8]/60 focus:outline-none focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="At least 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#5C7FA8]/40 rounded-xl px-4 py-3.5 pr-12 text-[#0F172A] placeholder:text-[#5C7FA8]/60 focus:outline-none focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 transition-all font-medium"
              />
              <button
                type="button" onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#5C7FA8] hover:text-[#0F172A] transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="relative z-10 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-bold">
            {error}
          </p>
        )}

        <button
          type="submit" disabled={loading}
          className="relative z-10 w-full bg-[#0F172A] text-white rounded-xl py-4 font-bold hover:bg-[#1E293B] hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-50"
        >
          {loading ? 'Please wait…' : isSignin ? 'Sign in to vault' : 'Create my account'}
        </button>
      </form>
    </div>
  )
}

// === SECTION: PAGE WRAPPER ===
export default function LoginPage() {
  return (
    <main className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-[#0F172A] font-bold">Loading secure connection…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}