import type { EmailSender } from '@/lib/email'

export interface ViewingConfirmationParams {
  leadEmail: string
  leadFirstName: string
  projectName: string
  viewingDate: string
  viewingTime: string
  viewingTeamMember: string
  viewingLocation: string
  mapUrl: string
  parkingNote: string
  viewingWhatToExpect: string
  yogiWhatsapp: string
}

export function renderViewingConfirmation(params: ViewingConfirmationParams): {
  subject: string
  text: string
  from: EmailSender
  replyTo: string
} {
  const subject = `Viewing booked — ${params.projectName} on ${params.viewingDate}`

  let text = `Hi ${params.leadFirstName},\n\n`
  text += `You're set for ${params.projectName} on ${params.viewingDate} at ${params.viewingTime}.\n\n`
  text += `${params.viewingTeamMember} will meet you at ${params.viewingLocation} (Google Maps: ${params.mapUrl}). If you're driving, parking is at ${params.parkingNote}; if you'd like a pickup from your hotel, let me know and we'll arrange.\n\n`
  text += `What to bring:\n`
  text += `- Passport (the developer registers visitors at the sales gallery — quick formality, doesn't commit you to anything)\n`
  text += `- Any questions you've written down\n\n`
  text += `What you'll see:\n${params.viewingWhatToExpect}\n\n`
  text += `Plan for about 90 minutes including the drive to the actual unit. Sometimes longer if you want to look at multiple unit types.\n\n`
  text += `If you need to reschedule, hit reply or WhatsApp me on ${params.yogiWhatsapp}.\n\n`
  text += `— Yogi at Hawook`

  return { subject, text, from: 'hello', replyTo: process.env.RESEND_FROM_YOGI! }
}
