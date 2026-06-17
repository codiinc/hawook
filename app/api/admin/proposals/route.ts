import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'

export const runtime = 'nodejs'

const SEVERITY_ORDER: Record<string, number> = { major: 3, standard: 2, minor: 1 }

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status     = searchParams.get('status') ?? 'pending_approval'
  const severity   = searchParams.get('severity')
  const targetSlug = searchParams.get('target_slug')
  const proposedBy = searchParams.get('proposed_by')
  const dateFrom   = searchParams.get('date_from')
  const dateTo     = searchParams.get('date_to')
  const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize   = 50

  let query = supabaseAdmin
    .from('update_proposals')
    .select('*', { count: 'exact' })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (status)     query = query.eq('status', status)
  if (severity)   query = query.eq('severity', severity)
  if (targetSlug) query = query.eq('target_slug', targetSlug)
  if (proposedBy) query = query.eq('proposed_by', proposedBy)
  if (dateFrom)   query = query.gte('created_at', dateFrom)
  if (dateTo)     query = query.lte('created_at', dateTo)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sort: severity DESC (major first), then created_at ASC within severity
  const sorted = (data ?? []).slice().sort((a, b) => {
    const ar = a as Record<string, unknown>
    const br = b as Record<string, unknown>
    const severityDiff = (SEVERITY_ORDER[br.severity as string] ?? 0) - (SEVERITY_ORDER[ar.severity as string] ?? 0)
    if (severityDiff !== 0) return severityDiff
    return new Date(ar.created_at as string).getTime() - new Date(br.created_at as string).getTime()
  })

  return NextResponse.json({ proposals: sorted, count: count ?? 0, page, pageSize })
}
