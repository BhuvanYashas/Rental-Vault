'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import PhotoLightbox from './PhotoLightbox' 
import OpenClaimForm from './OpenClaimForm' 
import ChatButton from './ChatButton'

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5 text-[#D97706]">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg 
          key={star} 
          className={`w-4 h-4 ${star <= rating ? 'fill-current' : 'text-gray-300 fill-transparent'}`} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  )
}

type ReturnedRentalRowProps = {
  transactionId: string
  itemName: string
  category: string
  renterName: string
  startDate: string
  endDate: string
  escrowAmount: number
  intakePhoto: string | null
  returnPhoto: string | null
  claim: any
  review: any
}

export default function ReturnedRentalRow({
  transactionId,
  itemName,
  category,
  renterName,
  startDate,
  endDate,
  escrowAmount,
  intakePhoto,
  returnPhoto,
  claim,
  review,
}: ReturnedRentalRowProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false)

  const availablePhotos = []
  if (intakePhoto) availablePhotos.push({ url: intakePhoto, label: 'Intake' })
  if (returnPhoto) availablePhotos.push({ url: returnPhoto, label: 'Return' })

  return (
    <>
      <div className="bg-white rounded-3xl p-4 flex flex-col md:flex-row gap-6 shadow-sm border border-[#E2E8F0]">
        
        <div 
          className="flex flex-col gap-2 w-full md:w-1/4 cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <div className="relative h-24 bg-black rounded-xl overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
            <span className="absolute top-2 left-2 text-[10px] font-bold text-white uppercase tracking-widest z-10">Intake</span>
            {intakePhoto ? (
              <Image src={intakePhoto} alt="Intake" fill className="object-cover opacity-80" />
            ) : (
              <span className="text-white/30 text-xs">No Image</span>
            )}
          </div>
          <div className="relative h-24 bg-black rounded-xl overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
            <span className="absolute top-2 left-2 text-[10px] font-bold text-[#D97706] uppercase tracking-widest z-10">Return</span>
            {returnPhoto ? (
              <Image src={returnPhoto} alt="Return" fill className="object-cover opacity-80" />
            ) : (
              <span className="text-white/30 text-xs">No Image</span>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-[#0F172A]">{itemName}</h3>
            <span className="bg-[#F1F5F9] text-[#5C7FA8] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              {category || 'Appliance'}
            </span>
          </div>
          
          <p className="text-sm font-medium text-[#0F172A] mb-2">
            Renter: <span className="text-[#5C7FA8]">{renterName}</span>
          </p>

          {review && (
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={review.rating} />
              <span className="text-xs text-[#5C7FA8] font-medium">({review.rating}.0)</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <span className="bg-[#ECFDF5] text-[#059669] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
              RETURNED
            </span>
            {/* USE CHATBUTTON HERE */}
            <ChatButton transactionId={transactionId} itemName={itemName} />
          </div>

          <p className="text-xs text-[#5C7FA8] font-medium">
            {startDate} &rarr; {endDate}
          </p>
        </div>

        <div className="w-full md:w-1/3 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-[#E2E8F0] pt-4 md:pt-0 md:pl-6">
          <p className="text-[10px] font-bold text-[#5C7FA8] uppercase tracking-widest mb-1">Escrow Held</p>
          <p className="text-2xl font-black text-[#0F172A] mb-4">₹{escrowAmount}</p>
          
          <button 
            onClick={() => setIsClaimFormOpen(true)}
            className="w-full bg-[#D97706] hover:bg-[#B45309] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {claim ? 'View Damage Claim' : 'Open Damage Claim'}
          </button>
        </div>
      </div>

      <PhotoLightbox 
        open={isLightboxOpen}
        intakeUrl={intakePhoto}
        returnUrl={returnPhoto}
        itemName={itemName}
        onClose={() => setIsLightboxOpen(false)} 
      />

      <OpenClaimForm 
        transactionId={transactionId}
        itemName={itemName}
        photos={availablePhotos as any}
        onCancel={() => setIsClaimFormOpen(false)} 
      />
    </>
  )
}