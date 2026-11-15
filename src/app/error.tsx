'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-6 md:p-8 text-center">
      <div className="vault-card-3d rounded-3xl p-8 md:p-10 max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5 border border-red-200 shadow-sm">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Something went wrong</h1>
        <p className="text-slate-600 font-medium text-sm md:text-base mb-8">
          We encountered an unexpected error while loading this page. Your vault funds are safe, and you can retry below.
        </p>

        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 vault-btn-amber-3d text-white px-5 py-3 rounded-xl font-bold text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="flex-1 vault-btn-navy-3d text-white px-5 py-3 rounded-xl font-bold text-sm text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  )
}