'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function parseIsoDateLocal(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export async function rentItem(
  listingId: string,
  itemId: string,
  _clientDeposit: number,
  startDate: string,
  endDate: string,
  photoUrl: string | null,
  note: string | null,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to rent' }

  const { data: listing } = await supabase
    .from('listings')
    .select('rate_per_day, deposit, active, items ( name, state, owner_id )')
    .eq('id', listingId)
    .single()

  if (!listing) return { error: 'Listing not found' }
  if (!listing.active) return { error: 'This listing is not active yet.' }

  const itemData = listing.items as unknown as { name?: string; state?: string; owner_id?: string } | null
  if (itemData?.owner_id && itemData.owner_id === user.id) {
    return { error: 'You cannot rent your own listed item.' }
  }
  const itemName = itemData?.name || 'Item'
  const ratePerDay = listing.rate_per_day
  const deposit = listing.deposit

  const start = parseIsoDateLocal(startDate)
  const end = parseIsoDateLocal(endDate)
  if (!start || !end) {
    return { error: 'Please provide valid start and end dates.' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (start < today) {
    return { error: 'Start date cannot be in the past.' }
  }

  const diffTime = end.getTime() - start.getTime()
  const rentalDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (rentalDays <= 0) return { error: 'End date must be after the start date.' }

  const rentalFee = ratePerDay * rentalDays
  const totalUpfrontCost = deposit + rentalFee

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

  const newBalance = currentBalance - totalUpfrontCost
  const { data: updatedWallet, error: walletError } = await supabase
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', user.id)
    .eq('wallet_balance', currentBalance)
    .select()
    .single()

  if (walletError || !updatedWallet) {
    await supabase.from('items').update({ state: 'IN_VAULT' }).eq('id', itemId)
    return { error: 'Wallet balance changed during transaction. Please try again.' }
  }

  const { error: txnError } = await supabase.from('transactions').insert({
    listing_id: listingId,
    renter_id: user.id,
    start_date: startDate,
    end_date: endDate,
    escrow_amount: totalUpfrontCost,
    status: 'ACTIVE',
  })

  if (txnError) {
    await supabase.from('items').update({ state: 'IN_VAULT' }).eq('id', itemId)
    await supabase.from('profiles').update({ wallet_balance: currentBalance }).eq('id', user.id).eq('wallet_balance', newBalance)
    return { error: txnError.message }
  }

  await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    amount: -totalUpfrontCost,
    type: 'RENTAL_PAYMENT',
    description: `₹${rentalFee} Rent + ₹${deposit} Deposit for ${itemName}`,
  })

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
  revalidatePath('/owner/dashboard')
  revalidatePath('/operator')
  revalidatePath('/profile')
  revalidatePath(`/listing/${listingId}`)

  return {}
}