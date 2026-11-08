'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { rentItem } from '@/app/actions/rent'
import CameraCapture from './CameraCapture'
import AddFundsModal from './AddFundsModal'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

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
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false) // 👈 State for the modal

  const getLocalDateString = (date: Date) => {
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().split('T')[0]
  }

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
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
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
      const nextDay = new Date(newStartDate)
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
        colors: ['#0F172A', '#D97706', '#5C7FA8']
      })
      toast.success('Rental confirmed! Check your dashboard.')
      
      router.push('/my-rentals')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#5C7FA8]/40 rounded-xl p-4 space-y-3 mb-4">
        <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] font-bold mb-2">Select Rental Dates</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#5C7FA8] mb-1">Start Date</label>
            <input type="date" value={startDate} min={todayStr} onChange={(e) => handleStartDateChange(e.target.value)} className="w-full border border-[#E2E8F0] rounded-lg px-2 py-2 text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#0F172A]" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#5C7FA8] mb-1">End Date</label>
            <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-[#E2E8F0] rounded-lg px-2 py-2 text-sm text-[#0F172A] font-medium focus:outline-none focus:border-[#0F172A]" />
          </div>
        </div>
        {dateError && <p className="text-xs text-red-600 font-bold">End date must be after start date.</p>}
      </div>

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

      <div className={`p-4 rounded-xl border ${hasEnoughFunds ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-[#0F172A]">Wallet Balance</p>
          <p className={`text-sm font-bold ${hasEnoughFunds ? 'text-emerald-600' : 'text-red-600'}`}>₹{walletBalance}</p>
        </div>
        
        {!hasEnoughFunds && !dateError && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-xs text-red-700 font-bold mb-3">
              Insufficient funds. You need ₹{totalUpfrontCost - walletBalance} more.
            </p>
            {/* 👇 THE NEW RECHARGE BUTTON 👇 */}
            <button
              type="button"
              onClick={() => setIsFundsModalOpen(true)}
              className="w-full bg-white text-[#0F172A] border border-[#D97706] rounded-lg py-2 text-sm font-bold hover:bg-[#D97706] hover:text-white transition-colors"
            >
              + Add Funds to Wallet
            </button>
          </div>
        )}
      </div>

      <div className={!hasEnoughFunds ? 'opacity-50 pointer-events-none' : ''}>
        <CameraCapture onCapture={setPhotoUrl} label="Intake photo (required)" />
        <div className="mt-4">
          <label className="block text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">Condition notes (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. small scratch on the lid" rows={2} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500" />
        </div>
      </div>

      <button 
        onClick={handleClick} 
        disabled={isPending || !photoUrl || !hasEnoughFunds} 
        className="w-full bg-[#0F172A] text-white rounded-xl py-4 font-semibold hover:bg-[#1E293B] hover:-translate-y-1 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Processing Payment…' : `Pay ₹${totalUpfrontCost} & Rent`}
      </button>

      {error && <p className="text-red-600 text-sm mt-3 font-mono bg-red-50 p-2 rounded border border-red-200">{error}</p>}

      {/* 👇 RENDER THE MODAL 👇 */}
      {isFundsModalOpen && (
        <AddFundsModal onClose={() => setIsFundsModalOpen(false)} />
      )}
    </div>
  )
}