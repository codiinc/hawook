import type { EmailSender } from '@/lib/email'

export interface NewLeadAlertParams {
  leadName: string
  leadEmail: string
  leadWhatsapp?: string
  leadSource: 'form_submission' | 'ai_concierge' | 'newsletter' | 'referral' | 'partner' | 'other'
  leadProjectContext?: string
  leadBudget?: string
  leadTimeframe?: string
  leadPersona?: 'buyer' | 'investor' | 'agent' | 'other'
  aiConciergeContext?: boolean
  aiConciergeSummary?: string
  schedulingContext?: string
  leadUrl: string
}

export function renderNewLeadAlert(params: NewLeadAlertParams): {
  subject: string
  text: string
  from: EmailSender
} {
  const subject = `New lead — ${params.leadName} (${params.leadSource})`

  let text = `A new lead just came in.\n\n`
  text += `Name: ${params.leadName}\n`
  text += `Email: ${params.leadEmail}\n`
  if (params.leadWhatsapp) text += `WhatsApp: ${params.leadWhatsapp}\n`
  text += `Source: ${params.leadSource}\n`
  if (params.leadProjectContext) text += `Project: ${params.leadProjectContext}\n`
  if (params.leadBudget) text += `Budget: ${params.leadBudget}\n`
  if (params.leadTimeframe) text += `Timeframe: ${params.leadTimeframe}\n`
  if (params.leadPersona) text += `Identifies as: ${params.leadPersona}\n`

  if (params.aiConciergeContext && params.aiConciergeSummary) {
    text += `\nWhat they asked the Concierge:\n${params.aiConciergeSummary}\n`
    if (params.schedulingContext) {
      text += `\nScheduling info gathered:\n${params.schedulingContext}\n`
    }
  }

  text += `\nSLA: respond within 1 hour (Phuket business hours), 4 hours outer bound.\n\n`
  text += `Open lead in CRM:\n${params.leadUrl}\n\n`
  text += `—\nHawook System`

  return { subject, text, from: 'system' }
}
