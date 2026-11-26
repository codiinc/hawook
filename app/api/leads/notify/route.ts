import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.honeypot) return NextResponse.json({ success: true })

  const { name, email, project_slug } = body as {
    name?: string
    email?: string
    project_slug?: string
  }

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('leads').insert({
    full_name: name.trim(),
    email: email.trim().toLowerCase(),
    message: project_slug ? `Notify me when ${project_slug} profile publishes.` : 'Notify me.',
    source: 'notify_placeholder',
    lead_stage: 'Inquiry',
    subscribe_newsletter: false,
  })

  if (error) {
    console.error('Lead notify insert error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
