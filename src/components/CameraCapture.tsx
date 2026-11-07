'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  onCapture: (url: string) => void
  label?: string
}

export default function CameraCapture({
  onCapture,
  label = 'Take photo',
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Attach the stream to the video element AFTER it renders
  useEffect(() => {
    if (!isOpen) return
    const video = videoRef.current
    const stream = streamRef.current
    if (!video || !stream) return

    video.srcObject = stream
    video.play().catch(() => {
      // Autoplay can be blocked; not fatal, browser will play on user gesture
    })
  }, [isOpen])

  async function openCamera() {
    setError(null)

    const attempts: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      {
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      { video: true },
    ]

    let stream: MediaStream | null = null
    let lastError: any = null

    for (const constraints of attempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        break
      } catch (err) {
        lastError = err
      }
    }

    if (!stream) {
      setError(
        lastError?.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera in browser settings.'
          : 'Could not access camera. Check your device permissions.',
      )
      return
    }

    // Sanity check: does the stream actually have a video track?
    const videoTracks = stream.getVideoTracks()
    if (videoTracks.length === 0) {
      stream.getTracks().forEach((t) => t.stop())
      setError('No video track available from camera')
      return
    }

    streamRef.current = stream
    setIsOpen(true) // this triggers the useEffect above
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsOpen(false)
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  async function captureAndUpload() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera not ready. Wait a moment and try again.')
      return
    }

    setIsUploading(true)
    setError(null)

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsUploading(false)
      return
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9),
    )

    if (!blob) {
      setError('Failed to capture image')
      setIsUploading(false)
      return
    }

    stopCamera()

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be signed in')
      setIsUploading(false)
      return
    }

    const path = `${user.id}/${Date.now()}-capture.jpg`
    const { error: uploadError } = await supabase.storage
      .from('item-photos')
      .upload(path, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      })

    if (uploadError) {
      setError(uploadError.message)
      setIsUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('item-photos')
      .getPublicUrl(path)

    setPreview(urlData.publicUrl)
    setIsUploading(false)
    onCapture(urlData.publicUrl)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-mono uppercase tracking-widest text-neutral-600">
        {label}
      </p>

      <canvas ref={canvasRef} className="hidden" />

      {!isOpen && !preview && (
        <button
          type="button"
          onClick={openCamera}
          disabled={isUploading}
          className="w-full bg-[#D97706] text-white rounded-xl py-3 font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {isUploading ? 'Uploading…' : '📷 Open Camera'}
        </button>
      )}

      {isOpen && (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-neutral-300 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={captureAndUpload}
              disabled={isUploading}
              className="flex-1 bg-amber-600 text-white rounded-xl py-3 font-medium hover:bg-amber-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading…' : 'Capture'}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              disabled={isUploading}
              className="px-5 bg-neutral-200 text-neutral-900 rounded-xl py-3 font-medium hover:bg-neutral-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Captured photo"
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