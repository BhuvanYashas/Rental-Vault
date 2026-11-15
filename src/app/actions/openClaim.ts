'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from './notifications'

export async function openClaim(
  transactionId: string,
  damageAmount: number,
  description: string,
  evidence: string[],
): Promise<{ error?: string; claimId?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'operator') return { error: 'Only vault operators can open claims' }

  if (!damageAmount || damageAmount <= 0) return { error: 'Damage amount must be greater than zero' }
  if (!description.trim()) return { error: 'Description is required' }
  if (!evidence || evidence.length === 0) return { error: 'At least one evidence photo is required' }

  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .select(`
      id, status, renter_id, escrow_amount,
      listings ( id, items ( owner_id, name ) )
    `)
    .eq('id', transactionId)
    .single()

  if (txnError || !txn) return { error: 'Transaction not found' }
  if (txn.status !== 'RETURNED') return { error: 'Claims can only be opened on returned rentals' }

  const listing = txn.listings as unknown as {
    id?: string
    items?: { owner_id?: string; name?: string } | null
  } | null
  const item = listing?.items

  // Conflict of Interest Checks
  if (txn.renter_id === user.id) return { error: 'You cannot open a claim on your own rental.' }
  if (item?.owner_id && item.owner_id === user.id) return { error: 'You cannot open a claim on an item you own.' }

  // Prevent duplicate claims
  const { data: existing } = await supabase
    .from('claims')
    .select('id')
    .eq('transaction_id', transactionId)
    .in('status', ['OPEN', 'DISPUTED', 'ESCALATED'])
    .maybeSingle()

  if (existing) return { error: 'An active claim already exists for this rental' }

  // Cap the damage amount at the total escrow paid
  if (damageAmount > txn.escrow_amount) {
    return { error: `Damage amount cannot exceed the total escrow paid (₹${txn.escrow_amount}).` }
  }

  const { data: claim, error: insertError } = await supabase
    .from('claims')
    .insert({
      transaction_id: transactionId,
      damage_amount: damageAmount,
      description: description.trim(),
      evidence,
      status: 'OPEN',
    })
    .select('id')
    .single()

  if (insertError || !claim) return { error: insertError?.message ?? 'Failed to create claim' }

  // Notify the Renter
  await sendNotification(
    txn.renter_id,
    'Damage Claim Filed',
    `A damage claim of ₹${damageAmount} has been filed for your rental (${item?.name}). Please review it in your dashboard.`,
    '/my-rentals'
  )

  revalidatePath('/operator')
  revalidatePath('/my-rentals')
  if (listing?.id) revalidatePath(`/listing/${listing.id}`)

  return { claimId: claim.id }
}