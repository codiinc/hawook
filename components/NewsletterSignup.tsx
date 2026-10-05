'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <section
      style={{
        background: 'var(--bg-inverse-deep)',
        padding: 'var(--space-10) var(--gutter)',
      }}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'var(--text-on-inverse-muted)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Hawook Newsletter
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3vw, var(--text-display-3))',
            fontWeight: 'var(--fw-medium)',
            color: 'var(--text-on-inverse)',
            lineHeight: 'var(--lh-title)',
            margin: '0 0 var(--space-4)',
          }}
        >
          Stay ahead of the market
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-body)',
            color: 'var(--text-on-inverse-muted)',
            lineHeight: 'var(--lh-editorial)',
            margin: '0 0 var(--space-7)',
          }}
        >
          New listings, price movements, and area updates — no developer sponsorships, no spin.
        </p>

        {state === 'done' ? (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-body)',
              color: 'var(--text-on-inverse)',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5) var(--space-6)',
            }}
          >
            You&apos;re subscribed — watch your inbox.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                flex: '1 1 220px',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-body)',
                color: 'var(--ink-900)',
                background: '#fff',
                border: '1px solid var(--sand-300)',
                borderRadius: 'var(--radius-md)',
                padding: '11px 16px',
                outline: 'none',
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--fw-semibold)',
                color: '#fff',
                background: 'var(--action-primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '11px 24px',
                cursor: state === 'loading' ? 'default' : 'pointer',
                opacity: state === 'loading' ? 0.7 : 1,
                flexShrink: 0,
              }}
            >
              {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}

        {state === 'error' && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: '#fca5a5', marginTop: 'var(--space-3)' }}>
            Something went wrong — try again or email hello@hawook.com.
          </p>
        )}

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            color: 'var(--navy-500)',
            marginTop: 'var(--space-5)',
          }}
        >
          No spam. Unsubscribe any time.
        </p>
      </div>
    </section>
  )
}
