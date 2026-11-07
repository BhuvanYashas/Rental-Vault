'use client'

import { useEffect } from 'react'

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
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-200">
        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Something went wrong</h1>
      <p className="text-[#1E293B] font-medium text-lg mb-8 max-w-md">
        We encountered an unexpected error while loading this page. Our vault is secure, but the connection was interrupted.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-[#D97706] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#B45309] transition-colors shadow-md hover:-translate-y-0.5"
        >
          Try again
        </button>
        <a
          href="/"
          className="bg-white border border-[#5C7FA8]/40 text-[#0F172A] px-8 py-3 rounded-xl font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm"
        >
          Go Home
        </a>
      </div>
    </main>
  )
}