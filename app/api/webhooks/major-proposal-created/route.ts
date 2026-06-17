import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { renderMajorProposalAlert } from '@/lib/email-templates/major-proposal-alert'
import { APPROVERS } from '@/lib/approvers'

export const runtime = 'nodejs'

// Called by the Supabase database trigger (via pg_net/http extension) when a
// severity='major' proposal is inserted. The secret must match
// PROPOSAL_WEBHOOK_SECRET in Vercel env vars and the app_config table value.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expectedSecret = process.env.PROPOSAL_WEBHOOK_SECRET
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const targetName = (body.target_slug as string) ?? (body.target_table as string) ?? 'Unknown project'
  const fieldsChanged = Array.isArray(body.fields_changed) ? (body.fields_changed as Record<string, unknown>[]) : []
  const changeSummary = fieldsChanged.length > 0
    ? fieldsChanged.map(f => String(f.field)).join(', ')
    : (body.update_type as string) ?? 'Update'

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.hawook.com'

  await Promise.allSettled(
    APPROVERS.map(email =>
      sendEmail({
        ...renderMajorProposalAlert({
          approverEmail:    email,
          targetName,
          changeSummary,
          proposedBy:       (body.proposed_by as string) ?? 'unknown',
          sourceType:       (body.source_type as string) ?? 'unknown',
          discrepancyFlag:  Boolean(body.discrepancy_flag),
          discrepancyNote:  (body.discrepancy_note as string) ?? undefined,
          queueUrl:         `${baseUrl}/admin/queue`,
          settingsUrl:      `${baseUrl}/admin`,
        }),
        to: email,
      })
    )
  )

  return NextResponse.json({ ok: true })
}
