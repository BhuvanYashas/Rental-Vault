'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from './notifications'

export async function resolveEscalatedClaim(
  claimId: string,
  resolution: 'VAULT_WINS' | 'RENTER_WINS',
  notes: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'platform') return { error: 'Only platform reviewers can resolve escalated claims' }

  if (!notes.trim()) return { error: 'Please write your reasoning — the renter will see it' }

  // 1. Fetch full claim details to handle the financial reversal
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
  if (claim.status !== 'ESCALATED') return { error: 'Claim is not awaiting platform review' }

  const txn = claim.transactions as unknown as {
    renter_id: string
    listings?: { items?: { owner_id: string; name: string } | null } | null
  } | null
  const item = txn?.listings?.items
  if (!txn || !item) return { error: 'Associated transaction or item not found' }

  // 2. FINANCIAL REVERSAL: If the platform overturns the vault's ruling
  if (resolution === 'RENTER_WINS') {
    // Fetch current balances
    const { data: renterProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', txn.renter_id).single()
    const { data: ownerProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', item.owner_id).single()

    const renterBalance = renterProfile?.wallet_balance || 0
    const ownerBalance = ownerProfile?.wallet_balance || 0

    // Refund Renter
    await supabase.from('profiles').update({ wallet_balance: renterBalance + claim.damage_amount }).eq('id', txn.renter_id)
    
    // Deduct from Owner
    await supabase.from('profiles').update({ wallet_balance: ownerBalance - claim.damage_amount }).eq('id', item.owner_id)

    // Log the reversal
    await supabase.from('wallet_transactions').insert([
      { user_id: txn.renter_id, amount: claim.damage_amount, type: 'ESCROW_RELEASE', description: `Platform re-review refund for ${item.name}` },
      { user_id: item.owner_id, amount: -claim.damage_amount, type: 'RENTAL_PAYMENT', description: `Platform re-review penalty deduction for ${item.name}` }
    ])
  }

  // 3. Update Claim Status
  const { error: updateError } = await supabase
    .from('claims')
    .update({
      status: 'RESOLVED',
      platform_resolution: resolution,
      platform_resolved_by: user.id,
      platform_resolved_at: new Date().toISOString(),
      platform_notes: notes.trim(),
    })
    .eq('id', claimId)

  if (updateError) return { error: updateError.message }

  // 4. Notify the Renter
  const renterMsg = resolution === 'RENTER_WINS' 
    ? `The platform reviewed your case and reversed the decision in your favor. ₹${claim.damage_amount} has been refunded to your wallet.`
    : `The platform reviewed your case and upheld the operator's decision. The claim stands.`
    
  await sendNotification(txn.renter_id, 'Platform Review Complete', renterMsg, '/my-rentals')

  revalidatePath('/my-rentals')
  revalidatePath('/operator')
  revalidatePath('/platform')
  revalidatePath('/profile')

  return {}
}