import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { renderNewLeadAlert } from '@/lib/email-templates/new-lead-alert'

const YOGI_EMAIL = 'yogi@hawook.com'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  // Auth required — this endpoint is member-only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { budget, timeline, buyer_type, experience, phone, notes } = body as {
    budget?: string
    timeline?: string
    buyer_type?: string
    experience?: string
    phone?: string
    notes?: string
  }

  if (!budget || !timeline) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Look up project
  const { data: projectRow } = await supabase
    .from('projects_public')
    .select('id, project_name')
    .eq('slug', params.slug)
    .single()

  if (!projectRow) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const projectId = (projectRow as { id: string; project_name: string }).id
  const projectName = (projectRow as { id: string; project_name: string }).project_name

  // Build message from buyer context
  const messageParts: string[] = []
  if (buyer_type) messageParts.push(`Buying as: ${buyer_type}`)
  if (experience) messageParts.push(`Experience: ${experience}`)
  if (notes?.trim()) messageParts.push(`Notes: ${notes.trim()}`)
  const message = messageParts.join('\n') || null

  // Map buyer_type to persona
  const persona = buyer_type === 'Investment' ? 'investor' : 'buyer'

  // Insert lead
  const { data: leadRow, error: insertError } = await supabaseAdmin
    .from('leads')
    .insert({
      email: user.email,
      phone: phone?.trim() || null,
      budget_bracket: budget,
      timeline,
      persona,
      message,
      source: 'buyer_request',
      lead_stage: 'Qualified',
      project_id: projectId,
    })
    .select('id')
    .single()

  if (insertError || !leadRow) {
    console.error('buyer-request insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save request' }, { status: 500 })
  }

  const leadId = (leadRow as { id: string }).id

  // Upsert project follow (non-fatal)
  void supabaseAdmin
    .from('project_follows')
    .upsert({ user_id: user.id, project_id: projectId }, { onConflict: 'user_id,project_id' })

  // Alert Yogi (fire and forget)
  const { origin } = new URL(request.url)
  const alert = renderNewLeadAlert({
    leadName: user.email,
    leadEmail: user.email,
    leadSource: 'form_submission',
    leadProjectContext: projectName,
    leadBudget: budget,
    leadTimeframe: timeline,
    leadPersona: persona as 'investor' | 'buyer',
    leadUrl: `${origin}/admin/leads/${leadId}`,
  })
  sendEmail({
    from: alert.from,
    to: YOGI_EMAIL,
    subject: `Buyer request — ${projectName} (${user.email})`,
    text: alert.text,
  }).catch(console.error)

  return NextResponse.json({ success: true }, { status: 201 })
}
