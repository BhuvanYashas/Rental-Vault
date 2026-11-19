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
          className={`w-4 h-4 ${star <= rating ? 'fill-current' : 'text-slate-300 fill-transparent'}`}
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  )
}

type ClaimSummary = {
  id: string
  damage_amount: number
  description: string | null
  status: string
}

type ReviewSummary = {
  rating: number
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
  claim: ClaimSummary | null
  review: ReviewSummary | null
  canOpenClaim?: boolean
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
  canOpenClaim = true,
}: ReturnedRentalRowProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false)

  const availablePhotos = []
  if (intakePhoto) availablePhotos.push({ url: intakePhoto, label: 'Intake', createdAt: startDate })
  if (returnPhoto) availablePhotos.push({ url: returnPhoto, label: 'Return', createdAt: endDate })

  return (
    <>
      <div className="vault-card-3d rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div
            className="grid grid-cols-2 md:grid-cols-1 gap-2 w-full md:w-44 shrink-0 cursor-zoom-in"
            onClick={() => (intakePhoto || returnPhoto) && setIsLightboxOpen(true)}
          >
            <div className="relative h-24 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center hover:opacity-90 transition-opacity">
              <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-white bg-black/50 px-1.5 py-0.5 rounded uppercase tracking-wider z-10">
                Intake
              </span>
              {intakePhoto ? (
                <Image src={intakePhoto} alt="Intake" fill referrerPolicy="no-referrer" className="object-cover" />
              ) : (
                <span className="text-slate-400 text-xs">No Image</span>
              )}
            </div>
            <div className="relative h-24 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center hover:opacity-90 transition-opacity">
              <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-amber-300 bg-black/50 px-1.5 py-0.5 rounded uppercase tracking-wider z-10">
                Return
              </span>
              {returnPhoto ? (
                <Image src={returnPhoto} alt="Return" fill referrerPolicy="no-referrer" className="object-cover" />
              ) : (
                <span className="text-slate-400 text-xs">No Image</span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium mb-1">
              <span className="uppercase tracking-wider font-semibold">{category || 'Item'}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-emerald-700 font-bold">RETURNED</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1.5">{itemName}</h3>

            <p className="text-sm font-medium text-slate-700 mb-2">
              Renter: <span className="font-bold text-slate-900">{renterName}</span>
            </p>

            {review && (
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={review.rating} />
                <span className="text-xs text-slate-600 font-semibold tabular-nums">({review.rating}.0)</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-auto">
              <ChatButton transactionId={transactionId} itemName={itemName} />
              <span className="text-xs font-mono text-slate-600 font-medium tabular-nums">
                {startDate} → {endDate}
              </span>
            </div>
          </div>

          <div className="w-full md:w-56 flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 shrink-0">
            <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Escrow Held</p>
            <p className="text-2xl font-black text-slate-900 mb-4 tabular-nums">₹{escrowAmount}</p>

            {claim ? (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                <p className="text-xs font-mono font-bold uppercase text-amber-800">
                  Claim: {claim.status}
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 tabular-nums">
                  ₹{claim.damage_amount}
                </p>
                {claim.description && (
                  <p className="text-xs text-slate-700 mt-1 line-clamp-2">{claim.description}</p>
                )}
              </div>
            ) : canOpenClaim ? (
              <button
                type="button"
                onClick={() => setIsClaimFormOpen((prev) => !prev)}
                className="w-full vault-btn-amber-3d text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {isClaimFormOpen ? 'Close Claim Form' : 'Open Damage Claim'}
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-500">No claims filed</span>
            )}
          </div>
        </div>

        {isClaimFormOpen && !claim && canOpenClaim && (
          <OpenClaimForm
            transactionId={transactionId}
            itemName={itemName}
            photos={availablePhotos}
            onCancel={() => setIsClaimFormOpen(false)}
          />
        )}
      </div>

      <PhotoLightbox
        open={isLightboxOpen}
        intakeUrl={intakePhoto}
        returnUrl={returnPhoto}
        itemName={itemName}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  )
}