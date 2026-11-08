'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitReview } from '@/app/actions/submitReview'

export default function ReviewModal({
  transactionId,
  itemId,
  itemName,
  onClose,
}: {
  transactionId: string
  itemId: string
  itemName: string
  onClose: () => void
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit() {
    if (rating === 0) return setError('Please select a star rating')
    
    setError(null)
    startTransition(async () => {
      const result = await submitReview(transactionId, itemId, rating, comment)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-[#0F172A] p-6 flex justify-between items-start">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] font-bold mb-1">Leave a Review</p>
            <h2 className="text-xl font-bold text-white">{itemName}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* STAR RATING */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <svg 
                    className={`w-10 h-10 ${(hover || rating) >= star ? 'text-[#D97706] fill-[#D97706]' : 'text-neutral-300 fill-transparent'}`} 
                    stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-[#5C7FA8]">
              {rating === 0 ? 'Tap to rate' : rating === 5 ? 'Excellent!' : rating >= 3 ? 'Good' : 'Poor'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[#5C7FA8] mb-2 font-bold">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the item? How was the owner?"
              rows={3}
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg font-bold">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || rating === 0}
            className="w-full bg-[#D97706] text-white rounded-xl py-3 font-bold hover:bg-[#B45309] hover:-translate-y-1 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {isPending ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}