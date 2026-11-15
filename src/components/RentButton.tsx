'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { rentItem } from '@/app/actions/rent'
import CameraCapture from './CameraCapture'
import AddFundsModal from './AddFundsModal'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export default function RentButton({
  listingId,
  itemId,
  deposit,
  ratePerDay,
  walletBalance,
}: {
  listingId: string
  itemId: string
  deposit: number
  ratePerDay: number
  walletBalance: number
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false)

  const todayStr = getLocalDateString(new Date())
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = getLocalDateString(nextWeek)

  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(nextWeekStr)

  let rentalDays = 0
  let rentalFee = 0
  let dateError = false

  if (startDate && endDate) {
    const start = parseLocalDate(startDate)
    const end = parseLocalDate(endDate)
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      rentalDays = diffDays
      rentalFee = rentalDays * ratePerDay
    } else {
      dateError = true
    }
  }

  const totalUpfrontCost = deposit + rentalFee
  const hasEnoughFunds = walletBalance >= totalUpfrontCost && !dateError

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate)
    if (newStartDate >= endDate) {
      const nextDay = parseLocalDate(newStartDate)
      nextDay.setDate(nextDay.getDate() + 1)
      setEndDate(getLocalDateString(nextDay))
    }
  }

  function handleClick() {
    if (dateError) return setError('End date must be after the start date.')
    if (!photoUrl) return setError('Upload an intake photo before renting')

    setError(null)
    startTransition(async () => {
      const result = await rentItem(listingId, itemId, deposit, startDate, endDate, photoUrl, note)
      if (result.error) {
        setError(result.error)
        return
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F172A', '#D97706', '#059669'],
      })
      toast.success('Rental confirmed! Check your dashboard.')

      router.push('/my-rentals')
      router.refresh()
    })
  }

  const applyPreset = (days: number) => {
    const base = startDate ? parseLocalDate(startDate) : new Date()
    const target = new Date(base)
    target.setDate(target.getDate() + days)
    setEndDate(getLocalDateString(target))
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">Select Rental Dates</p>
          <div className="flex items-center gap-1">
            {[1, 3, 7, 14].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => applyPreset(d)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                  rentalDays === d
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              min={todayStr}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-slate-900 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-slate-900 tabular-nums"
            />
          </div>
        </div>
        {dateError && <p className="text-xs text-red-700 font-semibold">End date must be after start date.</p>}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm font-medium text-slate-700 tabular-nums">
          <span>Rental Fee ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})</span>
          <span>₹{rentalFee.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm font-medium text-slate-700 tabular-nums">
          <span>Refundable Deposit</span>
          <span>₹{deposit.toLocaleString('en-IN')}</span>
        </div>
        <div className="pt-2.5 border-t border-slate-200 flex justify-between font-bold text-slate-900 tabular-nums">
          <span>Total Due Now</span>
          <span>₹{totalUpfrontCost.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${hasEnoughFunds ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Wallet Balance</p>
          <p className={`text-sm font-bold tabular-nums ${hasEnoughFunds ? 'text-emerald-700' : 'text-red-700'}`}>
            ₹{walletBalance.toLocaleString('en-IN')}
          </p>
        </div>

        {!hasEnoughFunds && !dateError && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-xs text-red-800 font-semibold mb-3 tabular-nums">
              Insufficient funds. You need ₹{(totalUpfrontCost - walletBalance).toLocaleString('en-IN')} more.
            </p>
            <button
              type="button"
              onClick={() => setIsFundsModalOpen(true)}
              className="w-full bg-white text-slate-900 border border-[#D97706] rounded-lg py-2 text-sm font-bold hover:bg-[#D97706] hover:text-white transition-colors"
            >
              + Add Funds to Wallet
            </button>
          </div>
        )}
      </div>

      <div className={!hasEnoughFunds ? 'opacity-50 pointer-events-none' : ''}>
        <CameraCapture onCapture={setPhotoUrl} label="Intake photo (required)" />
        <div className="mt-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-2">
            Condition notes (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. small scratch on the lid"
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || !photoUrl || !hasEnoughFunds}
        className="w-full vault-btn-amber-3d text-white rounded-xl py-3.5 font-bold disabled:opacity-50 disabled:cursor-not-allowed tabular-nums"
      >
        {isPending ? 'Processing Payment…' : `Pay ₹${totalUpfrontCost.toLocaleString('en-IN')} & Rent`}
      </button>

      {error && (
        <p className="text-red-700 text-sm font-semibold bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {isFundsModalOpen && (
        <AddFundsModal onClose={() => setIsFundsModalOpen(false)} />
      )}
    </div>
  )
}