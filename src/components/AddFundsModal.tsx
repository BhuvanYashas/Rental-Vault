'use client'

import { useState, useTransition } from 'react'
import { addFundsToWallet } from '@/app/actions/wallet'
import { useRouter } from 'next/navigation'

export default function AddFundsModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('500')
  
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const currentYear = new Date().getFullYear() % 100
  const maxYear = currentYear + 10

  // Format Card Number: 4242 4242 4242 4242
  function handleCardChange(e: React.ChangeEvent<HTMLInputElement>) {
    // 1. Remove all non-digits
    const rawValue = e.target.value.replace(/\D/g, '')
    
    // 2. Limit to 16 digits
    const limitedValue = rawValue.substring(0, 16)
    
    // 3. Add a space after every 4 digits
    const formattedValue = limitedValue.replace(/(\d{4})(?=\d)/g, '$1 ')
    
    setCardNumber(formattedValue)
  }

  // Format Expiry: MM/YY
  function handleExpiryChange(e: React.ChangeEvent<HTMLInputElement>) {
    let input = e.target.value.replace(/\D/g, '')
    if (input.length === 0) {
      setExpiry('')
      return
    }

    if (e.target.value.length < expiry.length) {
      setExpiry(e.target.value)
      return
    }

    let month = input.substring(0, 2)
    let year = input.substring(2, 4)

    if (month.length === 1 && parseInt(month) > 1) {
      month = '0' + month
      setExpiry(month + '/')
      return
    } else if (month.length === 1) {
      setExpiry(month)
      return
    }

    if (month.length === 2) {
      let m = parseInt(month, 10)
      if (m === 0) month = '01'
      if (m > 12) month = '12'
      
      if (year.length > 0) {
        if (year.length === 2) {
          let y = parseInt(year, 10)
          if (y < currentYear) y = currentYear
          if (y > maxYear) y = maxYear
          year = y.toString().padStart(2, '0')
        }
        setExpiry(month + '/' + year)
      } else {
        setExpiry(month + '/')
      }
      return
    }
  }

  // Format CVC
  function handleCvcChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, '')
    value = value.substring(0, 4)
    setCvc(value)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const amt = parseInt(amount, 10)
    if (!amt || amt < 100) {
      return setError('Minimum deposit is ₹100')
    }

    if (cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3) {
      return setError('Please fill in the mock card details completely.')
    }

    const expMonth = parseInt(expiry.substring(0, 2), 10)
    const expYear = parseInt(expiry.substring(3, 5), 10)
    const currentMonth = new Date().getMonth() + 1
    const currentYearNum = new Date().getFullYear() % 100

    if (expYear === currentYearNum && expMonth < currentMonth) {
      return setError('This card has expired.')
    }

    startTransition(async () => {
      const result = await addFundsToWallet(amt)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.refresh()
          onClose()
        }, 1500)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0F172A] p-6 flex justify-between items-start">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold mb-1">Secure Checkout</p>
            <h2 className="text-xl font-bold text-white">Add Funds to Wallet</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">Payment Successful</h3>
            <p className="text-sm text-[#1E293B] font-medium">₹{amount} has been added to your wallet.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">Amount (₹)</label>
              <input 
                type="number" 
                required 
                min="100"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full border border-[#5C7FA8]/40 rounded-xl px-4 py-3.5 text-[#0F172A] focus:outline-none focus:border-[#0F172A] font-bold text-lg" 
              />
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
              <p className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                Mock Card Details
              </p>
              
              <input 
                type="text" 
                placeholder="Card Number (e.g. 4242 4242 4242 4242)" 
                value={cardNumber}
                onChange={handleCardChange}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] bg-white font-mono focus:outline-none focus:border-[#0F172A]" 
              />
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={`MM/YY (${currentYear}-${maxYear})`} 
                  value={expiry}
                  onChange={handleExpiryChange}
                  className="w-1/2 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] bg-white font-mono focus:outline-none focus:border-[#0F172A]" 
                />
                <input 
                  type="text" 
                  placeholder="CVC" 
                  value={cvc}
                  onChange={handleCvcChange}
                  className="w-1/2 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] bg-white font-mono focus:outline-none focus:border-[#0F172A]" 
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-bold">{error}</p>}

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-[#D97706] text-white rounded-xl py-4 font-bold hover:bg-[#B45309] transition shadow-sm disabled:opacity-50"
            >
              {isPending ? 'Processing Payment…' : `Pay ₹${amount || 0}`}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}