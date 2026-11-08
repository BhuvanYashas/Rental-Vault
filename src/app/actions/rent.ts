'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function rentItem(
  listingId: string,
  itemId: string,
  deposit: number,
  startDate: string,
  endDate: string,
  photoUrl: string | null,
  note: string | null,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to rent' }

  // 1. Fetch listing to get the daily rate
  const { data: listing } = await supabase
    .from('listings')
    .select('rate_per_day, items ( name )')
    .eq('id', listingId)
    .single()

  if (!listing) return { error: 'Listing not found' }

  const itemName = (listing.items as any)?.name || 'Item'
  const ratePerDay = listing.rate_per_day
  
  // 2. Calculate cost on server
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = end.getTime() - start.getTime()
  const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (rentalDays <= 0) return { error: 'Invalid rental dates.' }

  const rentalFee = ratePerDay * rentalDays
  const totalUpfrontCost = deposit + rentalFee

  // 3. Fetch user's wallet balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Could not load profile' }

  const currentBalance = profile.wallet_balance || 0
  if (currentBalance < totalUpfrontCost) {
    return { error: `Insufficient funds. You need ₹${totalUpfrontCost}, but your wallet only has ₹${currentBalance}.` }
  }

  // 4. ATOMIC LOCK
  const { data: updatedItem, error: updateError } = await supabase
    .from('items')
    .update({ state: 'RENTED' })
    .eq('id', itemId)
    .eq('state', 'IN_VAULT')
    .select()
    .single()

  if (updateError || !updatedItem) {
    return { error: 'This item was just rented by someone else.' }
  }

  // 5. Deduct from wallet
  const newBalance = currentBalance - totalUpfrontCost
  const { error: walletError } = await supabase
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', user.id)

  if (walletError) {
    await supabase.from('items').update({ state: 'IN_VAULT' }).eq('id', itemId)
    return { error: 'Failed to deduct funds from wallet.' }
  }

  // 6. Create transaction with USER SELECTED DATES
  const { error: txnError } = await supabase.from('transactions').insert({
    listing_id: listingId,
    renter_id: user.id,
    start_date: startDate, // Using the exact dates the user selected
    end_date: endDate,
    escrow_amount: totalUpfrontCost,
    status: 'ACTIVE',
  })

  if (txnError) {
    await supabase.from('items').update({ state: 'IN_VAULT' }).eq('id', itemId)
    await supabase.from('profiles').update({ wallet_balance: currentBalance }).eq('id', user.id)
    return { error: txnError.message }
  }

  // 7. Log wallet deduction
  await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    amount: -totalUpfrontCost,
    type: 'RENTAL_PAYMENT',
    description: `₹${rentalFee} Rent + ₹${deposit} Deposit for ${itemName}`
  })

  // 8. Log custody event
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
  revalidatePath('/profile')
  revalidatePath(`/listing/${listingId}`)

  return {}
}