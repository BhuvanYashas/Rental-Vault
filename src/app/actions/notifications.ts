'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email'

export async function sendNotification(
  targetUserId: string,
  title: string,
  message: string,
  link: string
) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
  // 1. Insert into the database (for the Bell icon) - uses normal client
  await supabase.rpc('create_notification', {
    p_user_id: targetUserId,
    p_title: title,
    p_message: message,
    p_link: link,
  })

  // 2. Fetch the user's email address - requires Admin client
  const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(targetUserId)
  
  if (userError || !userData.user) {
    console.error('Could not find user for email:', userError)
    return
  }

  // 3. Send the email via Resend
  if (userData.user.email) {
    console.log('Attempting to send email to:', userData.user.email)
    
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
        <h2 style="color: #0F172A; margin-bottom: 16px;">${title}</h2>
        <p style="color: #1E293B; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">${message}</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${link}" style="display: inline-block; background-color: #D97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Vault</a>
        <p style="color: #5C7FA8; font-size: 12px; margin-top: 32px;">Rental Vault · Idle goods, held in trust.</p>
      </div>
    `
    
    const result = await sendEmail(userData.user.email, title, emailHtml)
    console.log('Email send result:', result)
  } else {
    console.log('No email found for user:', targetUserId)
  }

  revalidatePath('/', 'layout')
}