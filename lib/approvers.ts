// Approver whitelist — emails allowed to approve update_proposals.
// This is intentionally separate from lib/admin.ts (which controls admin UI access).
// All approvers must also be admins. Not all admins are approvers.
export const APPROVERS = ['codi@chokdee.co']

export function isApprover(email: string | null | undefined): boolean {
  if (!email) return false
  return APPROVERS.includes(email.toLowerCase())
}
