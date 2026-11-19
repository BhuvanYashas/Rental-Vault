'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#7BA3D0] text-[#0F172A] flex items-center justify-center p-6 font-sans antialiased">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200 space-y-5">
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Something went wrong</h1>
          <p className="text-sm text-slate-600 font-medium">
            An unexpected application error occurred. Please try reloading or return to the vault.
          </p>
          <div className="flex gap-3 justify-center">
            {reset && (
              <button
                type="button"
                onClick={() => reset()}
                className="bg-[#EA580C] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:brightness-105 transition"
              >
                Try again
              </button>
            )}
            <Link
              href="/"
              className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
