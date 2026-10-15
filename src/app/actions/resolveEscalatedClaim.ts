'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resolveEscalatedClaim(
  claimId: string,
  resolution: 'VAULT_WINS' | 'RENTER_WINS',
  notes: string,
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

  if (profile?.role !== 'platform') {
    return { error: 'Only platform reviewers can resolve escalated claims' }
  }

  if (!notes.trim()) {
    return { error: 'Please write your reasoning — the renter will see it' }
  }

  const { data: claim } = await supabase
    .from('claims')
    .select('status')
    .eq('id', claimId)
    .single()

  if (!claim) return { error: 'Claim not found' }
  if (claim.status !== 'ESCALATED') {
    return { error: 'Claim is not awaiting platform review' }
  }

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

  revalidatePath('/my-rentals')
  revalidatePath('/operator')
  revalidatePath('/platform')

  return {}
}