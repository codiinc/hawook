import type { EmailSender } from '@/lib/email'

export interface ProjectUpdate {
  updateSummary: string
}

export interface ProjectWithUpdates {
  projectName: string
  projectUrl: string
  updates: ProjectUpdate[]
}

export interface WeeklyDigestParams {
  userEmail: string
  userFirstName: string
  weekDescriptor: string
  projectsWithUpdates: ProjectWithUpdates[]
  newsletterTopStory?: {
    title: string
    summary: string
    url: string
  }
  suggestedProject?: {
    name: string
    oneLiner: string
    url: string
  }
  settingsUrl: string
  unsubscribeUrl: string
}

export function renderWeeklyDigest(params: WeeklyDigestParams): {
  subject: string
  text: string
  from: EmailSender
  replyTo: string
} {
  const subject = `${params.weekDescriptor} — what changed on your followed projects`

  let text = `Hi ${params.userFirstName},\n\n`
  text += `Here's what moved this week on the projects you're following.\n\n`

  for (const project of params.projectsWithUpdates) {
    text += `${project.projectName}\n`
    for (const update of project.updates) {
      text += `- ${update.updateSummary}\n`
    }
    text += `See full update: ${project.projectUrl}\n\n`
  }

  if (params.newsletterTopStory) {
    text += `From the Hawook newsletter this week:\n`
    text += `${params.newsletterTopStory.title}\n`
    text += `${params.newsletterTopStory.summary}\n`
    text += `Read: ${params.newsletterTopStory.url}\n\n`
  }

  if (params.suggestedProject) {
    text += `You might also be interested in:\n`
    text += `${params.suggestedProject.name} — ${params.suggestedProject.oneLiner}\n`
    text += `${params.suggestedProject.url}\n\n`
  }

  text += `Any questions on anything you see, just reply.\n\n`
  text += `— Yogi at Hawook\n\n`
  text += `—\n`
  text += `You're receiving this because you follow projects on Hawook. Adjust notification settings: ${params.settingsUrl} | Unsubscribe: ${params.unsubscribeUrl}`

  return { subject, text, from: 'hello', replyTo: process.env.RESEND_FROM_YOGI! }
}
