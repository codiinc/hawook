'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(searchParams.get('redirectTo') ?? '/projects')
    router.refresh()
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email address first.'); return }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/dashboard`,
    })
    setResetSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-5)' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--rule)', padding: 'var(--space-8)', maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-lift)' }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-brand)', textDecoration: 'none' }}>
            Hawook
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-4)', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: 'var(--space-5) 0 var(--space-2)' }}>
            Sign in
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
            Access your saved projects and full data.
          </p>
        </div>

        {resetSent ? (
          <div style={{ background: 'var(--bg-subtle-brand)', border: '1px solid var(--navy-200)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-brand)' }}>
            Password reset link sent to <strong>{email}</strong>. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)', marginBottom: 6 }}>
                Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" style={inputStyle} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>
                  Password
                </label>
                <button type="button" onClick={handleForgotPassword} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Your password" style={inputStyle} />
            </div>

            {error && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--terracotta-700)', background: 'var(--terracotta-100)', padding: '10px 12px', borderRadius: 'var(--radius-md)', margin: 0 }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? 'var(--disabled-bg)' : 'var(--action-primary)', color: loading ? 'var(--disabled-text)' : 'var(--text-on-inverse)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', padding: '11px', borderRadius: 'var(--radius-md)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        <p style={{ marginTop: 'var(--space-6)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--text-brand)', fontWeight: 'var(--fw-semibold)', textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
