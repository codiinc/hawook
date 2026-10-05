import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isApprover } from '@/lib/approvers'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isApprover(user?.email)) {
    return NextResponse.json({ error: 'Approver access required' }, { status: 403 })
  }

  const { id } = await params

  const { data: proposal, error: fetchError } = await supabaseAdmin
    .from('update_proposals')
    .select('id, status')
    .eq('id', id)
    .single()

  if (fetchError || !proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  if ((proposal as { status: string }).status !== 'failed') {
    return NextResponse.json({ error: 'Only failed proposals can be retried' }, { status: 400 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('update_proposals')
    .update({ status: 'pending_approval', review_notes: null })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await supabaseAdmin.from('audit_log').insert({
    action: 'proposal_reset_to_pending',
    target_id: id,
    actor_id: user!.id,
    actor_email: user!.email,
    summary: `Proposal ${id} reset to pending_approval by ${user!.email}`,
  })

  return NextResponse.json({ ok: true })
}
