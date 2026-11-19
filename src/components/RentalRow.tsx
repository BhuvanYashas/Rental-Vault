'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ChatButton from './ChatButton'
import DisputeClaimButton from './DisputeClaimButton'
import EscalateClaimButton from './EscalateClaimButton'
import ReviewModal from './ReviewModal'

export type RentalCustodyEvent = {
  id: string
  state: string
  notes: string | null
  photo_url: string | null
  created_at: string
}

export type RentalRowTransaction = {
  id: string
  status: string
  start_date: string
  end_date: string
  escrow_amount: number
  listings?: {
    id: string
    items?: {
      id: string
      name: string
      category: string
      custody_events?: RentalCustodyEvent[] | null
    } | null
  } | null
}

export type RentalRowClaim = {
  id: string
  damage_amount: number
  description: string | null
  status: string
  dispute_reason: string | null
  resolution: string | null
  escalation_reason: string | null
  platform_resolution: string | null
  platform_notes: string | null
}

export default function RentalRow({
  transaction,
  claim = null,
  hasReviewed = false,
}: {
  transaction: RentalRowTransaction
  claim?: RentalRowClaim | null
  hasReviewed?: boolean
}) {
  const [reviewOpen, setReviewOpen] = useState(false)

  const item = transaction.listings?.items
  if (!item || !transaction.listings) return null

  const isActive = transaction.status === 'ACTIVE'
  const events = (item.custody_events ?? [])
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const latestIntakePhoto = events.find((e) => e.state === 'RENTED' && e.photo_url)?.photo_url
  const latestReturnPhoto = events.find((e) => e.state === 'IN_VAULT' && e.photo_url)?.photo_url

  return (
    <div className="vault-card-3d rounded-2xl p-5">
      <Link href={`/listing/${transaction.listings.id}`} className="block hover:opacity-85 transition-opacity">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
            <p className="text-xs text-slate-600 mt-0.5 font-semibold uppercase tracking-wider">{item.category}</p>
          </div>
          <span
            className={`text-xs font-mono px-2.5 py-1 rounded-md font-bold ${
              isActive ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {transaction.status}
          </span>
        </div>

        <div className="flex justify-between text-xs text-slate-600 mt-4 pt-3.5 border-t border-slate-100 font-medium tabular-nums">
          <span className="font-mono">{transaction.start_date} → {transaction.end_date}</span>
          <span className="font-mono font-bold text-slate-900">Escrow ₹{transaction.escrow_amount}</span>
        </div>
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <ChatButton transactionId={transaction.id} itemName={item.name} />

        {!isActive && !hasReviewed && (
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className="text-sm font-bold text-[#B45309] hover:text-[#92400E] transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 fill-amber-500 text-amber-500" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Leave a Review
          </button>
        )}

        {hasReviewed && (
          <span className="text-sm font-bold text-emerald-700 inline-flex items-center gap-1">
            ✓ Reviewed
          </span>
        )}
      </div>

      {!isActive && (latestIntakePhoto || latestReturnPhoto) && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
          {latestIntakePhoto && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-600 mb-2 font-bold">Intake</p>
              <Image
                src={latestIntakePhoto}
                alt={`${item.name} intake`}
                width={400}
                height={300}
                referrerPolicy="no-referrer"
                className="w-full h-32 object-cover rounded-lg border border-slate-200"
              />
            </div>
          )}
          {latestReturnPhoto && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-600 mb-2 font-bold">Return</p>
              <Image
                src={latestReturnPhoto}
                alt={`${item.name} return`}
                width={400}
                height={300}
                referrerPolicy="no-referrer"
                className="w-full h-32 object-cover rounded-lg border border-slate-200"
              />
            </div>
          )}
        </div>
      )}

      {claim && <ClaimBanner claim={claim} />}

      {isActive && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3.5 border border-slate-200 font-medium">
            Bring this item to the vault to return it. An operator will verify its condition and release your escrow.
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

function ClaimBanner({ claim }: { claim: RentalRowClaim }) {
  const colorByStatus: Record<string, string> = {
    OPEN: 'bg-amber-50 border-amber-200',
    DISPUTED: 'bg-red-50 border-red-200',
    RESOLVED: 'bg-emerald-50 border-emerald-200',
    ESCALATED: 'bg-amber-50 border-amber-300',
  }
  const labelByStatus: Record<string, string> = {
    OPEN: 'Damage claim filed',
    DISPUTED: 'Claim disputed — under review',
    RESOLVED: 'Claim resolved',
    ESCALATED: 'Re-review requested — awaiting platform',
  }
  const canEscalate = claim.status === 'RESOLVED' && claim.resolution === 'VAULT_WINS' && !claim.platform_resolution

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <div className={`rounded-xl p-4 border ${colorByStatus[claim.status] ?? 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold">
            {labelByStatus[claim.status] ?? claim.status}
          </p>
          <p className="font-bold text-slate-900 tabular-nums">₹{claim.damage_amount}</p>
        </div>
        {claim.description && <p className="text-sm text-slate-700 font-medium">{claim.description}</p>}
        {claim.status === 'DISPUTED' && claim.dispute_reason && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-xs font-mono uppercase tracking-wider text-red-700 mb-1 font-bold">Your dispute</p>
            <p className="text-sm text-red-800 font-medium">{claim.dispute_reason}</p>
          </div>
        )}
        {claim.status === 'RESOLVED' && claim.resolution && !claim.platform_resolution && (
          <div className="mt-3 pt-3 border-t border-emerald-200">
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-700 mb-1 font-bold">Outcome</p>
            <p className="text-sm text-emerald-900 font-bold">
              {claim.resolution === 'VAULT_WINS' ? `Charged ₹${claim.damage_amount} to your escrow` : 'No charge — resolved in your favor'}
            </p>
          </div>
        )}
        {claim.status === 'ESCALATED' && claim.escalation_reason && (
          <div className="mt-3 pt-3 border-t border-amber-300">
            <p className="text-xs font-mono uppercase tracking-wider text-amber-800 mb-1 font-bold">Your re-review request</p>
            <p className="text-sm text-amber-900 font-medium">{claim.escalation_reason}</p>
          </div>
        )}
        {claim.platform_resolution && (
          <div className="mt-3 pt-3 border-t border-indigo-300">
            <p className="text-xs font-mono uppercase tracking-wider text-indigo-700 mb-1 font-bold">Final ruling · Platform</p>
            <p className="text-sm font-bold text-indigo-900">
              {claim.platform_resolution === 'RENTER_WINS' ? 'Reversed in your favor — no charge' : 'Upheld — charge stands'}
            </p>
            {claim.platform_notes && <p className="text-sm text-indigo-800 mt-2 font-medium">{claim.platform_notes}</p>}
          </div>
        )}
        {claim.status === 'OPEN' && <DisputeClaimButton claimId={claim.id} />}
        {canEscalate && <EscalateClaimButton claimId={claim.id} />}
      </div>
    </div>
  )
}