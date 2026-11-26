'use client'

import { useState } from 'react'

export default function DominionLeadForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setState('loading')
    try {
      const res = await fetch('/api/leads/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          project_slug: 'dominion-rawai',
        }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div style={{
        background: 'var(--bg-tint)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-body)',
        color: 'var(--text-primary)',
      }}>
        Got it — we&apos;ll email you when the Dominion Rawai profile goes live.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 420 }}>
      <div>
        <label htmlFor="dr-name" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
          Name
        </label>
        <input
          id="dr-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          required
          style={{
            width: '100%',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-body)',
            color: 'var(--text-primary)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--rule-strong)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div>
        <label htmlFor="dr-email" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
          Email
        </label>
        <input
          id="dr-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{
            width: '100%',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-body)',
            color: 'var(--text-primary)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--rule-strong)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
      {state === 'error' && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-danger, #dc2626)', margin: 0 }}>
          Something went wrong — please try again or email hello@hawook.com.
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'loading'}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-body)',
          fontWeight: 'var(--fw-semibold)',
          color: 'var(--text-on-inverse)',
          background: 'var(--rule-brand)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '12px 24px',
          cursor: state === 'loading' ? 'wait' : 'pointer',
          alignSelf: 'flex-start',
          opacity: state === 'loading' ? 0.7 : 1,
        }}
      >
        {state === 'loading' ? 'Sending…' : 'Notify me'}
      </button>
    </form>
  )
}
