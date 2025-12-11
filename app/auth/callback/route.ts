// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // If there is a "next" param, use it, otherwise go to home
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // If successful, forward the user to their destination
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something broke, send them to an error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}