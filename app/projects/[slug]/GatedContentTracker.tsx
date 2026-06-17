'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export default function GatedContentTracker({ projectSlug }: { projectSlug: string }) {
  useEffect(() => {
    trackEvent('gated_content_unlocked', { project_slug: projectSlug })
  }, [projectSlug])

  return null
}
