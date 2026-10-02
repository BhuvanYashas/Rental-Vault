'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { rentItem } from '@/app/actions/rent'

export function RentButton({
  listingId,
  itemId,
  deposit,
}: {
  listingId: string
  itemId: string
  deposit: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await rentItem(listingId, itemId, deposit)
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
        className="w-full bg-neutral-900 text-white rounded-xl py-4 font-semibold hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Locking escrow…' : `Rent this item — ₹${deposit} deposit`}
      </button>

      {error && <p className="text-red-600 text-sm mt-3 font-mono">{error}</p>}
    </div>
  )
}