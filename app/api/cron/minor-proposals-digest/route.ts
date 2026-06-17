import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { renderWeeklyMinorDigest } from '@/lib/email-templates/weekly-minor-digest'
import { APPROVERS } from '@/lib/approvers'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('update_proposals')
    .select('id, target_slug, fields_changed, proposed_by, created_at')
    .eq('status', 'pending_approval')
    .eq('severity', 'minor')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[minor-proposals-digest] query error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const proposals = data ?? []

  if (proposals.length === 0) {
    return NextResponse.json({ sent: false, reason: 'no_pending_minor_proposals' })
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://app.hawook.com'

  const proposalItems = proposals.map(p => {
    const fields = Array.isArray(p.fields_changed) ? p.fields_changed : []
    const changeSummary = fields.length > 0
      ? `${fields.length} field${fields.length !== 1 ? 's' : ''} changed`
      : 'field update'
    return {
      targetName: (p.target_slug as string) ?? 'Unknown',
      changeSummary,
      proposedDate: new Date(p.created_at as string).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short',
      }),
    }
  })

  const results: { approver: string; success: boolean }[] = []

  for (const approverEmail of APPROVERS) {
    const email = renderWeeklyMinorDigest({
      approverEmail,
      pendingCount: proposals.length,
      proposals: proposalItems,
      queueUrl: `${baseUrl}/admin/queue`,
    })
    const result = await sendEmail({ ...email, to: approverEmail })
    results.push({ approver: approverEmail, success: result.success })
  }

  await supabaseAdmin.from('audit_log').insert({
    action: 'cron_minor_digest_sent',
    summary: `Minor proposals digest sent to ${APPROVERS.length} approver(s) — ${proposals.length} proposal(s)`,
    metadata: { proposal_count: proposals.length, results },
  })

  return NextResponse.json({ sent: true, proposalCount: proposals.length, results })
}
