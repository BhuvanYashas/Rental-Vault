import 'server-only'
import { createClient } from '@supabase/supabase-js'

// This client uses the Service Role Key and should ONLY be used on the server.
export function createAdminClient() {
  // Check for missing env vars before trying to connect
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables for Admin Client");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}