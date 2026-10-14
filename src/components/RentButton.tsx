'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { rentItem } from '@/app/actions/rent'
import CameraCapture from './CameraCapture'

export default function RentButton({
  listingId,
  itemId,
  deposit,
}: {
  listingId: string
  itemId: string
  deposit: number
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [note, setNote] = useState('')

  function handleClick() {
    if (!photoUrl) {
      setError('Capture an intake photo before renting')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await rentItem(listingId, itemId, deposit, photoUrl, note)
      if (result.error) {
        setError(result.error)
        return
      }
      router.push('/my-rentals')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <CameraCapture
        onCapture={setPhotoUrl}
        label="Intake photo (required)"
      />

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">
          Condition notes (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. small scratch on the lid"
          rows={2}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500"
        />
      </div>

      <button
        onClick={handleClick}
        disabled={isPending || !photoUrl}
        className="w-full bg-neutral-900 text-white rounded-xl py-4 font-semibold hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Renting…' : 'Confirm rent'}
      </button>

      {error && <p className="text-red-600 text-sm mt-3 font-mono">{error}</p>}
    </div>
  )
}