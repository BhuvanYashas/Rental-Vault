'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function escalateClaim(
  claimId: string,
  reason: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in' }

  if (!reason.trim()) {
    return { error: 'Please explain why you are requesting a re-review' }
  }

  const { error } = await supabase.rpc('escalate_claim', {
    p_claim_id: claimId,
    p_reason: reason.trim(),
  })

  if (error) return { error: error.message }

  revalidatePath('/my-rentals')
  revalidatePath('/operator')
  revalidatePath('/platform')

  return {}
}