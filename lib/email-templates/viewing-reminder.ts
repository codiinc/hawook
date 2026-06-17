import type { EmailSender } from '@/lib/email'

export interface ViewingReminderParams {
  leadEmail: string
  leadFirstName: string
  projectName: string
  viewingDay: string
  viewingTime: string
  viewingLocation: string
  mapUrl: string
}

export function renderViewingReminder(params: ViewingReminderParams): {
  subject: string
  text: string
  from: EmailSender
  replyTo: string
} {
  const subject = `Reminder — ${params.projectName} viewing on ${params.viewingDay}`

  let text = `Hi ${params.leadFirstName},\n\n`
  text += `Quick reminder you're seeing ${params.projectName} on ${params.viewingDay} at ${params.viewingTime}. Meeting point at ${params.viewingLocation}: ${params.mapUrl}\n\n`
  text += `Latest pricing sheet attached in case you want to look it over beforehand — sometimes easier to walk into a viewing with the numbers already in your head.\n\n`
  text += `A few questions buyers usually ask at this stage — happy to answer beforehand or save for the viewing:\n`
  text += `- What's currently available in your budget range\n`
  text += `- Foreign quota status for this project\n`
  text += `- Payment plan and what's due when\n`
  text += `- Realistic rental yield expectations if relevant\n\n`
  text += `Anything else you want covered, just reply.\n\n`
  text += `— Yogi at Hawook`

  return { subject, text, from: 'hello', replyTo: process.env.RESEND_FROM_YOGI! }
}
