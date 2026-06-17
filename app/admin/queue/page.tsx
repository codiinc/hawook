import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isApprover } from '@/lib/approvers'
import QueueClient from './QueueClient'

export const metadata = { title: 'Queue — Admin | Hawook' }

export default async function QueuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const canApprove = isApprover(user?.email)

  const { data } = await supabaseAdmin
    .from('update_proposals')
    .select('*')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: true })

  const raw = (data ?? []) as Record<string, unknown>[]

  // Sort: major first, then standard, then minor; oldest-first within each severity
  const SEV: Record<string, number> = { major: 3, standard: 2, minor: 1 }
  const proposals = raw.slice().sort((a, b) => {
    const diff = (SEV[b.severity as string] ?? 0) - (SEV[a.severity as string] ?? 0)
    if (diff !== 0) return diff
    return new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime()
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Approval Queue</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          AI-proposed updates awaiting review. Major proposals require same-day attention.
        </p>
      </div>
      <QueueClient initialProposals={proposals} canApprove={canApprove} />
    </div>
  )
}
