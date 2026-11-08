'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addFundsToWallet(amount: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be greater than 0' }
  if (amount > 100000) return { error: 'Maximum deposit is ₹1,00,000 per transaction' }

  // 1. Fetch current balance
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', user.id)
    .single()

  if (fetchError || !profile) return { error: 'Could not fetch wallet' }

  const currentBalance = profile.wallet_balance || 0

  // 2. Calculate new balance
  const newBalance = currentBalance + amount

  // 3. ATOMIC UPDATE: Only update if the balance hasn't changed since we read it
  const { data: updatedWallet, error: updateError } = await supabase
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', user.id)
    .eq('wallet_balance', currentBalance) // 👈 Prevents double-clicking
    .select()
    .single()

  if (updateError || !updatedWallet) {
    return { error: 'Transaction collision detected. Please try again.' }
  }

  // 4. Log the transaction
  await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    amount: amount,
    type: 'DEPOSIT',
    description: 'Added funds via Credit Card (Mock)'
  })

  revalidatePath('/profile')
  return { success: true }
}