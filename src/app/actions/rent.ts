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

  const { data: item, error: fetchError } = await supabase
    .from('items')
    .select('state')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) return { error: 'Item not found' }
  if (item.state !== 'IN_VAULT')
    return { error: `Item is currently ${item.state}, not available for rent` }

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

  if (txnError) return { error: txnError.message }

  const { error: updateError } = await supabase
    .from('items')
    .update({ state: 'RENTED' })
    .eq('id', itemId)

  if (updateError) return { error: updateError.message }

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