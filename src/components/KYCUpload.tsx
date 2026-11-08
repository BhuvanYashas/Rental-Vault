'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
    if (!user) return

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
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
        <p className="text-emerald-800 font-bold flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Identity Verified
        </p>
        <p className="text-emerald-600 text-sm mt-1">You have full access to the vault.</p>
      </div>
    )
  }

  if (currentStatus === 'pending') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-amber-800 font-bold flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Verification Pending
        </p>
        <p className="text-amber-600 text-sm mt-1">An operator is reviewing your ID.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-dashed border-[#5C7FA8]/40 rounded-xl p-6 text-center">
      <p className="text-[#0F172A] font-bold mb-2">Verify your identity</p>
      <p className="text-sm text-[#1E293B] mb-4">Upload your Aadhar, PAN, or College ID to unlock rentals.</p>
      
      <label className="cursor-pointer bg-[#0F172A] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1E293B] transition-colors inline-block">
        {uploading ? 'Uploading...' : 'Select ID Image'}
        <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
      </label>
      
      {error && <p className="text-red-600 text-sm mt-3 font-medium">{error}</p>}
    </div>
  )
}