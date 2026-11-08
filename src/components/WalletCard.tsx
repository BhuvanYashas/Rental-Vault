'use client'

import { useState } from 'react'
import AddFundsModal from './AddFundsModal'

export default function WalletCard({ balance }: { balance: number }) {
  const [isOpen, setIsOpen] = useState(false)

  // Format the number with commas (e.g., 51,500)
  const formattedBalance = balance.toLocaleString('en-IN')

  return (
    <>
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between h-full">
        <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none">
          <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H3V6h18v12zm-9-8a4 4 0 100 8 4 4 0 000-8z"/></svg>
        </div>
        
        <div className="relative z-10">
          <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold mb-1">Wallet Balance</p>
          <h2 className="text-4xl font-black text-white">₹{formattedBalance}</h2>
          <p className="text-sm text-slate-400 mt-2">Funds held in escrow are safe.</p>
        </div>

        <div className="relative z-10 mt-6">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full bg-[#D97706] text-white rounded-xl py-2.5 text-sm font-bold hover:bg-[#B45309] transition shadow-sm"
          >
            + Add Funds
          </button>
        </div>
      </div>

      {isOpen && <AddFundsModal onClose={() => setIsOpen(false)} />}
    </>
  )
}