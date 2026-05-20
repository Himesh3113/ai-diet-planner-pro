import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

function safeRedirectPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith('/')) return '/dashboard'
  if (rawNext.startsWith('//')) return '/dashboard'
  return rawNext
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeRedirectPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`)
}
