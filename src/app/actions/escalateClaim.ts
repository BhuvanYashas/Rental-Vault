'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from './notifications'

export async function escalateClaim(
  claimId: string,
  reason: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in' }

  if (!reason.trim()) return { error: 'Please explain why you are requesting a re-review' }

  // 1. Fetch claim details BEFORE escalating (for the notification)
  const { data: claim } = await supabase
    .from('claims')
    .select(`
      transaction_id,
      transactions ( 
        renter_id, 
        listings ( items ( name ) ) 
      )
    `)
    .eq('id', claimId)
    .single()

  const txn = claim?.transactions as unknown as {
    listings?: { items?: { name?: string } | null } | null
  } | null
  const itemName = txn?.listings?.items?.name || 'Item'

  // 2. Call the secure Postgres RPC
  const { error } = await supabase.rpc('escalate_claim', {
    p_claim_id: claimId,
    p_reason: reason.trim(),
  })

  if (error) return { error: error.message }

  // 3. Send confirmation to the Renter
  try {
    await sendNotification(
      user.id,
      'Re-review Requested',
      `Your request for re-review of the claim on "${itemName}" has been submitted to the Platform reviewer.`,
      '/my-rentals'
    )
  } catch (notifyErr) {
    console.error('Failed to send escalation notification:', notifyErr)
  }

  revalidatePath('/my-rentals')
  revalidatePath('/operator')
  revalidatePath('/platform')

  return {}
}