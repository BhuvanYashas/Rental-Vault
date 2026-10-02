'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { returnItem } from '@/app/actions/return'

export function ReturnButton({
  listingId,
  itemId,
}: {
  listingId: string
  itemId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await returnItem(listingId, itemId)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full bg-amber-600 text-white rounded-xl py-4 font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Verifying return…' : 'Return to vault'}
      </button>

      {error && <p className="text-red-600 text-sm mt-3 font-mono">{error}</p>}
    </div>
  )
}