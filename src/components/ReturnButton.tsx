'use client'

import { useState } from 'react'
import ReturnModal from './ReturnModal'

export default function ReturnButton({
  listingId,
  itemId,
  endDate,
  ratePerDay, // 👈 1. Added here
  itemName,
  renterName,
}: {
  listingId: string
  itemId: string
  endDate: string
  ratePerDay: number // 👈 2. Added here
  itemName: string
  renterName: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
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
          ratePerDay={ratePerDay} // 👈 3. Passed it down here
          itemName={itemName}
          renterName={renterName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}