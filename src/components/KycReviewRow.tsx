'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { verifyKyc } from '@/app/actions/verifyKyc'
import { useRouter } from 'next/navigation'

type PendingKycPerson = {
  id: string
  username: string | null
  full_name: string | null
  kyc_status: string
  created_at: string
}

export default function KycReviewRow({ person }: { person: PendingKycPerson }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function getDocument() {
      const { data: files, error } = await supabase.storage
        .from('kyc-documents')
        .list(person.id)

      if (error) return

      if (files && files.length > 0) {
        const filePath = `${person.id}/${files[0].name}`
        const { data } = await supabase.storage
          .from('kyc-documents')
          .createSignedUrl(filePath, 300)

        if (data?.signedUrl) setImageUrl(data.signedUrl)
      }
    }
    getDocument()
  }, [person.id, supabase])

  async function handleAction(status: 'verified' | 'rejected') {
    setIsPending(true)
    try {
      await verifyKyc(person.id, status)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
      <div>
        <p className="font-bold text-slate-900 text-lg">{person.username || person.full_name}</p>
        <p className="text-sm text-slate-600 font-medium mt-1">
          Requested:{' '}
          {new Date(person.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>

        {imageUrl ? (
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-bold text-[#B45309] hover:underline mt-2 inline-block"
          >
            View Uploaded ID Document →
          </a>
        ) : (
          <p className="text-sm text-slate-500 font-medium mt-2">Loading document...</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleAction('verified')}
          disabled={isPending || !imageUrl}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Approving...' : 'Approve'}
        </button>
        <button
          type="button"
          onClick={() => handleAction('rejected')}
          disabled={isPending || !imageUrl}
          className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
    </div>
  )
}