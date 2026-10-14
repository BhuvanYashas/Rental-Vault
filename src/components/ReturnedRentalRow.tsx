'use client'

import { useState } from 'react'
import OpenClaimForm from './OpenClaimForm'
import ResolveClaimButton from './ResolveClaimButton'

type Claim = {
  id: string
  damage_amount: number
  description: string | null
  status: string
  dispute_reason: string | null
  disputed_at: string | null
} | null

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
}: {
  transactionId: string
  itemName: string
  category: string
  renterName: string
  startDate: string
  endDate: string
  escrowAmount: number
  intakePhoto: string | null
  returnPhoto: string | null
  claim: Claim
}) {
  const [showForm, setShowForm] = useState(false)

 const photoOptions: { url: string; label: string; createdAt: string }[] = []
if (intakePhoto) {
  photoOptions.push({ url: intakePhoto, label: 'Intake', createdAt: startDate })
}
if (returnPhoto) {
  photoOptions.push({ url: returnPhoto, label: 'Return', createdAt: endDate })
}

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-neutral-900">{itemName}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{category}</p>
          <p className="text-xs text-neutral-500 mt-1">
            Renter: <span className="font-mono">{renterName}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-neutral-500">
            {startDate} → {endDate}
          </p>
          <p className="text-sm font-semibold text-neutral-900 mt-1">
            Escrow ₹{escrowAmount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {intakePhoto && (
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-1">
              Intake
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={intakePhoto}
              alt="Intake"
              className="w-full h-28 object-cover rounded-lg border border-neutral-200"
            />
          </div>
        )}
        {returnPhoto && (
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-1">
              Return
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={returnPhoto}
              alt="Return"
              className="w-full h-28 object-cover rounded-lg border border-neutral-200"
            />
          </div>
        )}
      </div>

      {claim ? (
        <div className="space-y-3">
          <div
            className={`rounded-lg p-4 border ${
              claim.status === 'RESOLVED'
                ? 'bg-emerald-50 border-emerald-200'
                : claim.status === 'DISPUTED'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-700">
                Claim · {claim.status}
              </p>
              <p className="font-semibold text-neutral-900">
                ₹{claim.damage_amount}
              </p>
            </div>
            {claim.description && (
              <p className="text-sm text-neutral-700">{claim.description}</p>
            )}
            {claim.status === 'DISPUTED' && claim.dispute_reason && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs font-mono uppercase tracking-widest text-red-700 mb-1">
                  Renter dispute
                </p>
                <p className="text-sm text-red-800">{claim.dispute_reason}</p>
              </div>
            )}
          </div>
          {claim.status !== 'RESOLVED' && (
            <ResolveClaimButton claimId={claim.id} />
          )}
        </div>
      ) : (
        <>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-neutral-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-neutral-800"
            >
              Open damage claim
            </button>
          ) : (
            <OpenClaimForm
              transactionId={transactionId}
              itemName={itemName}
              photos={photoOptions}
              onCancel={() => setShowForm(false)}
            />
          )}
        </>
      )}
    </div>
  )
}