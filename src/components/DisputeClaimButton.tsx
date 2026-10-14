'use client'

import { useState } from 'react'
import DisputeClaimForm from './DisputeClaimForm'

export default function DisputeClaimButton({ claimId }: { claimId: string }) {
  const [showForm, setShowForm] = useState(false)

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline"
      >
        Dispute this claim
      </button>
    )
  }

  return (
    <DisputeClaimForm
      claimId={claimId}
      onCancel={() => setShowForm(false)}
    />
  )
}