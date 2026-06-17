import type { EmailSender } from '@/lib/email'

export interface ColdReengagementParams {
  leadEmail: string
  leadFirstName: string
  projectName: string
  changeHeadline: string
  updateSummary: string
  projectUrl: string
  settingsUrl: string
  unsubscribeUrl: string
}

export function renderColdReengagement(params: ColdReengagementParams): {
  subject: string
  text: string
  from: EmailSender
  replyTo: string
} {
  const subject = `${params.projectName} — ${params.changeHeadline}`

  let text = `Hi ${params.leadFirstName},\n\n`
  text += `It's been a while, hope all's well. Just a quick note on ${params.projectName} since you'd looked at it earlier — something worth flagging.\n\n`
  text += `${params.updateSummary}\n\n`
  text += `If your timing has shifted and Phuket is back on your radar, happy to send the current full pricing, floor plans, and any of the gated stuff you didn't get to last time. Just reply.\n\n`
  text += `If not, no worries — I'll keep you in the loop on anything else worth knowing.\n\n`
  text += `— Yogi at Hawook\n`
  text += `${params.projectUrl}\n\n`
  text += `—\n`
  text += `Adjust notification settings: ${params.settingsUrl} | Unsubscribe: ${params.unsubscribeUrl}`

  return { subject, text, from: 'hello', replyTo: process.env.RESEND_FROM_YOGI! }
}
