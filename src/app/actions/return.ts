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

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'operator') return { error: 'Only vault operators can process returns' }

  const { data: item, error: fetchError } = await supabase.from('items').select('state').eq('id', itemId).single()
  if (fetchError || !item) return { error: 'Item not found' }
  if (item.state !== 'RENTED') return { error: `Item is ${item.state}, cannot return` }

  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .select('id, end_date, escrow_amount')
    .eq('listing_id', listingId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (txnError || !txn) return { error: 'No active rental found for this item' }

  // === CALCULATE LATE FEE ===
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to midnight for accurate day calculation
  
  const endDate = new Date(txn.end_date)
  endDate.setHours(0, 0, 0, 0)

  let lateFee = 0
  let lateDays = 0

  if (today > endDate) {
    const diffTime = Math.abs(today.getTime() - endDate.getTime())
    lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    // Example rule: ₹100 per day late. 
    // You could also fetch the listing rate and multiply it by 1.5.
    lateFee = lateDays * 100 
  }

  // 1. Mark the transaction complete
  const { error: updateTxnError } = await supabase
    .from('transactions')
    .update({ status: 'RETURNED' })
    .eq('id', txn.id)

  if (updateTxnError) return { error: updateTxnError.message }

  // 2. Flip the item back to IN_VAULT
  const { error: updateItemError } = await supabase
    .from('items')
    .update({ state: 'IN_VAULT' })
    .eq('id', itemId)

  if (updateItemError) return { error: updateItemError.message }

  // 3. Log the custody event with the late fee details
  const baseNote = note?.trim() ? `Returned to vault — ${note.trim()}` : 'Returned to vault, escrow released'
  const finalNote = lateFee > 0 
    ? `${baseNote} | LATE FEE APPLIED: ₹${lateFee} (${lateDays} days late)`
    : baseNote

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
  revalidatePath(`/listing/${listingId}`)

  return { lateFee }
}