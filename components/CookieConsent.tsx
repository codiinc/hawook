'use client'

import { useState, useEffect } from 'react'

type ConsentChoice = 'all' | 'analytics' | 'none'

function applyConsent(choice: ConsentChoice) {
  if (typeof window === 'undefined') return
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
  if (!gtag) return
  const analytics = choice !== 'none' ? 'granted' : 'denied'
  const ads = choice === 'all' ? 'granted' : 'denied'
  gtag('consent', 'update', {
    analytics_storage: analytics,
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  })
}

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('hawook_consent') as ConsentChoice | null
    if (stored) {
      applyConsent(stored)
    } else {
      setShow(true)
    }
  }, [])

  function handleChoice(choice: ConsentChoice) {
    localStorage.setItem('hawook_consent', choice)
    applyConsent(choice)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-cream border border-gray-200 rounded-xl shadow-lg p-5 sm:p-6">
        <p className="text-sm font-semibold text-gray-900 mb-1">Cookie preferences</p>
        <p className="text-sm text-gray-600 mb-5">
          We use analytics cookies to understand how visitors use the site. No advertising trackers.
          {' '}
          <a href="/privacy" className="text-teal underline hover:text-teal-dark transition-colors">
            Privacy Policy
          </a>
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleChoice('all')}
            className="flex-1 bg-teal text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-teal-dark transition-colors"
          >
            Accept all
          </button>
          <button
            onClick={() => handleChoice('analytics')}
            className="flex-1 border border-teal text-teal text-sm font-medium px-4 py-2.5 rounded-md hover:bg-teal-light transition-colors"
          >
            Analytics only
          </button>
          <button
            onClick={() => handleChoice('none')}
            className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-md hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            Reject all
          </button>
        </div>
      </div>
    </div>
  )
}
