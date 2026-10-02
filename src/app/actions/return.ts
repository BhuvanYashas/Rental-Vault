'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const TEST_OPERATOR_ID = '00000000-0000-0000-0000-000000000001'

export async function returnItem(
  listingId: string,
  itemId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: item, error: fetchError } = await supabase
    .from('items')
    .select('state')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) {
    return { error: 'Item not found' }
  }

  if (item.state !== 'RENTED') {
    return { error: `Item is ${item.state}, cannot return` }
  }

  // Find the active transaction for this item's listing
  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .select('id')
    .eq('listing_id', listingId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (txnError || !txn) {
    return { error: 'No active rental found for this item' }
  }

  // 1. Mark the transaction complete
  const { error: updateTxnError } = await supabase
    .from('transactions')
    .update({ status: 'RETURNED' })
    .eq('id', txn.id)

  if (updateTxnError) {
    return { error: updateTxnError.message }
  }

  // 2. Flip the item back to IN_VAULT
  const { error: updateItemError } = await supabase
    .from('items')
    .update({ state: 'IN_VAULT' })
    .eq('id', itemId)

  if (updateItemError) {
    return { error: updateItemError.message }
  }

  // 3. Log the custody event
  await supabase.from('custody_events').insert({
    item_id: itemId,
    state: 'IN_VAULT',
    actor_id: TEST_OPERATOR_ID,
    notes: 'Returned to vault, escrow released',
  })

  revalidatePath('/')
  revalidatePath(`/listing/${listingId}`)

  return {}
}