'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/areas', label: 'Areas' },
  { href: '/articles', label: 'Articles' },
  { href: '/about', label: 'About' },
]

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
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--rule)',
    }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link href="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.375rem',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--text-brand)',
            textDecoration: 'none',
            letterSpacing: 'var(--tracking-tight)',
          }}>
            Hawook
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 'var(--space-8)' }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--fw-medium)',
                  color: isActive(href) ? 'var(--text-brand)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color var(--dur-base) var(--ease-out)',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 'var(--space-4)' }}>
            {user ? (
              <>
                <Link href="/dashboard" style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--fw-medium)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}>
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--fw-medium)',
                    color: 'var(--text-tertiary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--fw-medium)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}>
                  Sign in
                </Link>
                <Link href="/signup" style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--fw-semibold)',
                  color: 'var(--text-on-inverse)',
                  background: 'var(--action-primary)',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'background var(--dur-base) var(--ease-out)',
                }}>
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              padding: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ display: 'block', width: 20, height: 1.5, background: 'currentColor', marginBottom: 5 }} />
            <span style={{ display: 'block', width: 20, height: 1.5, background: 'currentColor', marginBottom: 5 }} />
            <span style={{ display: 'block', width: 20, height: 1.5, background: 'currentColor' }} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden" style={{
            borderTop: '1px solid var(--rule)',
            padding: 'var(--space-6) 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--fw-medium)',
                  color: isActive(href) ? 'var(--text-brand)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--rule)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    Sign in
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-on-inverse)', background: 'var(--action-primary)', padding: '8px 18px', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
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
