import { Resend } from 'resend'

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const data = await resend.emails.send({
      from: 'Rental Vault <onboarding@resend.dev>', // Resend's free testing domain
      to: [to],
      subject: subject,
      html: html,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Email failed to send:', error)
    return { success: false, error }
  }
}