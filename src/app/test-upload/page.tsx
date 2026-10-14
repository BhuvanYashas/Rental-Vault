'use client'

import { useState } from 'react'
import PhotoUpload from '@/components/PhotoUpload'

export default function TestUploadPage() {
  const [url, setUrl] = useState<string | null>(null)

  return (
    <main className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Photo upload test</h1>
      <PhotoUpload
        onUploadComplete={(u) => {
          setUrl(u)
          console.log('Uploaded:', u)
        }}
        label="Test photo"
      />
      {url && (
        <p className="text-xs font-mono break-all text-neutral-500">
          URL: {url}
        </p>
      )}
    </main>
  )
}