import type { EmailSender } from '@/lib/email'

export interface StaleProjectAlertParams {
  projectName: string
  daysStale: number
  lastKnownStatus: string
  developerName: string
  projectAdminUrl: string
}

export function renderStaleProjectAlert(params: StaleProjectAlertParams): {
  subject: string
  text: string
  from: EmailSender
} {
  const subject = `Stale project — ${params.projectName} (${params.daysStale} days)`

  let text = `${params.projectName} hasn't had an update in ${params.daysStale} days.\n\n`
  text += `Last known status:\n${params.lastKnownStatus}\n\n`
  text += `Suggested action: reach out to ${params.developerName} for current pricing, foreign quota status, and construction stage. Then run the response through Claude to propose updates.\n\n`
  text += `Project admin:\n${params.projectAdminUrl}\n\n`
  text += `—\nHawook System`

  return { subject, text, from: 'system' }
}
