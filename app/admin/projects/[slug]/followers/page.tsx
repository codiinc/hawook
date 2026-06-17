import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Followers — ${slug} | Admin` }
}

function anonymizeName(name: string | null): string {
  if (!name || name.trim().length === 0) return '?***?'
  const clean = name.trim()
  if (clean.length === 1) return `${clean}***`
  return `${clean[0]}***${clean[clean.length - 1]}`
}

function anonymizeEmail(email: string | null): string {
  if (!email) return 'unknown domain'
  const atIdx = email.indexOf('@')
  if (atIdx === -1) return 'unknown domain'
  return `at ${email.slice(atIdx + 1)}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default async function FollowersPage({ params }: Props) {
  const { slug } = await params

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!project) notFound()
  const raw = project as Record<string, unknown>

  const { data: follows, count } = await supabaseAdmin
    .from('project_follows')
    .select('id, created_at, user_id', { count: 'exact' })
    .eq('project_id', raw.id as string)
    .order('created_at', { ascending: false })

  const followRows = (follows ?? []) as Record<string, unknown>[]

  // Fetch user details for each follower
  const userIds = followRows.map(f => f.user_id as string).filter(Boolean)
  let userMap: Record<string, { email: string | null; full_name: string | null }> = {}

  if (userIds.length > 0) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .in('id', userIds)

    userMap = Object.fromEntries(
      ((users ?? []) as Record<string, unknown>[]).map(u => [
        u.id as string,
        { email: u.email as string | null, full_name: u.full_name as string | null },
      ])
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Followers</h2>
        <p className="text-xs text-gray-400 mt-0.5">{count ?? 0} follower{count !== 1 ? 's' : ''} — names and emails anonymized</p>
      </div>

      {followRows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-400">No followers yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-50">
          {followRows.map(follow => {
            const userId = follow.user_id as string
            const user = userMap[userId]
            const displayName = anonymizeName(user?.full_name ?? null)
            const displayEmail = anonymizeEmail(user?.email ?? null)
            return (
              <div key={follow.id as string} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-gray-700 font-medium">{displayName} <span className="font-normal text-gray-400">{displayEmail}</span></p>
                </div>
                <p className="text-xs text-gray-400">{formatDate(follow.created_at as string)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
