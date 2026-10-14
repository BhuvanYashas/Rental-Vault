'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { resolveClaim } from '@/app/actions/resolveClaim'

export default function ResolveClaimButton({ claimId }: { claimId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await resolveClaim(claimId)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? 'Resolving…' : 'Resolve claim'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}