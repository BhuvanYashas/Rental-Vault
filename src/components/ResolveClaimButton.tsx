'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { resolveClaim } from '@/app/actions/resolveClaim'

export default function ResolveClaimButton({ claimId }: { claimId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleResolve(resolution: 'VAULT_WINS' | 'RENTER_WINS') {
    setError(null)
    startTransition(async () => {
      const result = await resolveClaim(claimId, resolution)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-mono uppercase tracking-widest text-neutral-600 font-bold">
        Resolve claim
      </p>
      <div className="flex gap-2">
        <button
          type="button" // 👈 ADDED
          onClick={() => handleResolve('VAULT_WINS')}
          disabled={isPending}
          className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Resolving…' : 'Rule for vault'}
        </button>
        <button
          type="button" // 👈 ADDED
          onClick={() => handleResolve('RENTER_WINS')}
          disabled={isPending}
          className="flex-1 bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Resolving…' : 'Rule for renter'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
    </div>
  )
}