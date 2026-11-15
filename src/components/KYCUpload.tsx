'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import TiltCard from './TiltCard'

export default function KYCUpload({ currentStatus }: { currentStatus: string }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setUploading(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/id-card.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ kyc_status: 'pending' })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.refresh()
    }
    setUploading(false)
  }

  if (currentStatus === 'verified') {
    return (
      <TiltCard maxTilt={4}>
        <div className="vault-card-3d rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-white via-[#F4FAF7] to-[#E6F7EE]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-[0_4px_0_0_#065F46,0_10px_20px_-6px_rgba(5,150,105,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold">Trust Status</p>
              <h2 className="text-lg font-extrabold text-[#0F172A]">KYC Verified</h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Identity verified. You have full access to rent and list items in the vault.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 shadow-[0_3px_0_0_#065F46,inset_0_1px_0_rgba(255,255,255,0.3)] self-start sm:self-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Verified Member</span>
          </div>
        </div>
      </TiltCard>
    )
  }

  if (currentStatus === 'pending') {
    return (
      <TiltCard maxTilt={4}>
        <div className="vault-card-3d rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-white via-[#FFFBEB] to-[#FEF3C7]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-[0_4px_0_0_#B45309,0_10px_20px_-6px_rgba(217,119,6,0.45),inset_0_1px_0_rgba(255,255,255,0.4)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-amber-700 font-bold">Trust Status</p>
              <h2 className="text-lg font-extrabold text-[#0F172A]">KYC Verification Pending</h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                An operator is reviewing your submitted ID document.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 shadow-[0_3px_0_0_#B45309] self-start sm:self-center">
            Under Review
          </span>
        </div>
      </TiltCard>
    )
  }

  return (
    <TiltCard maxTilt={4}>
      <div className="vault-card-3d rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-[#F97316] flex items-center justify-center shrink-0 shadow-[0_4px_0_0_#020617,inset_0_1px_0_rgba(255,255,255,0.2)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#B45309] font-bold">Trust Status</p>
            <h2 className="text-lg font-extrabold text-[#0F172A]">Verify Your Identity (KYC)</h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Upload your Aadhar, PAN, or College ID to unlock rentals.
            </p>
            {error && <p className="text-red-700 text-xs mt-1.5 font-semibold">{error}</p>}
          </div>
        </div>

        <label className="cursor-pointer vault-btn-amber-3d text-white px-5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 self-start sm:self-center">
          {uploading ? 'Uploading...' : 'Select ID Image'}
          <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
    </TiltCard>
  )
}