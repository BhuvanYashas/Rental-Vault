'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { disputeClaim } from '@/app/actions/disputeClaim'

export default function DisputeClaimForm({
  claimId,
  onCancel,
}: {
  claimId: string
  onCancel: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!reason.trim()) {
      setError('Please explain why you are disputing this claim')
      return
    }

    startTransition(async () => {
      const result = await disputeClaim(claimId, reason)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      onCancel()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-4 bg-white border border-red-200 rounded-xl space-y-3"
    >
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-red-700">
          Dispute this claim
        </p>
      </div>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Explain why you disagree — e.g. the scratch was already there at intake, see the intake photo"
        rows={3}
        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? 'Submitting…' : 'Submit dispute'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 bg-neutral-200 text-neutral-900 rounded-lg py-2 text-sm font-medium hover:bg-neutral-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}