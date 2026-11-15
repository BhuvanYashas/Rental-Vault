import { NextRequest, NextResponse } from 'next/server'
import { createClient, hasSupabaseEnv } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured.' },
      { status: 500 },
    )
  }

  try {
    const { email, password, username, age, origin } = await req.json()
    const supabase = await createClient()
    const cleanOrigin =
      typeof origin === 'string' && (origin.startsWith('https://') || origin.startsWith('http://'))
        ? origin
        : ''

    const { data, error } = await supabase.auth.signUp({
      email: String(email || '').trim().toLowerCase(),
      password: String(password || ''),
      options: {
        ...(cleanOrigin ? { emailRedirectTo: `${cleanOrigin}/login` } : {}),
        data: {
          username: String(username || '').trim(),
          full_name: String(username || '').trim(),
          age: Number(age),
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const duplicate = Boolean(
      data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0,
    )

    return NextResponse.json({
      duplicate,
      hasSession: Boolean(data.session),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to create account.' },
      { status: 500 },
    )
  }
}
