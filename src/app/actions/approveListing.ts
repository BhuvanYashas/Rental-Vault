'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveListing(listingId: string, itemId: string) {
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

  if (profile?.role !== 'operator') {
    return { error: 'Only vault operators can approve listings' }
  }

  // 1. Make the listing active
  const { error: listingError } = await supabase
    .from('listings')
    .update({ active: true })
    .eq('id', listingId)

  if (listingError) return { error: listingError.message }

  // 2. Log the approval in the custody events
  await supabase.from('custody_events').insert({
    item_id: itemId,
    state: 'IN_VAULT',
    actor_id: user.id,
    notes: 'Item inspected and approved by operator',
  })

  revalidatePath('/')
  revalidatePath('/operator')
  revalidatePath('/owner/dashboard')

  return { success: true }
}