import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isApprover } from '@/lib/approvers'
import { executeApproval } from '@/lib/proposals'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  // Server-side approver recheck — never trust client auth alone
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isApprover(user?.email)) {
    return NextResponse.json({ error: 'Approver access required' }, { status: 403 })
  }

  const { id } = await params

  let body: Record<string, unknown> = {}
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    // Body is optional — default to empty
  }

  const result = await executeApproval(id, user!.id, user!.email!, {
    notificationHold: body.notification_hold === true,
    reviewNotes:      typeof body.review_notes === 'string' ? body.review_notes : undefined,
    editedFields:     Array.isArray(body.edited_fields) ? body.edited_fields as never[] : undefined,
    editedUpdateEntry: body.edited_update_entry != null
      ? body.edited_update_entry as never
      : undefined,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true, targetId: result.targetId, updateEntryId: result.updateEntryId })
}
