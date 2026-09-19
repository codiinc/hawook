import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-inverse)',
      borderTop: '1px solid var(--rule-inverse)',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-10) var(--gutter) var(--space-8)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--space-8)', marginBottom: 'var(--space-9)' }}>

          <div className="col-span-2 md:col-span-1">
            <Link href="/" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-title)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--text-on-inverse)',
              textDecoration: 'none',
            }}>
              Hawook
            </Link>
            <p style={{
              marginTop: 'var(--space-4)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-on-inverse-muted)',
              lineHeight: 'var(--lh-editorial)',
            }}>
              Independent Phuket property reviews. No agents. No commissions. No spin.
            </p>
          </div>

          <div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--text-on-inverse-muted)',
              marginBottom: 'var(--space-5)',
            }}>
              Explore
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <li><Link href="/projects" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', textDecoration: 'none' }}>Projects</Link></li>
              <li><Link href="/areas/rawai-nai-harn" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', textDecoration: 'none' }}>Rawai &amp; Nai Harn</Link></li>
              <li><Link href="/articles" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', textDecoration: 'none' }}>Articles</Link></li>
              <li><Link href="/about" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', textDecoration: 'none' }}>About</Link></li>
            </ul>
          </div>

          <div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--text-on-inverse-muted)',
              marginBottom: 'var(--space-5)',
            }}>
              Contact
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <li>
                <a href="https://wa.me/66805100129" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', textDecoration: 'none' }}>
                  WhatsApp us
                </a>
              </li>
              <li>
                <a href="mailto:hello@hawook.com" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', textDecoration: 'none' }}>
                  hello@hawook.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--text-on-inverse-muted)',
              marginBottom: 'var(--space-5)',
            }}>
              Legal
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <li><Link href="/privacy" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', textDecoration: 'none' }}>Privacy Policy</Link></li>
              <li><Link href="/terms" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', textDecoration: 'none' }}>Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        <div style={{ borderTop: '1px solid var(--rule-inverse)', paddingTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="flex flex-col sm:flex-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--navy-500)' }}>
              &copy; {new Date().getFullYear()} Hawook Property Consultancy. All rights reserved.
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--navy-500)' }}>
              Independent property research — not a licensed estate agent.
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--navy-500)' }}>The Chokdee Group Co., Ltd. — Trading as Hawook.</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--navy-500)', marginTop: 4 }}>We earn commission from developers, never from buyers.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
