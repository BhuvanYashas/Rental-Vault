'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { escalateClaim } from '@/app/actions/escalateClaim'

export default function EscalateClaimButton({ claimId }: { claimId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!reason.trim()) {
      return setError('Please explain why you are requesting a re-review')
    }

    startTransition(async () => {
      const result = await escalateClaim(claimId, reason)
      if (result.error) {
        setError(result.error)
      } else {
        setIsOpen(false)
        router.refresh()
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-3 text-sm font-bold text-[#D97706] hover:text-[#B45309] underline transition-colors"
      >
        Request Platform Re-review
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
      <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] font-bold">
        Escalate to Platform
      </p>
      
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Explain why you disagree with the operator's ruling. The platform reviewer will see this."
        rows={3}
        disabled={isPending}
        className="w-full border border-[#5C7FA8]/40 rounded-lg px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#5C7FA8]/60 focus:outline-none focus:border-[#0F172A] disabled:opacity-50"
      />

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 font-medium">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-[#D97706] text-white rounded-lg py-2 text-sm font-bold hover:bg-[#B45309] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Submitting...' : 'Submit to Platform'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          disabled={isPending}
          className="px-4 bg-neutral-100 text-neutral-700 rounded-lg py-2 text-sm font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}