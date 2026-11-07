'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Check if user is actually logged in via the magic link
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // If no session, they clicked a bad link or it expired
        router.push('/login')
      }
    }
    checkSession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/my-rentals')
      router.refresh()
    }
  }

  return (
    <main className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#5C7FA8]/30 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Set new password</h1>
          <p className="text-sm text-[#1E293B] mt-1 font-medium">Please enter your new password below.</p>
        </div>

        <div className="space-y-5 relative z-10">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">New Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-[#5C7FA8]/40 rounded-xl px-4 py-3.5 text-[#0F172A] focus:outline-none focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 transition-all font-medium" />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">Confirm Password</label>
            <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-[#5C7FA8]/40 rounded-xl px-4 py-3.5 text-[#0F172A] focus:outline-none focus:border-[#0F172A] focus:ring-4 focus:ring-[#0F172A]/10 transition-all font-medium" />
          </div>
        </div>

        {error && <p className="relative z-10 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-bold">{error}</p>}

        <button type="submit" disabled={loading} className="relative z-10 w-full bg-[#D97706] text-white rounded-xl py-4 font-bold hover:bg-[#B45309] hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-50">
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </main>
  )
}