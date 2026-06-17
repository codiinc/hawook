import type { EmailSender } from '@/lib/email'

export interface MajorProposalAlertParams {
  approverEmail: string
  targetName: string
  changeSummary: string
  proposedBy: string
  sourceType: string
  discrepancyFlag: boolean
  discrepancyNote?: string
  queueUrl: string
  settingsUrl: string
}

export function renderMajorProposalAlert(params: MajorProposalAlertParams): {
  subject: string
  text: string
  from: EmailSender
} {
  const subject = `Major proposal: ${params.targetName} — ${params.changeSummary}`

  let text = `A major proposal needs your review.\n\n`
  text += `Project: ${params.targetName}\n`
  text += `Change: ${params.changeSummary}\n`
  text += `Submitted by: ${params.proposedBy}\n`
  text += `Source: ${params.sourceType}\n`

  if (params.discrepancyFlag && params.discrepancyNote) {
    text += `\n⚠️ Discrepancy flagged: ${params.discrepancyNote}\n`
  }

  text += `\nReview and approve:\n${params.queueUrl}\n\n`
  text += `Time-to-review target: 4 hours (Phuket business hours).\n\n`
  text += `—\nHawook System\n`
  text += `This email is sent automatically when a major-severity update is proposed. To adjust alert preferences, edit lib/approvers.ts or update your settings at ${params.settingsUrl}.`

  return { subject, text, from: 'system' }
}
