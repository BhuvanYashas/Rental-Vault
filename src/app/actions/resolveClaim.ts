'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resolveClaim(
  claimId: string,
  resolution: 'VAULT_WINS' | 'RENTER_WINS',
): Promise<{ error?: string }> {
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
    return { error: 'Only vault operators can resolve claims' }
  }

  // Fetch the claim AND the underlying transaction details for the
  // conflict-of-interest check
  const { data: claim } = await supabase
    .from('claims')
    .select(`
      status,
      transaction_id,
      transactions (
        renter_id,
        listings (
          items ( owner_id )
        )
      )
    `)
    .eq('id', claimId)
    .single()

  if (!claim) return { error: 'Claim not found' }
  if (claim.status === 'RESOLVED') {
    return { error: 'Claim is already resolved' }
  }

  const txn = claim.transactions as any
  const item = txn?.listings?.items

  // Conflict of interest: operator cannot resolve a claim on their own rental
  if (txn?.renter_id === user.id) {
    return {
      error:
        'You cannot resolve a claim on a rental you made. Ask another operator to review.',
    }
  }

  // Conflict of interest: operator cannot resolve a claim on an item they own
  if (item?.owner_id && item.owner_id === user.id) {
    return {
      error:
        'You cannot resolve a claim on an item you own. Ask another operator to review.',
    }
  }

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

  revalidatePath('/operator')
  revalidatePath('/my-rentals')

  return {}
}