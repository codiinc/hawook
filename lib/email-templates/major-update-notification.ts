import type { EmailSender } from '@/lib/email'

export interface MajorUpdateNotificationParams {
  leadEmail: string
  leadFirstName: string
  projectName: string
  changeHeadline: string
  updateSummary: string
  contextualImplication: string
  projectUrl: string
  yogiWhatsapp: string
}

export function renderMajorUpdateNotification(params: MajorUpdateNotificationParams): {
  subject: string
  text: string
  from: EmailSender
  replyTo: string
} {
  const subject = `${params.projectName} — ${params.changeHeadline}`

  let text = `Hi ${params.leadFirstName},\n\n`
  text += `Quick note on ${params.projectName} since you're following it.\n\n`
  text += `${params.updateSummary}\n\n`
  text += `What this means for you:\n\n`
  text += `${params.contextualImplication}\n\n`
  text += `Full project page:\n${params.projectUrl}\n\n`
  text += `If you want to talk this through, my WhatsApp is ${params.yogiWhatsapp}, or just reply.\n\n`
  text += `— Yogi at Hawook`

  return { subject, text, from: 'hello', replyTo: process.env.RESEND_FROM_YOGI! }
}
