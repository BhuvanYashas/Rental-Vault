'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveListing } from '@/app/actions/approveListing'

export default function ApproveListingButton({
  listingId,
  itemId,
}: {
  listingId: string
  itemId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveListing(listingId, itemId)
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
        onClick={handleApprove}
        disabled={isPending}
        className="bg-[#D97706] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#B45309] transition shadow-sm disabled:opacity-50"
      >
        {isPending ? 'Approving…' : 'Approve & List'}
      </button>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}