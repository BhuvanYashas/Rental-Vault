'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  const handleClose = () => {
    setZoomedImage(null)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedImage) setZoomedImage(null)
        else {
          setZoomedImage(null)
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, zoomedImage, onClose])

  if (!open) return null

  if (zoomedImage) {
    return (
      <div
        onClick={() => setZoomedImage(null)}
        className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 cursor-zoom-out"
      >
        <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
          <Image
            src={zoomedImage}
            alt="Zoomed evidence"
            fill
            referrerPolicy="no-referrer"
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 overflow-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-5xl w-full p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {itemName} — Evidence
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close lightbox"
            className="text-slate-500 hover:text-slate-900 text-2xl leading-none bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intakeUrl && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-600 mb-2 font-bold">Intake (before)</p>
              <div
                className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in hover:opacity-90 transition shadow-sm"
                onClick={() => setZoomedImage(intakeUrl)}
              >
                <Image src={intakeUrl} alt="Intake" fill referrerPolicy="no-referrer" className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </div>
          )}
          {returnUrl && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-600 mb-2 font-bold">Return (after)</p>
              <div
                className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in hover:opacity-90 transition shadow-sm"
                onClick={() => setZoomedImage(returnUrl)}
              >
                <Image src={returnUrl} alt="Return" fill referrerPolicy="no-referrer" className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}