import type { EmailSender } from '@/lib/email'

export interface MinorProposalItem {
  targetName: string
  changeSummary: string
  proposedDate: string
}

export interface WeeklyMinorDigestParams {
  approverEmail: string
  pendingCount: number
  proposals: MinorProposalItem[]
  queueUrl: string
}

export function renderWeeklyMinorDigest(params: WeeklyMinorDigestParams): {
  subject: string
  text: string
  from: EmailSender
} {
  const subject = `Weekly review — ${params.pendingCount} minor proposals`

  let text = `Minor proposals pending review from the past week.\n\n`

  for (const p of params.proposals) {
    text += `• ${p.targetName}: ${p.changeSummary} (${p.proposedDate})\n`
  }

  text += `\nBulk-approve or review individually:\n${params.queueUrl}\n\n`
  text += `—\nHawook System`

  return { subject, text, from: 'system' }
}
