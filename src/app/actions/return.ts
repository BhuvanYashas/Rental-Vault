'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function returnItem(
  listingId: string,
  itemId: string,
  photoUrl: string | null,
  note: string | null,
): Promise<{ error?: string; lateFee?: number }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in' }

  // 1. Verify Operator Role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'operator') return { error: 'Only vault operators can process returns' }

  // 2. Fetch Transaction with nested Listing and Item data
  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .select(`
      id, renter_id, end_date, escrow_amount,
      listings (
        rate_per_day, deposit,
        items ( owner_id, state )
      )
    `)
    .eq('listing_id', listingId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (txnError || !txn) return { error: 'No active rental found for this item' }

  const listing = txn.listings as any
  const item = listing?.items
  const ownerId = item?.owner_id
  const ratePerDay = listing?.rate_per_day || 0
  const deposit = listing?.deposit || 0
  
  if (item.state !== 'RENTED') return { error: `Item is ${item.state}, cannot return` }

  // 3. Conflict of Interest Check
  if (txn.renter_id === user.id) {
    return { error: 'You cannot process a return for your own rental. Ask another operator.' }
  }

  // 4. Calculate Late Fee (1.5x daily rate per day late)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(txn.end_date)
  endDate.setHours(0, 0, 0, 0)

  let lateFee = 0
  let lateDays = 0

  if (today > endDate) {
    const diffTime = Math.abs(today.getTime() - endDate.getTime())
    lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    lateFee = Math.round(lateDays * (ratePerDay * 1.5))
  }

  // 5. Calculate Financial Split
  const rentalFee = txn.escrow_amount - deposit
  const renterRefund = Math.max(0, deposit - lateFee) // Refund cannot go below 0
  const ownerPayout = rentalFee + lateFee

  // 6. ATOMIC LOCK: Only return if item is still RENTED
  const { data: updatedItem, error: updateItemError } = await supabase
    .from('items')
    .update({ state: 'IN_VAULT' })
    .eq('id', itemId)
    .eq('state', 'RENTED')
    .select()
    .single()

  if (updateItemError || !updatedItem) {
    return { error: 'This item has already been returned or is currently in dispute.' }
  }

  // 7. Mark the transaction complete
  const { error: updateTxnError } = await supabase
    .from('transactions')
    .update({ status: 'RETURNED' })
    .eq('id', txn.id)

  if (updateTxnError) return { error: updateTxnError.message }

  // 8. Pay the Owner
  const { data: ownerProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', ownerId).single()
  if (ownerProfile) {
    const newOwnerBalance = (ownerProfile.wallet_balance || 0) + ownerPayout
    await supabase.from('profiles').update({ wallet_balance: newOwnerBalance }).eq('id', ownerId)
    await supabase.from('wallet_transactions').insert({
      user_id: ownerId,
      amount: ownerPayout,
      type: 'ESCROW_RELEASE',
      description: `Payout for rental: ₹${rentalFee} Rent + ₹${lateFee} Late Fee`
    })
  }

  // 9. Refund the Renter
  const { data: renterProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', txn.renter_id).single()
  if (renterProfile && renterRefund > 0) {
    const newRenterBalance = (renterProfile.wallet_balance || 0) + renterRefund
    await supabase.from('profiles').update({ wallet_balance: newRenterBalance }).eq('id', txn.renter_id)
    await supabase.from('wallet_transactions').insert({
      user_id: txn.renter_id,
      amount: renterRefund,
      type: 'ESCROW_RELEASE',
      description: `Deposit refund${lateFee > 0 ? ` (after ₹${lateFee} late fee)` : ''}`
    })
  }

  // 10. Log the custody event
  const baseNote = note?.trim() ? `Returned to vault — ${note.trim()}` : 'Returned to vault'
  const finalNote = lateFee > 0 
    ? `${baseNote} | LATE FEE: ₹${lateFee} (${lateDays} days late). Owner paid out: ₹${ownerPayout}.`
    : `${baseNote}. Owner paid out: ₹${ownerPayout}.`

  await supabase.from('custody_events').insert({
    item_id: itemId,
    state: 'IN_VAULT',
    actor_id: user.id,
    notes: finalNote,
    photo_url: photoUrl,
  })

  revalidatePath('/')
  revalidatePath('/my-rentals')
  revalidatePath('/operator')
  revalidatePath('/profile') // So wallet balances update visually
  revalidatePath(`/listing/${listingId}`)

  return { lateFee }
}