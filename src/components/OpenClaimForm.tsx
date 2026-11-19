'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { openClaim } from '@/app/actions/openClaim'

type PhotoOption = {
  url: string
  label: string
  createdAt: string
}

export default function OpenClaimForm({
  transactionId,
  itemName,
  photos,
  onCancel,
}: {
  transactionId: string
  itemName: string
  photos: PhotoOption[]
  onCancel: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function togglePhoto(url: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const amountNum = parseInt(amount, 10)
    if (!amountNum || amountNum <= 0) {
      setError('Enter a valid damage amount')
      return
    }
    if (!description.trim()) {
      setError('Describe the damage')
      return
    }
    if (selected.size === 0) {
      setError('Select at least one evidence photo')
      return
    }

    startTransition(async () => {
      const result = await openClaim(
        transactionId,
        amountNum,
        description,
        Array.from(selected),
      )
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
      className="mt-4 p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-4"
    >
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-amber-700 font-bold">
          Open claim — {itemName}
        </p>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2 font-bold">
          Evidence photos
        </label>
        <div className="grid grid-cols-2 gap-3">
          {photos.map((p) => {
            const isSelected = selected.has(p.url)
            return (
              <button
                key={p.url}
                type="button" // 👈 Critical: Prevents form submission
                onClick={() => togglePhoto(p.url)}
                className={`relative text-left rounded-lg overflow-hidden border-2 transition ${
                  isSelected
                    ? 'border-amber-600'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="relative w-full h-32">
                  <Image
                    src={p.url}
                    alt={p.label}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-2 left-2 bg-white/90 text-xs font-mono font-bold px-2 py-1 rounded">
                  {p.label}
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2 font-bold">
          Damage amount (₹)
        </label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 500"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 font-medium"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2 font-bold">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the damage — e.g. 3cm scratch on the left edge, dent on the top corner"
          rows={3}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 font-medium"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 font-bold">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-amber-600 text-white rounded-lg py-2 font-bold hover:bg-amber-700 disabled:opacity-50"
        >
          {isPending ? 'Filing claim…' : 'File claim'}
        </button>
        <button
          type="button" // 👈 Critical: Prevents form submission
          onClick={onCancel}
          disabled={isPending}
          className="px-5 bg-neutral-200 text-neutral-900 rounded-lg py-2 font-bold hover:bg-neutral-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}