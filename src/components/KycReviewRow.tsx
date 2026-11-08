'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { verifyKyc } from '@/app/actions/verifyKyc'
import { useRouter } from 'next/navigation'

export default function KycReviewRow({ person }: { person: any }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getDocument() {
      // 1. List all files in this user's folder
      const { data: files, error } = await supabase.storage
        .from('kyc-documents')
        .list(person.id)

      if (error) {
        console.error('Error listing files:', error)
        return
      }

      if (files && files.length > 0) {
        // 2. Get the first file found
        const fileName = files[0].name
        const filePath = `${person.id}/${fileName}`

        // 3. Create a secure, temporary URL for it
        const { data } = await supabase.storage
          .from('kyc-documents')
          .createSignedUrl(filePath, 300) // Valid for 5 minutes

        if (data?.signedUrl) {
          setImageUrl(data.signedUrl)
        }
      }
    }
    getDocument()
  }, [person.id, supabase])

  async function handleAction(status: 'verified' | 'rejected') {
    setIsPending(true)
    await verifyKyc(person.id, status)
    setIsPending(false)
    router.refresh()
  }

  return (
    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8FAFC]/50 transition-colors">
      <div>
        <p className="font-bold text-[#0F172A] text-lg">{person.username || person.full_name}</p>
        
        {/* 👇 FIXED HYDRATION ERROR HERE: Forced 'en-IN' locale 👇 */}
        <p className="text-sm text-[#1E293B] font-medium mt-1">
          Requested: {new Date(person.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        
        {imageUrl ? (
          <a href={imageUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#D97706] hover:underline mt-2 inline-block">
            View Uploaded ID Document →
          </a>
        ) : (
          <p className="text-sm text-red-500 font-medium mt-2">No document found (or loading...)</p>
        )}
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => handleAction('verified')} 
          disabled={isPending || !imageUrl} 
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          Approve
        </button>
        <button 
          onClick={() => handleAction('rejected')} 
          disabled={isPending || !imageUrl} 
          className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  )
}