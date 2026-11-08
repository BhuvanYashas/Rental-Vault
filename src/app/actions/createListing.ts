'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createListing(
  name: string,
  category: string,
  ratePerDay: number,
  deposit: number,
  photoUrl: string,
  serialNumber: string,
  notes: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to list an item' }

  // 1. Enhanced Validation
  if (!name.trim() || !category.trim()) {
    return { error: 'Name and category are required' }
  }
  if (ratePerDay <= 0 || deposit <= 0) {
    return { error: 'Rate and deposit must be greater than zero' }
  }
  if (name.trim().length > 100) {
    return { error: 'Item name is too long (max 100 characters)' }
  }

  // 2. Create the Item
  const { data: item, error: itemError } = await supabase
    .from('items')
    .insert({
      owner_id: user.id,
      name: name.trim(),
      category: category.trim(),
      serial_number: serialNumber.trim() || null,
      grade: 'A', 
      state: 'IN_VAULT',
      photos: photoUrl ? [photoUrl] : [],
      notes: notes.trim() || null, // 👈 SAVING THE NOTES NOW
    })
    .select('id')
    .single()

  if (itemError || !item) {
    return { error: itemError?.message || 'Failed to create item' }
  }

  // 3. Create the Listing
  const { error: listingError } = await supabase.from('listings').insert({
    item_id: item.id,
    rate_per_day: ratePerDay,
    deposit: deposit,
    active: false, 
  })

  if (listingError) {
    // 👇 CRITICAL: Rollback the item if the listing fails
    await supabase.from('items').delete().eq('id', item.id)
    return { error: 'Failed to create listing. Please try again.' }
  }

  revalidatePath('/')
  revalidatePath('/my-rentals')
  revalidatePath('/owner/dashboard')

  return { success: true }
}