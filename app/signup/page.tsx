'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--rule-strong)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  color: 'var(--text-primary)',
  background: 'var(--bg-surface)',
  outline: 'none',
  boxSizing: 'border-box',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--rule)',
  padding: 'var(--space-8)',
  maxWidth: 400,
  width: '100%',
  boxShadow: 'var(--shadow-lift)',
}

function SignupForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=${searchParams.get('redirectTo') ?? '/projects'}`,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-5)' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-5)' }}>✉️</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-4)', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: '0 0 var(--space-4)' }}>
            Check your email
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-editorial)', margin: 0 }}>
            We&apos;ve sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-5)' }}>
      <div style={cardStyle}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-brand)', textDecoration: 'none' }}>
            Hawook
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-4)', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: 'var(--space-5) 0 var(--space-2)' }}>
            Create free account
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
            Access full pricing, ROI models, and private Q&amp;A.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)', marginBottom: 6 }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)', marginBottom: 6 }}>
              Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={6} placeholder="Min. 6 characters" style={inputStyle} />
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--terracotta-700)', background: 'var(--terracotta-100)', padding: '10px 12px', borderRadius: 'var(--radius-md)', margin: 0 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? 'var(--disabled-bg)' : 'var(--action-primary)', color: loading ? 'var(--disabled-text)' : 'var(--text-on-inverse)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', padding: '11px', borderRadius: 'var(--radius-md)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <p style={{ marginTop: 'var(--space-5)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          By signing up you agree to our terms. No spam — ever.
        </p>
        <p style={{ marginTop: 'var(--space-4)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--text-brand)', fontWeight: 'var(--fw-semibold)', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
