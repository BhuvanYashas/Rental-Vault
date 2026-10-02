'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const TEST_RENTER_ID = '00000000-0000-0000-0000-000000000003'

export async function rentItem(
  listingId: string,
  itemId: string,
  deposit: number
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

  if (item.state !== 'IN_VAULT') {
    return { error: `Item is currently ${item.state}, not available for rent` }
  }

  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 7)

  const { error: txnError } = await supabase
    .from('transactions')
    .insert({
      listing_id: listingId,
      renter_id: TEST_RENTER_ID,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      escrow_amount: deposit,
      status: 'ACTIVE',
    })

  if (txnError) {
    return { error: txnError.message }
  }

  const { error: updateError } = await supabase
    .from('items')
    .update({ state: 'RENTED' })
    .eq('id', itemId)

  if (updateError) {
    return { error: updateError.message }
  }

  await supabase.from('custody_events').insert({
    item_id: itemId,
    state: 'RENTED',
    actor_id: TEST_RENTER_ID,
    notes: 'Rental started',
  })

  revalidatePath('/')
  revalidatePath(`/listing/${listingId}`)

  return {}
}