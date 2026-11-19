'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from './notifications'

export async function approveListing(
  listingId: string, 
  itemId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'operator') {
    return { error: 'Only vault operators can approve listings' }
  }

  // 1. Make the listing active (ONLY if it is currently inactive)
  const { data: updatedListing, error: listingError } = await supabase
    .from('listings')
    .update({ active: true })
    .eq('id', listingId)
    .eq('active', false) // 👈 Prevents double-approval
    .select()
    .single()

  if (listingError || !updatedListing) {
    return { error: 'This listing is already active or could not be found.' }
  }

  // 2. Log the approval in the custody events
  await supabase.from('custody_events').insert({
    item_id: itemId,
    state: 'IN_VAULT',
    actor_id: user.id,
    notes: 'Item inspected and approved by operator',
  })

  // 3. Send notification to the OWNER
  const { data: itemData } = await supabase.from('items').select('owner_id, name').eq('id', itemId).single()
  
  if (itemData?.owner_id) {
    try {
      await sendNotification(
        itemData.owner_id,
        'Listing Approved',
        `Your item "${itemData.name}" has been inspected and is now live in the vault!`,
        '/owner/dashboard'
      )
    } catch (notifyErr) {
      console.error('Failed to send listing approval notification:', notifyErr)
    }
  }

  revalidatePath('/')
  revalidatePath('/operator')
  revalidatePath('/owner/dashboard')

  return { success: true }
}