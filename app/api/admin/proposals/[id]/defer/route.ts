import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isApprover } from '@/lib/approvers'
import { deferProposal } from '@/lib/proposals'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isApprover(user?.email)) {
    return NextResponse.json({ error: 'Approver access required' }, { status: 403 })
  }

  const { id } = await params

  let body: Record<string, unknown> = {}
  try {
    body = await request.json() as Record<string, unknown>
  } catch { /* Body is optional */ }

  const result = await deferProposal(
    id,
    user!.id,
    user!.email!,
    typeof body.defer_tag === 'string' ? body.defer_tag : undefined,
    typeof body.review_notes === 'string' ? body.review_notes : undefined
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
