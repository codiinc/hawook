import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const action      = searchParams.get('action')
  const actorEmail  = searchParams.get('actor_email')
  const targetTable = searchParams.get('target_table')
  const targetSlug  = searchParams.get('target_slug')
  const dateFrom    = searchParams.get('date_from')
  const dateTo      = searchParams.get('date_to')
  const page        = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize    = 50

  let query = supabaseAdmin
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (action)      query = query.eq('action', action)
  if (actorEmail)  query = query.eq('actor_email', actorEmail)
  if (targetTable) query = query.eq('target_table', targetTable)
  if (targetSlug)  query = query.eq('target_slug', targetSlug)
  if (dateFrom)    query = query.gte('created_at', dateFrom)
  if (dateTo)      query = query.lte('created_at', dateTo)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: data, count: count ?? 0, page, pageSize })
}
