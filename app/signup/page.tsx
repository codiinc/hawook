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

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="font-serif text-2xl font-medium text-gray-900 mb-3">Check your email</h1>
          <p className="text-gray-600 text-sm">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-100 p-8 max-w-md w-full">
        <div className="mb-8">
          <Link href="/" className="font-serif text-xl font-semibold text-gray-900">Hawook</Link>
          <h1 className="font-serif text-2xl font-medium text-gray-900 mt-4 mb-1">Create free account</h1>
          <p className="text-sm text-gray-500">Access full pricing, ROI models, and private Q&A.</p>
        </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              placeholder="Min. 6 characters"
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
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-gray-400">
          By signing up you agree to our terms. No spam — ever.
        </p>
        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-teal hover:text-teal-dark font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
