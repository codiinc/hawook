import { Resend } from 'resend'

// Lazy-initialize so builds without RESEND_API_KEY don't throw at module load
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

export type EmailSender = 'hello' | 'system' | 'yogi' | 'codi'

const SENDER_MAP: Record<EmailSender, { name: string; email: string }> = {
  hello: { name: 'Hawook', email: process.env.RESEND_FROM_HELLO! },
  system: { name: 'Hawook System', email: process.env.RESEND_FROM_SYSTEM! },
  yogi: { name: 'Yogi at Hawook', email: process.env.RESEND_FROM_YOGI! },
  codi: { name: 'Codi at Hawook', email: process.env.RESEND_FROM_CODI! },
}

export interface SendEmailParams {
  from: EmailSender
  to: string | string[]
  subject: string
  text: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}

export async function sendEmail(params: SendEmailParams) {
  const sender = SENDER_MAP[params.from]

  try {
    const result = await getResend().emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      replyTo: params.replyTo,
      tags: params.tags,
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Resend error:', error)
    return { success: false, error }
  }
}
