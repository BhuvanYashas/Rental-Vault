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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in to list an item' }

  if (!name.trim() || !category.trim() || !ratePerDay || !deposit) {
    return { error: 'Please fill in all required fields' }
  }

  // 1. Create the Item
  const { data: item, error: itemError } = await supabase
    .from('items')
    .insert({
      owner_id: user.id,
      name: name.trim(),
      category: category.trim(),
      serial_number: serialNumber.trim() || null,
      grade: 'A', // Default grade until operator reviews
      state: 'IN_VAULT',
      photos: photoUrl ? [photoUrl] : [],
    })
    .select('id')
    .single()

  if (itemError || !item) {
    return { error: itemError?.message || 'Failed to create item' }
  }

  // 2. Create the Listing (inactive by default)
  const { error: listingError } = await supabase.from('listings').insert({
    item_id: item.id,
    rate_per_day: ratePerDay,
    deposit: deposit,
    active: false, // Requires operator approval
  })

  if (listingError) {
    return { error: listingError.message }
  }

  revalidatePath('/')
  revalidatePath('/my-rentals')
  revalidatePath('/owner/dashboard')

  return { success: true }
}