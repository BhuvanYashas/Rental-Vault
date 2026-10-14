'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function PhotoUpload({
  onUploadComplete,
  label = 'Upload photo',
}: {
  onUploadComplete: (url: string) => void
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be signed in to upload photos')
      setUploading(false)
      return
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('item-photos')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('item-photos')
      .getPublicUrl(path)

    setPreview(urlData.publicUrl)
    setUploading(false)
    onUploadComplete(urlData.publicUrl)
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-600">
          {label}
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          disabled={uploading}
          className="mt-2 block w-full text-sm text-neutral-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neutral-900 file:text-white file:cursor-pointer hover:file:bg-neutral-800 disabled:opacity-50"
        />
      </label>

      {uploading && (
        <p className="text-xs text-neutral-600 font-mono">Uploading…</p>
      )}

      {preview && (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <Image
            src={preview}
            alt="Upload preview"
            width={600}
            height={400}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}