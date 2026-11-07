'use client'

import { useState } from 'react'
import ChatModal from './ChatModal'

export default function ChatButton({ transactionId, itemName }: { transactionId: string, itemName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm font-bold text-[#D97706] hover:text-[#B45309] transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        Message Vault
      </button>
      {isOpen && <ChatModal transactionId={transactionId} itemName={itemName} onClose={() => setIsOpen(false)} />}
    </>
  )
}