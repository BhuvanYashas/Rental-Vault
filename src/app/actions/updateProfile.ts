'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(username: string, age: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Validate Username
  const trimmedUsername = username.trim()
  if (!trimmedUsername || trimmedUsername.length < 2) {
    return { error: 'Username must be at least 2 characters' }
  }
  if (trimmedUsername.length > 30) {
    return { error: 'Username cannot exceed 30 characters' }
  }

  // 2. Validate Age
  const ageNum = Number(age)
  if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
    return { error: 'Please enter a valid age between 13 and 120' }
  }

  // 3. Update Database
  const { error } = await supabase
    .from('profiles')
    .update({ username: trimmedUsername, age: ageNum })
    .eq('id', user.id)

  if (error) {
    // Handle unique constraint error if usernames must be unique
    if (error.code === '23505') {
      return { error: 'This username is already taken. Please choose another.' }
    }
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}