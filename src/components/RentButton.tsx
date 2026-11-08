'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { rentItem } from '@/app/actions/rent'
import CameraCapture from './CameraCapture'

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

  // Default dates: Today and 7 days from now
  const todayStr = new Date().toISOString().split('T')[0]
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(nextWeekStr)

  // Calculate days dynamically
  let rentalDays = 0
  let rentalFee = 0
  let dateError = false

  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Calculate difference in milliseconds, then convert to days
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 0) {
      rentalDays = diffDays
      rentalFee = rentalDays * ratePerDay
    } else {
      dateError = true // End date is before start date
    }
  }

  const totalUpfrontCost = deposit + rentalFee
  const hasEnoughFunds = walletBalance >= totalUpfrontCost && !dateError

  function handleClick() {
    if (dateError) {
      setError('End date must be after the start date.')
      return
    }
    if (!photoUrl) {
      setError('Upload an intake photo before renting')
      return
    }
    
    setError(null)
    startTransition(async () => {
      const result = await rentItem(listingId, itemId, deposit, startDate, endDate, photoUrl, note)
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
      
      {/* DATE PICKERS */}
      <div className="bg-white border border-[#5C7FA8]/40 rounded-xl p-4 space-y-3 mb-4">
        <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] font-bold mb-2">Select Rental Dates</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#5C7FA8] mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              min={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-2 py-2 text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#0F172A]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#5C7FA8] mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              min={startDate} // Prevent picking an end date before the start date
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-2 py-2 text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#0F172A]"
            />
          </div>
        </div>
        {dateError && <p className="text-xs text-red-600 font-bold">End date must be after start date.</p>}
      </div>

      {/* COST BREAKDOWN */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2 mb-4">
        <div className="flex justify-between text-sm font-medium text-[#1E293B]">
          <span>Rental Fee ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})</span>
          <span>₹{rentalFee}</span>
        </div>
        <div className="flex justify-between text-sm font-medium text-[#1E293B]">
          <span>Security Deposit</span>
          <span>₹{deposit}</span>
        </div>
        <div className="pt-2 border-t border-[#E2E8F0] flex justify-between font-bold text-[#0F172A]">
          <span>Total Due Now</span>
          <span>₹{totalUpfrontCost}</span>
        </div>
      </div>

      {/* WALLET CHECK */}
      <div className={`p-4 rounded-xl border ${hasEnoughFunds ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#0F172A]">Wallet Balance</p>
          <p className={`text-sm font-bold ${hasEnoughFunds ? 'text-emerald-600' : 'text-red-600'}`}>₹{walletBalance}</p>
        </div>
        {!hasEnoughFunds && !dateError && (
          <p className="text-xs text-red-700 font-bold mt-2 pt-2 border-t border-red-200">
            Insufficient funds. You need ₹{totalUpfrontCost - walletBalance} more.
          </p>
        )}
      </div>

      <div className={!hasEnoughFunds ? 'opacity-50 pointer-events-none' : ''}>
        <CameraCapture
          onCapture={setPhotoUrl}
          label="Intake photo (required)"
        />

        <div className="mt-4">
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
      </div>

      <button
        onClick={handleClick}
        disabled={isPending || !photoUrl || !hasEnoughFunds}
        className="w-full bg-[#0F172A] text-white rounded-xl py-4 font-semibold hover:bg-[#1E293B] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Processing Payment…' : `Pay ₹${totalUpfrontCost} & Rent`}
      </button>

      {error && <p className="text-red-600 text-sm mt-3 font-mono bg-red-50 p-2 rounded border border-red-200">{error}</p>}
    </div>
  )
}