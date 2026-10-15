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

  const { data: claim } = await supabase
    .from('claims')
    .select('status')
    .eq('id', claimId)
    .single()

  if (!claim) return { error: 'Claim not found' }
  if (claim.status === 'RESOLVED') {
    return { error: 'Claim is already resolved' }
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