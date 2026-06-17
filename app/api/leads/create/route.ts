import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { renderNewLeadAlert } from '@/lib/email-templates/new-lead-alert'
import { renderLeadAcknowledgment } from '@/lib/email-templates/lead-acknowledgment'

const YOGI_EMAIL = 'yogi@hawook.com'
const YOGI_WHATSAPP = '+66 80 510 0129'

const VALID_PERSONAS = ['buyer', 'investor', 'agent', 'other'] as const
type Persona = (typeof VALID_PERSONAS)[number]

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot: silently succeed for bots
  if (body.honeypot) {
    return NextResponse.json({ success: true })
  }

  const { name, email, whatsapp, budget, timeframe, persona, message, project_slug, subscribe_newsletter, agree_contact } = body as {
    name?: string
    email?: string
    whatsapp?: string
    budget?: string
    timeframe?: string
    persona?: string
    message?: string
    project_slug?: string
    subscribe_newsletter?: boolean
    agree_contact?: boolean
  }

  // Required field validation
  if (!name?.trim() || !email?.trim() || !budget || !timeframe || !persona || !project_slug || !agree_contact) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (!VALID_PERSONAS.includes(persona as Persona)) {
    return NextResponse.json({ error: 'Invalid persona' }, { status: 400 })
  }

  // Look up project by slug
  const supabase = await createClient()
  const { data: projectRow } = await supabase
    .from('projects_public')
    .select('id, project_name')
    .eq('slug', project_slug)
    .single()

  if (!projectRow) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const projectId = (projectRow as Record<string, string>).id
  const projectName = (projectRow as Record<string, string>).project_name

  // Insert lead (service role bypasses RLS)
  const { data: leadRow, error: insertError } = await supabaseAdmin
    .from('leads')
    .insert({
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: whatsapp?.trim() || null,
      budget_bracket: budget,
      timeline: timeframe,
      persona: persona as Persona,
      message: message?.trim() || null,
      source: 'form_submission',
      lead_stage: 'New',
      current_project_context_id: projectId,
      subscribe_newsletter: !!subscribe_newsletter,
    })
    .select('id')
    .single()

  if (insertError || !leadRow) {
    console.error('Lead insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }

  const leadId = (leadRow as Record<string, string>).id

  // Newsletter opt-in → Beehiiv
  if (subscribe_newsletter && process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID) {
    fetch(`https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        reactivate_existing: true,
        send_welcome_email: false,
      }),
    }).catch((err) => console.error('Beehiiv error:', err))
  }

  // Link to project_follows if a Hawook account exists with this email
  try {
    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (userRow) {
      const userId = (userRow as Record<string, string>).id
      await supabaseAdmin
        .from('project_follows')
        .upsert({ user_id: userId, project_id: projectId }, { onConflict: 'user_id,project_id' })
    }
  } catch {
    // Non-fatal — lead is saved regardless
  }

  const { origin } = new URL(request.url)
  const firstName = name.trim().split(' ')[0]
  const leadUrl = `${origin}/admin/leads/${leadId}`
  const dashboardUrl = `${origin}/dashboard`

  // Template #5 — alert to Yogi (fire and forget)
  const alert = renderNewLeadAlert({
    leadName: name.trim(),
    leadEmail: email.trim(),
    leadWhatsapp: whatsapp?.trim() || undefined,
    leadSource: 'form_submission',
    leadProjectContext: projectName,
    leadBudget: budget,
    leadTimeframe: timeframe,
    leadPersona: persona as Persona,
    leadUrl,
  })
  sendEmail({ from: alert.from, to: YOGI_EMAIL, subject: alert.subject, text: alert.text }).catch(console.error)

  // Template #7 — acknowledgment to lead (fire and forget)
  const ack = renderLeadAcknowledgment({
    leadEmail: email.trim(),
    leadFirstName: firstName,
    projectName,
    yogiWhatsapp: YOGI_WHATSAPP,
    dashboardUrl,
  })
  sendEmail({ from: ack.from, to: email.trim(), subject: ack.subject, text: ack.text, replyTo: ack.replyTo }).catch(console.error)

  return NextResponse.json({ success: true }, { status: 201 })
}
