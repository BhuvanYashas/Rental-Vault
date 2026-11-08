'use client'

import { useState } from 'react'
import ChatModal from './ChatModal'

export default function ChatButton({ transactionId, itemName }: { transactionId: string, itemName: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[#D97706] text-xs font-bold flex items-center gap-1 hover:underline"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Message Vault
      </button>

      {isOpen && (
        <ChatModal
          transactionId={transactionId}
          itemName={itemName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}