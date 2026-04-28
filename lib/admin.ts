export const ADMIN_EMAILS = [
  'codi@chokdee.co',
]

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
