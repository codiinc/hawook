import type { EmailSender } from '@/lib/email'

export interface PostViewingFollowupParams {
  leadEmail: string
  leadFirstName: string
  projectName: string
  availabilityNote: string
  specificUnitInterest?: boolean
  specificUnit?: string
}

export function renderPostViewingFollowup(params: PostViewingFollowupParams): {
  subject: string
  text: string
  from: EmailSender
  replyTo: string
} {
  const subject = `How was ${params.projectName}?`

  let text = `Hi ${params.leadFirstName},\n\n`
  text += `Hope today went well at ${params.projectName}.\n\n`
  text += `Sending through what was discussed:\n`
  text += `- Full pricing for the units you looked at: attached\n`
  text += `- Availability as of today: ${params.availabilityNote}\n`

  if (params.specificUnitInterest && params.specificUnit) {
    text += `- Floor plan for ${params.specificUnit}: attached\n`
  }

  text += `\nIf anything came up during the viewing that you want to dig into — financing, payment plan, the area more broadly, comparison with anything else — happy to answer over email, WhatsApp, or a call at a time that suits you.\n\n`
  text += `Otherwise, take your time. There's no rush from our end. When you're ready for next steps, just say.\n\n`
  text += `— Yogi at Hawook`

  return { subject, text, from: 'hello', replyTo: process.env.RESEND_FROM_YOGI! }
}
