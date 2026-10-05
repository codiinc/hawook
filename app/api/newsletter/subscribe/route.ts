import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let body: { email?: string }
  try {
    body = await request.json() as { email?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const apiKey = process.env.BEEHIIV_API_KEY
  const pubId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !pubId) {
    console.error('[newsletter] Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID')
    return NextResponse.json({ error: 'Newsletter service unavailable' }, { status: 503 })
  }

  const res = await fetch(`https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: true,
      utm_source: 'hawook_homepage',
      utm_medium: 'newsletter_signup',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[newsletter] Beehiiv error:', res.status, text)
    return NextResponse.json({ error: 'Subscription failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
