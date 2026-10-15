'use client'

import { useEffect } from 'react'

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
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

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
                className="w-full rounded-lg border border-neutral-200"
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
                className="w-full rounded-lg border border-neutral-200"
              />
            </div>
          )}
        </div>

        <p className="text-xs text-neutral-500 text-center">
          Press Esc or click outside to close
        </p>
      </div>
    </div>
  )
}