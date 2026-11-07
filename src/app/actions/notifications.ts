'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendNotification(
  targetUserId: string,
  title: string,
  message: string,
  link: string
) {
  const supabase = await createClient()
  
  // Call the security definer function we created in Supabase
  await supabase.rpc('create_notification', {
    p_user_id: targetUserId,
    p_title: title,
    p_message: message,
    p_link: link,
  })

  // Refresh the layout so the notification bell updates
  revalidatePath('/', 'layout')
}