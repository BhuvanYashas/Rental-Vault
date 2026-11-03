'use client'

import { useEffect, useState } from 'react'

export default function PhotoLightbox({
  open,
  intakeUrl,
  returnUrl,
  itemName,
  onClose,
}: {
  open: boolean
  intakeUrl: string | null
  returnUrl: string | null
  itemName: string
  onClose: () => void
}) {
  // State to track if we are currently zooming into a specific image
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  // Close everything if the user presses Escape
  useEffect(() => {
    if (!open) {
      setZoomedImage(null) // reset zoom when closed
      return
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedImage) {
          setZoomedImage(null) // if zoomed, just un-zoom
        } else {
          onClose() // if not zoomed, close the whole lightbox
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, zoomedImage, onClose])

  if (!open) return null

  // 1. If an image is selected for zooming, show the full-screen view
  if (zoomedImage) {
    return (
      <div
        onClick={() => setZoomedImage(null)}
        className="fixed inset-0 bg-black z-[60] flex items-center justify-center p-4 cursor-zoom-out"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={zoomedImage}
          alt="Zoomed evidence"
          className="max-w-full max-h-[90vh] object-contain rounded"
        />
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-mono bg-black/50 px-4 py-2 rounded-full">
          Click anywhere or press Esc to close
        </p>
      </div>
    )
  }

  // 2. Otherwise, show the side-by-side comparison view
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 overflow-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-5xl w-full p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            {itemName} — evidence
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intakeUrl && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">
                Intake (before)
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={intakeUrl}
                alt="Intake"
                onClick={() => setZoomedImage(intakeUrl)}
                className="w-full rounded-lg border border-neutral-200 cursor-zoom-in hover:opacity-90 transition shadow-sm"
              />
            </div>
          )}
          {returnUrl && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-600 mb-2">
                Return (after)
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={returnUrl}
                alt="Return"
                onClick={() => setZoomedImage(returnUrl)}
                className="w-full rounded-lg border border-neutral-200 cursor-zoom-in hover:opacity-90 transition shadow-sm"
              />
            </div>
          )}
        </div>

        <p className="text-xs text-neutral-500 text-center flex items-center justify-center gap-2">
          <span>🔍 Click any photo to zoom in</span>
          <span>·</span>
          <span>Press Esc to close</span>
        </p>
      </div>
    </div>
  )
}