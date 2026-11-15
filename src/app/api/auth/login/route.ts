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
    const { email, password } = await req.json()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || '').trim().toLowerCase(),
      password: String(password || ''),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      hasSession: Boolean(data.session),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to sign in.' },
      { status: 500 },
    )
  }
}
