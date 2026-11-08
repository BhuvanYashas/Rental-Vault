'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ChatButton from './ChatButton'
import DisputeClaimButton from './DisputeClaimButton'
import EscalateClaimButton from './EscalateClaimButton'
import ReviewModal from './ReviewModal'

export default function RentalRow({ 
  transaction, 
  claim = null, 
  hasReviewed = false 
}: { 
  transaction: any, 
  claim?: any, 
  hasReviewed?: boolean 
}) {
  const [reviewOpen, setReviewOpen] = useState(false)

  const item = transaction.listings?.items
  if (!item) return null

  const isActive = transaction.status === 'ACTIVE'
  const events = (item.custody_events ?? []).slice().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const latestIntakePhoto = events.find((e: any) => e.state === 'RENTED' && e.photo_url)?.photo_url
  const latestReturnPhoto = events.find((e: any) => e.state === 'IN_VAULT' && e.photo_url)?.photo_url

  return (
    <div className="bg-white border border-[#5C7FA8] rounded-xl p-5 shadow-sm">
      <Link href={`/listing/${transaction.listings.id}`} className="block hover:opacity-80 transition">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-[#0F172A]">{item.name}</h3>
            <p className="text-xs text-[#1E293B] mt-0.5 font-medium">{item.category}</p>
          </div>
          <span className={`text-xs font-mono px-2.5 py-1 rounded font-bold ${isActive ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'}`}>
            {transaction.status}
          </span>
        </div>

        <div className="flex justify-between text-xs text-[#1E293B] mt-4 pt-4 border-t border-[#E2E8F0] font-medium">
          <span className="font-mono">{transaction.start_date} → {transaction.end_date}</span>
          <span className="font-mono font-bold text-[#0F172A]">Escrow ₹{transaction.escrow_amount}</span>
        </div>
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <ChatButton transactionId={transaction.id} itemName={item.name} />
        
        {!isActive && !hasReviewed && (
          <button 
            type="button" 
            onClick={() => setReviewOpen(true)}
            className="text-sm font-bold text-[#D97706] hover:text-[#B45309] transition-colors flex items-center gap-1.5"
          >
            ⭐ Leave a Review
          </button>
        )}

        {hasReviewed && (
          <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
            ✓ Reviewed
          </span>
        )}
      </div>

      {!isActive && (latestIntakePhoto || latestReturnPhoto) && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] grid grid-cols-2 gap-3">
          {latestIntakePhoto && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">Intake</p>
              <Image src={latestIntakePhoto} alt={`${item.name} intake`} width={400} height={300} className="w-full h-32 object-cover rounded-lg border border-[#5C7FA8]" />
            </div>
          )}
          {latestReturnPhoto && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] mb-2 font-bold">Return</p>
              <Image src={latestReturnPhoto} alt={`${item.name} return`} width={400} height={300} className="w-full h-32 object-cover rounded-lg border border-[#5C7FA8]" />
            </div>
          )}
        </div>
      )}

      {claim && <ClaimBanner claim={claim} />}

      {isActive && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
          <p className="text-sm text-[#0F172A] bg-[#E2E8F0] rounded-lg p-4 border border-[#5C7FA8]/30 font-medium">
            Please bring this item to the vault to return it. An operator will verify the condition and release your escrow.
          </p>
        </div>
      )}

      {reviewOpen && (
        <ReviewModal 
          transactionId={transaction.id} 
          itemId={item.id} 
          itemName={item.name} 
          onClose={() => setReviewOpen(false)} 
        />
      )}
    </div>
  )
}

function ClaimBanner({ claim }: { claim: any }) {
  const colorByStatus: Record<string, string> = { OPEN: 'bg-amber-50 border-amber-200', DISPUTED: 'bg-red-50 border-red-200', RESOLVED: 'bg-emerald-50 border-emerald-200', ESCALATED: 'bg-amber-50 border-amber-300' }
  const labelByStatus: Record<string, string> = { OPEN: 'Damage claim filed', DISPUTED: 'Claim disputed — under review', RESOLVED: 'Claim resolved', ESCALATED: 'Re-review requested — awaiting platform' }
  const canEscalate = claim.status === 'RESOLVED' && claim.resolution === 'VAULT_WINS' && !claim.platform_resolution

  return (
    <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
      <div className={`rounded-lg p-4 border ${colorByStatus[claim.status] ?? 'bg-neutral-50 border-neutral-200'}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs font-mono uppercase tracking-widest text-[#0F172A] font-bold">{labelByStatus[claim.status] ?? claim.status}</p>
          <p className="font-bold text-[#0F172A]">₹{claim.damage_amount}</p>
        </div>
        {claim.description && <p className="text-sm text-[#1E293B] font-medium">{claim.description}</p>}
        {claim.status === 'DISPUTED' && claim.dispute_reason && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-xs font-mono uppercase tracking-widest text-red-700 mb-1 font-bold">Your dispute</p>
            <p className="text-sm text-red-800 font-medium">{claim.dispute_reason}</p>
          </div>
        )}
        {claim.status === 'RESOLVED' && claim.resolution && !claim.platform_resolution && (
          <div className="mt-3 pt-3 border-t border-emerald-200">
            <p className="text-xs font-mono uppercase tracking-widest text-emerald-700 mb-1 font-bold">Outcome</p>
            <p className="text-sm text-emerald-900 font-bold">{claim.resolution === 'VAULT_WINS' ? `Charged ₹${claim.damage_amount} to your escrow` : 'No charge — resolved in your favor'}</p>
          </div>
        )}
        {claim.status === 'ESCALATED' && claim.escalation_reason && (
          <div className="mt-3 pt-3 border-t border-amber-300">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-800 mb-1 font-bold">Your re-review request</p>
            <p className="text-sm text-amber-900 font-medium">{claim.escalation_reason}</p>
          </div>
        )}
        {claim.platform_resolution && (
          <div className="mt-3 pt-3 border-t border-indigo-300">
            <p className="text-xs font-mono uppercase tracking-widest text-indigo-700 mb-1 font-bold">Final ruling · Platform</p>
            <p className="text-sm font-bold text-indigo-900">{claim.platform_resolution === 'RENTER_WINS' ? 'Reversed in your favor — no charge' : 'Upheld — charge stands'}</p>
            {claim.platform_notes && <p className="text-sm text-indigo-800 mt-2 font-medium">{claim.platform_notes}</p>}
          </div>
        )}
        {claim.status === 'OPEN' && <DisputeClaimButton claimId={claim.id} />}
        {canEscalate && <EscalateClaimButton claimId={claim.id} />}
      </div>
    </div>
  )
}