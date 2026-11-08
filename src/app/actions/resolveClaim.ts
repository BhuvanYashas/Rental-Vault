'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from './notifications'

export async function resolveClaim(
  claimId: string,
  resolution: 'VAULT_WINS' | 'RENTER_WINS',
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'operator') return { error: 'Only vault operators can resolve claims' }

  const { data: claim } = await supabase
    .from('claims')
    .select(`
      status, damage_amount, transaction_id,
      transactions (
        renter_id,
        listings ( items ( owner_id, name ) )
      )
    `)
    .eq('id', claimId)
    .single()

  if (!claim) return { error: 'Claim not found' }
  if (claim.status === 'RESOLVED' || claim.status === 'ESCALATED') {
    return { error: 'Claim is already resolved or escalated to platform review.' }
  }

  const txn = claim.transactions as any
  const item = txn?.listings?.items

  // Conflict of Interest Checks
  if (txn?.renter_id === user.id) return { error: 'You cannot resolve a claim on a rental you made.' }
  if (item?.owner_id && item.owner_id === user.id) return { error: 'You cannot resolve a claim on an item you own.' }

  // === FINANCIAL LOGIC: Move the money ===
  if (resolution === 'VAULT_WINS') {
    // 1. Fetch Renter's current wallet
    const { data: renterProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', txn.renter_id).single()
    const renterBalance = renterProfile?.wallet_balance || 0

    // 2. Fetch Owner's current wallet
    const { data: ownerProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', item.owner_id).single()
    const ownerBalance = ownerProfile?.wallet_balance || 0

    // 3. Deduct from Renter (Allow negative balance for debt collection if needed)
    await supabase.from('profiles').update({ wallet_balance: renterBalance - claim.damage_amount }).eq('id', txn.renter_id)
    
    // 4. Add to Owner
    await supabase.from('profiles').update({ wallet_balance: ownerBalance + claim.damage_amount }).eq('id', item.owner_id)

    // 5. Log wallet transactions
    await supabase.from('wallet_transactions').insert([
      { user_id: txn.renter_id, amount: -claim.damage_amount, type: 'RENTAL_PAYMENT', description: `Damage claim penalty for ${item.name}` },
      { user_id: item.owner_id, amount: claim.damage_amount, type: 'ESCROW_RELEASE', description: `Damage compensation for ${item.name}` }
    ])
  }

  // Update Claim Status
  const { error: updateError } = await supabase
    .from('claims')
    .update({
      status: 'RESOLVED',
      resolution,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', claimId)

  if (updateError) return { error: updateError.message }

  // Notify the Renter
  const msg = resolution === 'VAULT_WINS' 
    ? `The claim was resolved. A penalty of ₹${claim.damage_amount} was deducted from your wallet.`
    : `The claim against you was resolved in your favor. No penalty was charged.`
    
  await sendNotification(txn.renter_id, 'Damage Claim Resolved', msg, '/my-rentals')

  revalidatePath('/operator')
  revalidatePath('/my-rentals')
  revalidatePath('/profile')

  return {}
}