'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FollowButton({ userId, projectId }: { userId: string; projectId: string }) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const client = supabase
    client
      .from('project_follows')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle()
      .then(({ data }) => {
        setFollowing(!!data)
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, projectId])

  async function toggle() {
    setLoading(true)
    if (following) {
      await supabase
        .from('project_follows')
        .delete()
        .eq('user_id', userId)
        .eq('project_id', projectId)
      setFollowing(false)
    } else {
      await supabase.from('project_follows').insert({ user_id: userId, project_id: projectId })
      setFollowing(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 border font-medium px-6 py-3 rounded-md transition-colors ${
        following
          ? 'border-teal text-teal bg-teal-light hover:bg-teal hover:text-white'
          : 'border-gray-300 text-gray-700 hover:border-teal hover:text-teal'
      }`}
    >
      {following ? '✓ Following' : 'Follow this project'}
    </button>
  )
}
