// GA4 custom event helper — client-side only
// Call from 'use client' components or event handlers

type GtagEvent =
  | 'lead_form_submitted'
  | 'user_signup'
  | 'project_followed'
  | 'gated_content_unlocked'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(event: GtagEvent, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', event, params ?? {})
}
