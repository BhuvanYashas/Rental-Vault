'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function openClaim(
  transactionId: string,
  damageAmount: number,
  description: string,
  evidence: string[],
): Promise<{ error?: string; claimId?: string }> {
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
    return { error: 'Only vault operators can open claims' }
  }

  if (!damageAmount || damageAmount <= 0) {
    return { error: 'Damage amount must be greater than zero' }
  }

  if (!description.trim()) {
    return { error: 'Description is required' }
  }

  if (!evidence || evidence.length === 0) {
    return { error: 'At least one evidence photo is required' }
  }

  // Ensure the transaction exists and is already returned
  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .select('id, status')
    .eq('id', transactionId)
    .single()

  if (txnError || !txn) return { error: 'Transaction not found' }
  if (txn.status !== 'RETURNED') {
    return { error: 'Claims can only be opened on returned rentals' }
  }

  // Prevent duplicate open claims on the same transaction
  const { data: existing } = await supabase
    .from('claims')
    .select('id')
    .eq('transaction_id', transactionId)
    .in('status', ['OPEN', 'DISPUTED'])
    .maybeSingle()

  if (existing) {
    return { error: 'An open claim already exists for this rental' }
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

  if (insertError || !claim) {
    return { error: insertError?.message ?? 'Failed to create claim' }
  }

  revalidatePath('/operator')
  revalidatePath('/my-rentals')

  return { claimId: claim.id }
}