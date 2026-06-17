import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'

export const runtime = 'nodejs'

type Params = { params: Promise<{ slug: string }> }

const ACTION_MAP: Record<string, string> = {
  published: 'published',
  draft: 'unpublished',
  archived: 'archived',
}

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

  const pageStatus = body.page_status as string
  if (!['draft', 'published', 'archived'].includes(pageStatus)) {
    return NextResponse.json({ error: 'Invalid page_status value' }, { status: 400 })
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
    .update({ page_status: pageStatus, last_updated: new Date().toISOString() })
    .eq('slug', slug)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const raw = project as Record<string, unknown>
  await supabaseAdmin.from('audit_log').insert({
    actor_id: user!.id,
    actor_email: user!.email,
    action: ACTION_MAP[pageStatus] ?? pageStatus,
    target_table: 'projects',
    target_record_id: raw.id as string,
    target_slug: slug,
    summary: `Page status changed to ${pageStatus}`,
    metadata: { page_status: pageStatus },
  })

  return NextResponse.json({ ok: true })
}
