'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(
  transactionId: string,
  itemId: string,
  rating: number,
  comment: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in' }
  if (rating < 1 || rating > 5) return { error: 'Invalid rating' }

  // 1. Verify the transaction belongs to this user and is RETURNED
  const { data: txn } = await supabase
    .from('transactions')
    .select('status, renter_id')
    .eq('id', transactionId)
    .single()

  if (!txn || txn.renter_id !== user.id || txn.status !== 'RETURNED') {
    return { error: 'You can only review completed rentals' }
  }

  // 2. Insert the review
  const { error: insertError } = await supabase.from('reviews').insert({
    transaction_id: transactionId,
    reviewer_id: user.id,
    item_id: itemId,
    rating: rating,
    comment: comment.trim() || null
  })

  if (insertError) {
    if (insertError.code === '23505') return { error: 'You already reviewed this rental' }
    return { error: insertError.message }
  }

  // 3. Recalculate the item's average rating
  const { data: allReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('item_id', itemId)

  if (allReviews && allReviews.length > 0) {
    const total = allReviews.reduce((sum, r) => sum + r.rating, 0)
    const average = total / allReviews.length
    
    await supabase
      .from('items')
      .update({ 
        average_rating: Math.round(average * 10) / 10, // Round to 1 decimal place
        review_count: allReviews.length 
      })
      .eq('id', itemId)
  }

  revalidatePath('/my-rentals')
  revalidatePath('/')
  
  return { success: true }
}