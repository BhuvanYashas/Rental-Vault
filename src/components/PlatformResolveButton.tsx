'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { resolveEscalatedClaim } from '@/app/actions/resolveEscalatedClaim'

export default function PlatformResolveButton({ claimId }: { claimId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  function handleResolve(resolution: 'VAULT_WINS' | 'RENTER_WINS') {
    setError(null)
    if (!notes.trim()) {
      setError('Please write your reasoning before ruling')
      return
    }
    startTransition(async () => {
      const result = await resolveEscalatedClaim(claimId, resolution, notes)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">
          Platform notes (shown to renter)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Explain the reasoning behind your ruling"
          rows={3}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleResolve('VAULT_WINS')}
          disabled={isPending}
          className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? 'Ruling…' : 'Uphold vault'}
        </button>
        <button
          onClick={() => handleResolve('RENTER_WINS')}
          disabled={isPending}
          className="flex-1 bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {isPending ? 'Ruling…' : 'Rule for renter'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}