'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { returnItem } from '@/app/actions/return'
import CameraCapture from './CameraCapture'

export default function ReturnModal({
  listingId,
  itemId,
  endDate,
  ratePerDay, // 👈 NEW PROP
  itemName,
  renterName,
  onClose,
}: {
  listingId: string
  itemId: string
  endDate: string
  ratePerDay: number // 👈 NEW PROP
  itemName: string
  renterName: string
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [note, setNote] = useState('')

  // === FIXED DATE & FEE CALCULATION ===
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(endDate)
  // Force dueDate to local time midnight to match today
  dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset()) 
  dueDate.setHours(0, 0, 0, 0)

  let lateDays = 0
  let lateFee = 0
  
  if (today > dueDate) {
    const diffTime = Math.abs(today.getTime() - dueDate.getTime())
    lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    // 👈 MATCHES THE BACKEND LOGIC: 1.5x daily rate
    lateFee = Math.round(lateDays * (ratePerDay * 1.5)) 
  }

  function handleSubmit() {
    if (!photoUrl) {
      setError('Upload a return photo before completing the return')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await returnItem(listingId, itemId, photoUrl, note)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0F172A] p-6 flex justify-between items-start shrink-0">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold mb-1">Process Return</p>
            <h2 className="text-xl font-bold text-white leading-tight">{itemName}</h2>
            <p className="text-sm text-slate-400 mt-1">Renter: {renterName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#F8FAFC]">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <CameraCapture onCapture={setPhotoUrl} label="Return photo (required)" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
            <label className="block text-xs font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">
              Condition notes (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. small dent on the back panel"
              rows={2}
              className="w-full border border-[#5C7FA8]/30 rounded-lg px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#5C7FA8]/60 focus:outline-none focus:border-[#0F172A]"
            />
          </div>

          {lateFee > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-sm font-bold text-red-800">Late Return Detected</p>
              </div>
              <p className="text-sm text-red-700 font-medium">
                This item is <strong>{lateDays} day(s)</strong> late. A late fee of <strong>₹{lateFee}</strong> will be deducted from the renter's escrow.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-bold">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white shrink-0 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-5 bg-neutral-100 text-neutral-700 rounded-xl py-3 font-bold hover:bg-neutral-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !photoUrl}
            className="flex-1 bg-[#D97706] text-white rounded-xl py-3 font-bold hover:bg-[#B45309] transition disabled:opacity-50 shadow-sm"
          >
            {isPending ? 'Processing…' : 'Complete Return'}
          </button>
        </div>

      </div>
    </div>
  )
}