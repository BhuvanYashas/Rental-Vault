'use client'

import { useState } from 'react'
import ReturnModal from './ReturnModal'

export default function ReturnButton({
  listingId,
  itemId,
  endDate,
  itemName,
  renterName,
}: {
  listingId: string
  itemId: string
  endDate: string
  itemName: string
  renterName: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#0F172A] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#1E293B] transition-colors shadow-sm"
      >
        Process Return
      </button>

      {isOpen && (
        <ReturnModal
          listingId={listingId}
          itemId={itemId}
          endDate={endDate}
          itemName={itemName}
          renterName={renterName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}