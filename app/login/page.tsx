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

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const redirectTo = searchParams.get('redirectTo') ?? '/projects'
    router.push(redirectTo)
    router.refresh()
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address first.')
      return
    }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/dashboard`,
    })
    setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-100 p-8 max-w-md w-full">
        <div className="mb-8">
          <Link href="/" className="font-serif text-xl font-semibold text-gray-900">Hawook</Link>
          <h1 className="font-serif text-2xl font-medium text-gray-900 mt-4 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500">Access your saved projects and full data.</p>
        </div>

        {resetSent ? (
          <div className="bg-teal-light rounded-md p-4 text-sm text-teal">
            Password reset link sent to <strong>{email}</strong>. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-gray-400 hover:text-teal transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                placeholder="Your password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal text-white font-medium py-2.5 rounded-md hover:bg-teal-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-teal hover:text-teal-dark font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
