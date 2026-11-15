import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const isHttps =
    request.nextUrl.protocol === 'https:' ||
    request.headers.get('x-forwarded-proto')?.includes('https') === true
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  const isPreviewIframe =
    isHttps &&
    (request.headers.get('sec-fetch-dest') === 'iframe' ||
      host.startsWith('ais-dev-') ||
      host.startsWith('ais-pre-'))

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
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
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedRoutes = [
    '/my-rentals',
    '/profile',
    '/operator',
    '/owner',
    '/platform',
  ]

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}