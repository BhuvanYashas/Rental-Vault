import 'server-only'
import { Resend } from 'resend'

// 1. Check for missing env vars to prevent silent crashes
if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Rental Vault <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    })

    // 2. Resend returns an error object instead of throwing
    if (error) {
      console.error('Resend API Error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    // 3. This catches network failures (e.g., server down)
    console.error('Email failed to send (Network):', error)
    return { success: false, error }
  }
}