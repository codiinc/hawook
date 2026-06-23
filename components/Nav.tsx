'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const client = supabase
    client.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl font-semibold text-gray-900 tracking-tight">
            Hawook
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/projects"
              className={`text-sm font-medium transition-colors ${isActive('/projects') ? 'text-teal' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Projects
            </Link>
            <Link
              href="/areas"
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Areas
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-teal text-white px-4 py-2 rounded-md hover:bg-teal-dark transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link href="/projects" className="block text-sm font-medium text-gray-700 py-1" onClick={() => setMenuOpen(false)}>
              Projects
            </Link>
            <Link href="/areas" className="block text-sm font-medium text-gray-400 py-1" onClick={() => setMenuOpen(false)}>
              Areas
            </Link>
            <Link href="/about" className="block text-sm font-medium text-gray-400 py-1" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            <div className="pt-2 border-t border-gray-100 flex gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="text-sm font-medium text-gray-500">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/signup" className="text-sm font-medium bg-teal text-white px-4 py-2 rounded-md" onClick={() => setMenuOpen(false)}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
