'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function rentItem(
  listingId: string,
  itemId: string,
  deposit: number,
  photoUrl: string | null,
  note: string | null,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in to rent' }

  // 👇 THE RACE CONDITION FIX 👇
  // Instead of reading the state first and then updating, we do an atomic
  // conditional update. This will ONLY succeed if the state is still IN_VAULT.
  const { data: updatedItem, error: updateError } = await supabase
    .from('items')
    .update({ state: 'RENTED' })
    .eq('id', itemId)
    .eq('state', 'IN_VAULT') // <-- The magic line
    .select()
    .single()

  // If no row was updated (updatedItem is null), it means someone else rented it first.
  if (updateError || !updatedItem) {
    return { error: 'This item was just rented by someone else. Please try another item.' }
  }

  // Now that we successfully locked the item, we create the transaction
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 7)

  const { error: txnError } = await supabase.from('transactions').insert({
    listing_id: listingId,
    renter_id: user.id,
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
    escrow_amount: deposit,
    status: 'ACTIVE',
  })

  if (txnError) {
    // If the transaction fails, we should ideally rollback the item state.
    // Since Supabase doesn't support multi-statement transactions via the JS client,
    // we do a manual rollback here.
    await supabase.from('items').update({ state: 'IN_VAULT' }).eq('id', itemId)
    return { error: txnError.message }
  }

  const trimmed = note?.trim()
  await supabase.from('custody_events').insert({
    item_id: itemId,
    state: 'RENTED',
    actor_id: user.id,
    notes: trimmed ? `Rental started — ${trimmed}` : 'Rental started',
    photo_url: photoUrl,
  })

  revalidatePath('/')
  revalidatePath('/my-rentals')
  revalidatePath(`/listing/${listingId}`)

  return {}
}