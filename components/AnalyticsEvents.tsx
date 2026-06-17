'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

function AnalyticsEventsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get('signup') === '1') {
      trackEvent('user_signup')
      // Remove the param from the URL without a page reload
      const params = new URLSearchParams(searchParams.toString())
      params.delete('signup')
      const newUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default function AnalyticsEvents() {
  return (
    <Suspense>
      <AnalyticsEventsInner />
    </Suspense>
  )
}
