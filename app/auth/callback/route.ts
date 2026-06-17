import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { renderWelcome } from '@/lib/email-templates/welcome'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/projects'

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Fire welcome email on first-ever login (email confirmation callback)
    if (data?.user) {
      const { user } = data
      const createdAt = new Date(user.created_at).getTime()
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0
      const isNewSignup = Math.abs(lastSignIn - createdAt) < 60_000

      if (isNewSignup && user.email) {
        const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email.split('@')[0]
        const { subject, text, from, replyTo } = renderWelcome({
          userEmail: user.email,
          userFirstName: firstName,
          projectsUrl: `${origin}/projects`,
        })
        // Fire and forget — don't block the redirect
        sendEmail({ from, to: user.email, subject, text, replyTo }).catch(console.error)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
