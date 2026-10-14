'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { returnItem } from '@/app/actions/return'
import CameraCapture from './CameraCapture'

export default function ReturnButton({
  listingId,
  itemId,
}: {
  listingId: string
  itemId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [note, setNote] = useState('')

  function handleClick() {
    if (!photoUrl) {
      setError('Capture a return photo before completing the return')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await returnItem(listingId, itemId, photoUrl, note)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      <CameraCapture
        onCapture={setPhotoUrl}
        label="Return photo (required)"
      />

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">
          Condition notes (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. small dent on the back panel"
          rows={2}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500"
        />
      </div>

      <button
        onClick={handleClick}
        disabled={isPending || !photoUrl}
        className="w-full bg-amber-600 text-white rounded-xl py-4 font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Verifying return…' : 'Complete return'}
      </button>

      {error && <p className="text-red-600 text-sm mt-3 font-mono">{error}</p>}
    </div>
  )
}