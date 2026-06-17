import type { EmailSender } from '@/lib/email'

export interface WelcomeParams {
  userEmail: string
  userFirstName: string
  projectsUrl: string
}

export function renderWelcome(params: WelcomeParams): {
  subject: string
  text: string
  from: EmailSender
  replyTo: string
} {
  const subject = `Welcome to Hawook`

  let text = `Hi ${params.userFirstName},\n\n`
  text += `Thanks for signing up — you're now set to follow projects, unlock full pricing and floor plans, and get notified when there's something worth knowing.\n\n`
  text += `What's worth doing first:\n\n`
  text += `Follow a few projects you're interested in. We send a weekly digest with anything that's changed — pricing, foreign quota, construction milestones, new floor plans. If something major happens on a project you follow, you'll get a same-day note rather than waiting for the digest.\n\n`
  text += `If you have a specific budget, area, or timeframe in mind, hit reply and tell me. I'll send a personal shortlist of projects that fit — the curated version rather than browsing the whole site.\n\n`
  text += `A note on what we do: Hawook is a curated property platform. We list around ten projects per area, not every project. Each one we've signed an agency agreement with, done full diligence on, and decided we'd buy ourselves. So if it's on the site, it cleared our bar.\n\n`
  text += `Have a look around:\n${params.projectsUrl}\n\n`
  text += `Any questions, just reply.\n\n`
  text += `— Yogi at Hawook`

  return { subject, text, from: 'hello', replyTo: process.env.RESEND_FROM_YOGI! }
}
