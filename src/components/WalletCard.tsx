'use client'

import { useState } from 'react'
import AddFundsModal from './AddFundsModal'

export default function WalletCard({ balance }: { balance: number }) {
  const [isOpen, setIsOpen] = useState(false)

  // Format the number with commas (e.g., 51,500)
  const formattedBalance = balance.toLocaleString('en-IN')

  return (
    <>
      <div className="vault-card-3d-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
        <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none">
          <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H3V6h18v12zm-9-8a4 4 0 100 8 4 4 0 000-8z"/></svg>
        </div>

        <div className="relative z-10">
          <p className="text-xs font-mono uppercase tracking-widest text-[#FB923C] font-bold mb-1">Wallet Balance</p>
          <h2 className="text-4xl font-black text-white tabular-nums">₹{formattedBalance}</h2>
          <p className="text-sm text-slate-300 mt-2">Funds held in escrow are safe.</p>
        </div>

        <div className="relative z-10 mt-6">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full vault-btn-amber-3d text-white rounded-xl py-2.5 text-sm font-bold"
          >
            + Add Funds
          </button>
        </div>
      </div>

      {isOpen && <AddFundsModal onClose={() => setIsOpen(false)} />}
    </>
  )
}