'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(username: string, age: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!username.trim() || username.trim().length < 2) {
    return { error: 'Username must be at least 2 characters' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username: username.trim(), age })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}