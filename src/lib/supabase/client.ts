import { createBrowserClient } from '@supabase/ssr'

export function hasSupabaseBrowserEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function createClient() {
  if (!hasSupabaseBrowserEnv()) {
    throw new Error('Missing Supabase environment variables in .env.local')
  }

  const isHttps =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
  let isIframe = false
  try {
    isIframe = typeof window !== 'undefined' && window.self !== window.top
  } catch {
    isIframe = true
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    isHttps && isIframe
      ? {
          cookieOptions: {
            sameSite: 'none',
            secure: true,
            partitioned: true,
          },
        }
      : undefined
  )
}