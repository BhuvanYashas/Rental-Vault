'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function returnItem(
  listingId: string,
  itemId: string,
  photoUrl: string | null,
  note: string | null,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'operator')
    return { error: 'Only vault operators can process returns' }

  const { data: item, error: fetchError } = await supabase
    .from('items')
    .select('state')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) return { error: 'Item not found' }
  if (item.state !== 'RENTED')
    return { error: `Item is ${item.state}, cannot return` }

  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .select('id')
    .eq('listing_id', listingId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (txnError || !txn)
    return { error: 'No active rental found for this item' }

  const { error: updateTxnError } = await supabase
    .from('transactions')
    .update({ status: 'RETURNED' })
    .eq('id', txn.id)

  if (updateTxnError) return { error: updateTxnError.message }

  const { error: updateItemError } = await supabase
    .from('items')
    .update({ state: 'IN_VAULT' })
    .eq('id', itemId)

  if (updateItemError) return { error: updateItemError.message }

  const trimmed = note?.trim()
  await supabase.from('custody_events').insert({
    item_id: itemId,
    state: 'IN_VAULT',
    actor_id: user.id,
    notes: trimmed
      ? `Returned to vault — ${trimmed}`
      : 'Returned to vault, escrow released',
    photo_url: photoUrl,
  })

  revalidatePath('/')
  revalidatePath('/my-rentals')
  revalidatePath(`/listing/${listingId}`)

  return {}
}