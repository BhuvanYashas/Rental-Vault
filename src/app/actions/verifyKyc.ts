'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from './notifications'

export async function verifyKyc(
  targetUserId: string,
  status: 'verified' | 'rejected'
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Ensure the person clicking the button is an operator
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'operator') return { error: 'Unauthorized' }

  // 1. Update the KYC status in the database
  const { error } = await supabase
    .from('profiles')
    .update({ kyc_status: status })
    .eq('id', targetUserId)

  if (error) return { error: error.message }

  // 2. Send a notification/email to the user
  const title = status === 'verified' ? 'Identity Verified' : 'KYC Verification Failed'
  const message = status === 'verified' 
    ? 'Your ID has been approved. You now have full access to the vault.' 
    : 'Your ID could not be verified. Please upload a clearer image.'
  
  await sendNotification(targetUserId, title, message, '/profile')

  revalidatePath('/operator')
  revalidatePath('/profile')

  return {}
}