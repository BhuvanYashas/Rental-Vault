'use client'

import { useState } from 'react'
import Image from 'next/image'
import OpenClaimForm from './OpenClaimForm'
import ResolveClaimButton from './ResolveClaimButton'
import PhotoLightbox from './PhotoLightbox'
import ChatModal from './ChatModal'

type Claim = {
  id: string
  damage_amount: number
  description: string | null
  status: string
  dispute_reason: string | null
  disputed_at: string | null
  resolution: string | null
  resolved_at: string | null
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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const photoOptions: { url: string; label: string; createdAt: string }[] = []
  if (intakePhoto) photoOptions.push({ url: intakePhoto, label: 'Intake', createdAt: startDate })
  if (returnPhoto) photoOptions.push({ url: returnPhoto, label: 'Return', createdAt: endDate })

  return (
    <div className="bg-white border border-[#5C7FA8]/30 rounded-3xl shadow-sm flex flex-col lg:flex-row overflow-hidden hover:shadow-md transition-shadow group">
      
      <div className="lg:w-[30%] bg-[#F8FAFC] p-4 flex flex-col gap-2 border-b lg:border-b-0 lg:border-r border-[#E2E8F0]">
        {intakePhoto && (
          <div onClick={() => setLightboxOpen(true)} className="relative rounded-xl overflow-hidden border border-[#E2E8F0] cursor-pointer group/img">
            <span className="absolute top-2 left-2 z-10 bg-[#0F172A]/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Intake</span>
            <Image 
              src={intakePhoto} 
              alt="Intake" 
              width={400}
              height={300}
              className="w-full h-24 lg:h-28 object-cover group-hover/img:scale-105 transition-transform duration-300" 
            />
          </div>
        )}
        {returnPhoto && (
          <div onClick={() => setLightboxOpen(true)} className="relative rounded-xl overflow-hidden border border-[#E2E8F0] cursor-pointer group/img">
            <span className="absolute top-2 left-2 z-10 bg-[#D97706]/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Return</span>
            <Image 
              src={returnPhoto} 
              alt="Return" 
              width={400}
              height={300}
              className="w-full h-24 lg:h-28 object-cover group-hover/img:scale-105 transition-transform duration-300" 
            />
          </div>
        )}
      </div>

      <div className="lg:w-[35%] p-6 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
           <h3 className="text-xl font-bold text-[#0F172A]">{itemName}</h3>
           <span className="bg-[#F1F5F9] text-[#1E293B] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E2E8F0] uppercase tracking-wider">{category}</span>
        </div>
        <p className="text-sm text-[#1E293B] font-medium mb-4">
          Renter: <span className="font-bold text-[#0F172A]">{renterName}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> RETURNED
          </span>
          
          <button 
            onClick={() => setChatOpen(true)}
            className="bg-white border border-[#E2E8F0] text-[#0F172A] text-[10px] font-bold px-2.5 py-1 rounded-full hover:bg-[#F8FAFC] transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Message
          </button>

          <span className="text-xs font-mono text-[#5C7FA8] font-medium">{startDate} → {endDate}</span>
        </div>
      </div>

      <div className="lg:w-[35%] p-6 flex flex-col justify-center items-end bg-[#F8FAFC]/50 border-t lg:border-t-0 lg:border-l border-[#E2E8F0]">
        {!claim && !showForm && (
          <>
            <div className="text-right mb-4 w-full">
              <p className="text-[10px] font-mono font-bold text-[#5C7FA8] uppercase tracking-widest mb-1">Escrow Held</p>
              <p className="text-3xl font-black text-[#0F172A]">₹{escrowAmount}</p>
            </div>
            <button onClick={() => setShowForm(true)} className="w-full bg-[#D97706] text-white rounded-xl py-3 text-sm font-bold shadow-sm hover:bg-[#B45309] transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Open Damage Claim
            </button>
          </>
        )}

        {showForm && (
          <div className="w-full">
             <OpenClaimForm transactionId={transactionId} itemName={itemName} photos={photoOptions} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {claim && (
          <div className="w-full space-y-3">
            <div className={`rounded-xl p-4 border ${claim.status === 'RESOLVED' ? 'bg-emerald-50 border-emerald-200' : claim.status === 'DISPUTED' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#0F172A] font-bold">Claim {claim.status}</p>
                <p className="font-bold text-[#0F172A]">₹{claim.damage_amount}</p>
              </div>
              {claim.description && <p className="text-xs text-[#1E293B] font-medium leading-snug">{claim.description}</p>}
              {claim.status === 'DISPUTED' && claim.dispute_reason && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-red-700 mb-1 font-bold">Dispute</p>
                  <p className="text-xs text-red-900 font-medium leading-snug">{claim.dispute_reason}</p>
                </div>
              )}
            </div>
            {claim.status !== 'RESOLVED' && <ResolveClaimButton claimId={claim.id} />}
          </div>
        )}
      </div>

      <PhotoLightbox open={lightboxOpen} intakeUrl={intakePhoto} returnUrl={returnPhoto} itemName={itemName} onClose={() => setLightboxOpen(false)} />
      {chatOpen && <ChatModal transactionId={transactionId} itemName={itemName} onClose={() => setChatOpen(false)} />}
    </div>
  )
}