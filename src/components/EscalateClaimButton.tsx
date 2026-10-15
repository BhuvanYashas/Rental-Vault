'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { escalateClaim } from '@/app/actions/escalateClaim'

export default function EscalateClaimButton({ claimId }: { claimId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!reason.trim()) {
      setError('Please explain why you are requesting a re-review')
      return
    }
    startTransition(async () => {
      const result = await escalateClaim(claimId, reason)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline"
      >
        Request re-review
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-4 bg-white border border-red-300 rounded-xl space-y-3"
    >
      <p className="text-xs font-mono uppercase tracking-widest text-red-700">
        Request platform re-review
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Explain why you disagree with the operator's ruling"
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
          {isPending ? 'Submitting…' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className="px-4 bg-neutral-200 text-neutral-900 rounded-lg py-2 text-sm font-medium hover:bg-neutral-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}