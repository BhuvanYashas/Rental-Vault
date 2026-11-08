'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from './notifications'

export async function disputeClaim(
  claimId: string,
  reason: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in' }

  if (!reason.trim()) {
    return { error: 'Please explain why you are disputing this claim' }
  }

  // 1. Fetch the claim details for the notification
  const { data: claim } = await supabase
    .from('claims')
    .select(`
      transaction_id,
      transactions (
        listings ( items ( name ) )
      )
    `)
    .eq('id', claimId)
    .single()

  const itemName = (claim?.transactions as any)?.listings?.items?.name || 'Item'

  // 2. Call the secure Postgres RPC
  const { error } = await supabase.rpc('dispute_claim', {
    p_claim_id: claimId,
    p_reason: reason.trim(),
  })

  if (error) return { error: error.message }

  // 3. Send a notification to all Operators
  const { data: operators } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'operator')

  if (operators && operators.length > 0) {
    for (const op of operators) {
      await sendNotification(
        op.id,
        'Claim Disputed',
        `The renter has disputed the damage claim on "${itemName}". Please review the new evidence/reason.`,
        '/operator'
      )
    }
  }

  revalidatePath('/my-rentals')
  revalidatePath('/operator')

  return {}
}