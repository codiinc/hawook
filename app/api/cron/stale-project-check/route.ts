import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { renderStaleProjectAlert } from '@/lib/email-templates/stale-project-alert'

export const runtime = 'nodejs'

const STALE_DAYS = 30
const ALERT_COOLDOWN_DAYS = 7
const YOGI_EMAIL = 'yogi@hawook.com'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const staleThreshold = new Date(Date.now() - STALE_DAYS * 24 * 3600 * 1000).toISOString()

  const { data: staleProjects, error } = await supabaseAdmin
    .from('projects')
    .select('id, slug, project_name, developer_name, status, last_updated')
    .eq('page_status', 'published')
    .lt('last_updated', staleThreshold)

  if (error) {
    console.error('[stale-project-check] query error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const projects = staleProjects ?? []

  if (projects.length === 0) {
    return NextResponse.json({ checked: 0, alerted: 0, reason: 'no_stale_projects' })
  }

  const cooldownThreshold = new Date(Date.now() - ALERT_COOLDOWN_DAYS * 24 * 3600 * 1000).toISOString()

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://app.hawook.com'

  const alertResults: { slug: string; alerted: boolean; reason?: string }[] = []

  for (const project of projects) {
    const slug = project.slug as string

    // Check if alert was sent in the last 7 days
    const { data: recentAlert } = await supabaseAdmin
      .from('audit_log')
      .select('id')
      .eq('action', 'stale_alert_sent')
      .eq('target_slug', slug)
      .gte('created_at', cooldownThreshold)
      .limit(1)
      .maybeSingle()

    if (recentAlert) {
      alertResults.push({ slug, alerted: false, reason: 'alert_sent_within_7_days' })
      continue
    }

    const lastUpdated = new Date(project.last_updated as string)
    const daysStale = Math.floor((Date.now() - lastUpdated.getTime()) / 86400000)

    const email = renderStaleProjectAlert({
      projectName: project.project_name as string,
      daysStale,
      lastKnownStatus: (project.status as string) ?? 'Unknown',
      developerName: (project.developer_name as string) ?? 'Unknown developer',
      projectAdminUrl: `${baseUrl}/admin/projects/${slug}/overview`,
    })

    const sendResult = await sendEmail({ ...email, to: YOGI_EMAIL })

    await supabaseAdmin.from('audit_log').insert({
      action: 'stale_alert_sent',
      target_slug: slug,
      summary: `Stale project alert sent for ${project.project_name} (${daysStale} days stale)`,
      metadata: {
        days_stale: daysStale,
        email_success: sendResult.success,
        sent_to: YOGI_EMAIL,
      },
    })

    alertResults.push({ slug, alerted: true })
  }

  return NextResponse.json({
    checked: projects.length,
    alerted: alertResults.filter(r => r.alerted).length,
    results: alertResults,
  })
}
