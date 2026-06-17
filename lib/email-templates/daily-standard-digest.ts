import type { EmailSender } from '@/lib/email'

export interface StandardProposalItem {
  targetName: string
  changeSummary: string
  relativeTime: string
  proposedBy: string
}

export interface DailyStandardDigestParams {
  approverEmail: string
  pendingCount: number
  proposals: StandardProposalItem[]
  queueUrl: string
}

export function renderDailyStandardDigest(params: DailyStandardDigestParams): {
  subject: string
  text: string
  from: EmailSender
} {
  const subject = `${params.pendingCount} proposals pending review`

  let text = `You have ${params.pendingCount} standard-severity proposals waiting in the queue.\n\n`

  for (const p of params.proposals) {
    text += `• ${p.targetName}: ${p.changeSummary} — submitted ${p.relativeTime} by ${p.proposedBy}\n`
  }

  text += `\nReview queue:\n${params.queueUrl}\n\n`
  text += `Target: review within 48 hours of submission.\n\n`
  text += `—\nHawook System`

  return { subject, text, from: 'system' }
}
