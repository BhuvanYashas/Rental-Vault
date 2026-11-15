'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserNav({
  email,
  username,
  role,
  kycStatus,
}: {
  email: string
  username: string
  role: string | null
  kycStatus?: string | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push('/')
    router.refresh()
  }

  const initial = username ? username.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()
  const isKycVerified = kycStatus === 'verified'
  const isKycPending = kycStatus === 'pending'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none group"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#F97316] to-[#EA580C] flex items-center justify-center text-white font-extrabold shadow-[0_3px_0_0_#9A3412,inset_0_1px_0_rgba(255,255,255,0.35)] border border-white/25 group-hover:-translate-y-0.5 transition-transform">
          {initial}
        </div>
        <svg
          className={`w-4 h-4 text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 vault-card-3d-dark rounded-2xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* User Info Header */}
          <div className="px-5 py-4 border-b border-white/10 mb-2 space-y-2">
            <div>
              <p className="text-sm font-bold text-white truncate">{username || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{email}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                isKycVerified
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : isKycPending
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-[#FB923C] hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>
                {isKycVerified ? 'KYC Verified' : isKycPending ? 'KYC Pending Review' : 'Verify KYC'}
              </span>
            </Link>
          </div>

          {/* Links */}
          <div className="px-2 space-y-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Your Profile
            </Link>
            
            <Link
              href="/my-rentals"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              My Rentals
            </Link>

            <Link
              href="/owner/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              My Items
            </Link>

            {role === 'operator' && (
              <Link
                href="/operator"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#D97706] hover:bg-[#D97706]/10 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Operator Dashboard
              </Link>
            )}

            {role === 'platform' && (
              <Link
                href="/platform"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                Platform Review
              </Link>
            )}
          </div>

          <div className="border-t border-white/10 mt-2 pt-2 px-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}