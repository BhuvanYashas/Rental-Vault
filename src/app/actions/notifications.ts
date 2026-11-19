'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

export async function sendNotification(
  targetUserId: string,
  title: string,
  message: string,
  link: string
) {
  try {
    const supabase = await createClient()

    // 1. Insert into the database (for the Bell icon)
    const { error: rpcError } = await supabase.rpc('create_notification', {
      p_user_id: targetUserId,
      p_title: title,
      p_message: message,
      p_link: link,
    })

    if (rpcError) {
      console.error('Failed to create in-app notification:', rpcError)
      // Continue so email can still be attempted
    }

    // 2. Fetch the user's email address
    const adminSupabase = createAdminClient()
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(targetUserId)

    if (userError || !userData?.user?.email) {
      console.error('Could not find user email for notification:', userError)
      revalidatePath('/', 'layout')
      return
    }

    // 3. Send the email via Resend
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('Missing RESEND_API_KEY environment variable; skipping email notification')
      revalidatePath('/', 'layout')
      return
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
        <h2 style="color: #0F172A; margin-bottom: 16px;">${title}</h2>
        <p style="color: #1E293B; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">${message}</p>
        <a href="${siteUrl}${link}" style="display: inline-block; background-color: #D97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Vault</a>
        <p style="color: #5C7FA8; font-size: 12px; margin-top: 32px;">Rental Vault · Idle goods, held in trust.</p>
      </div>
    `

    const resend = new Resend(apiKey)
    const { error: emailError } = await resend.emails.send({
      from: 'Rental Vault <onboarding@resend.dev>',
      to: [userData.user.email],
      subject: title,
      html: emailHtml,
    })

    if (emailError) {
      console.error('Resend API Error:', emailError)
    }

    revalidatePath('/', 'layout')
  } catch (err) {
    console.error('Notification dispatch failed:', err)
  }
}