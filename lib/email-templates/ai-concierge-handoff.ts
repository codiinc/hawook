import type { EmailSender } from '@/lib/email'

export interface AiConciergeHandoffParams {
  leadEmail: string
  leadFirstName: string
  projectName: string
  responseWindow: string
  preferredChannel: string
  schedulingSummary: string
  userTimezone: string
  dashboardUrl: string
}

export function renderAiConciergeHandoff(params: AiConciergeHandoffParams): {
  subject: string
  text: string
  from: EmailSender
} {
  const subject = `Thanks for the chat — Yogi will be in touch on ${params.projectName}`

  let text = `Hi ${params.leadFirstName},\n\n`
  text += `Thanks for chatting with the Hawook Concierge. I've passed everything across to Yogi (or Codi for some specifics) — they'll come back to you ${params.responseWindow} on ${params.preferredChannel}.\n\n`
  text += `What they'll have when they reach out:\n`
  text += `- The full picture of what you've asked about\n`
  text += `- The scheduling preferences you shared (${params.schedulingSummary})\n`
  text += `- Your timezone (${params.userTimezone}) so we'll work to your hours\n\n`
  text += `In the meantime, your dashboard now has ${params.projectName} (and any others you've looked at). You'll get weekly updates by default, with a same-day note if anything major changes.\n\n`
  text += `If you want to add anything before Yogi gets back to you, just reply.\n\n`
  text += `— Hawook Concierge\n`
  text += `${params.dashboardUrl}`

  return { subject, text, from: 'hello' }
}
