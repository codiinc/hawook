import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

const VALID_STAGES = [
  'Inquiry', 'Qualified', 'Engaged', 'Meeting-ready',
  'Project-selected', 'Reserved', 'Contracted', 'Closed', 'Dropped',
] as const

export async function PATCH(request: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
  }

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const stage = body.stage as string
  if (!VALID_STAGES.includes(stage as typeof VALID_STAGES[number])) {
    return NextResponse.json({ error: 'Invalid stage value' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('leads')
    .update({ lead_stage: stage })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
