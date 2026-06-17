import type { EmailSender } from '@/lib/email'

export interface LeadAcknowledgmentParams {
  leadEmail: string
  leadFirstName: string
  projectName: string
  yogiWhatsapp: string
  dashboardUrl: string
}

export function renderLeadAcknowledgment(params: LeadAcknowledgmentParams): {
  subject: string
  text: string
  from: EmailSender
  replyTo: string
} {
  const subject = `Got it — let's get you the details on ${params.projectName}`

  let text = `Hi ${params.leadFirstName},\n\n`
  text += `Thanks for the message. I've got your details and I'm pulling together the full pricing, floor plans, and current availability for ${params.projectName}. You'll have those in your inbox within the next hour during Phuket business hours — sooner if I'm at my desk.\n\n`
  text += `A couple of things while you wait:\n\n`
  text += `Your dashboard now shows ${params.projectName} in your followed projects, so you'll get notified if anything changes — pricing, foreign quota, construction milestone, that kind of thing.\n\n`
  text += `If you want to chat anything through, my WhatsApp is ${params.yogiWhatsapp}, or just reply to this email. Tell me what's drawing you to ${params.projectName} and what your timeline looks like — that helps me make sure I'm pointing you at the right unit type and floor.\n\n`
  text += `Speak soon.\n\n`
  text += `— Yogi at Hawook\n`
  text += `${params.dashboardUrl}`

  return { subject, text, from: 'hello', replyTo: process.env.RESEND_FROM_YOGI! }
}
