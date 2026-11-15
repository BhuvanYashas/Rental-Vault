import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error('Missing Supabase environment variables in .env.local')
  }

  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])
  const isHttps =
    headerStore.get('x-forwarded-proto')?.includes('https') === true
  const host = headerStore.get('x-forwarded-host') || headerStore.get('host') || ''
  const isPreviewIframe =
    isHttps &&
    (headerStore.get('sec-fetch-dest') === 'iframe' ||
      host.startsWith('ais-dev-') ||
      host.startsWith('ais-pre-'))

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(isPreviewIframe
        ? {
            cookieOptions: {
              sameSite: 'none' as const,
              secure: true,
              partitioned: true,
            },
          }
        : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                ...(isPreviewIframe
                  ? {
                      sameSite: 'none' as const,
                      secure: true,
                      partitioned: true,
                    }
                  : {}),
              })
            )
          } catch {
            // Called from a Server Component - safe to ignore
          }
        },
      },
    }
  )
}