import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'

export const runtime = 'nodejs'

type Params = { params: Promise<{ slug: string }> }

const ALLOWED_STRUCTURED_FIELDS = new Set([
  'status', 'price_min', 'price_max', 'price_per_sqm_min', 'price_per_sqm_max',
  'unit_types', 'unit_sizes', 'total_units', 'floors', 'buildings',
  'foreign_quota_available', 'foreign_quota_units_remaining',
  'construction_status', 'handover_date', 'ownership_type',
  'cam_fee_thb_sqm', 'sinking_fund_thb_sqm',
  'rental_program_available', 'rental_yield_claim',
  'payment_plan', 'management_company',
])

export async function PATCH(request: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
  }

  const { slug } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const fields: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED_STRUCTURED_FIELDS.has(k)) {
      fields[k] = v === '' ? null : v
    }
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  const { data: project, error: fetchError } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .single()

  if (fetchError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('projects')
    .update({ ...fields, last_updated: new Date().toISOString() })
    .eq('slug', slug)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const raw = project as Record<string, unknown>
  await supabaseAdmin.from('audit_log').insert({
    actor_id: user!.id,
    actor_email: user!.email,
    action: 'direct_edit',
    target_table: 'projects',
    target_record_id: raw.id as string,
    target_slug: slug,
    summary: `Structured data updated: ${Object.keys(fields).join(', ')}`,
    metadata: { fields_changed: Object.keys(fields), severity: 'minor' },
  })

  return NextResponse.json({ ok: true })
}
