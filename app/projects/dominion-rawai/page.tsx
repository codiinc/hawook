import type { Metadata } from 'next'
import Link from 'next/link'
import DominionLeadForm from './DominionLeadForm'

export const metadata: Metadata = {
  title: 'Dominion Rawai — Project Profile Coming Soon | Hawook',
  description: 'Dominion Rawai is a freehold villa development in Rawai, South Phuket. Full project profile and pricing analysis coming soon.',
  robots: { index: false },
}

export default function DominionRawaiPage() {
  return (
    <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-10) var(--gutter)' }}>
      {/* Coming-soon badge */}
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-label)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--text-brand)',
            background: 'var(--bg-subtle-brand)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
          }}>
            Profile coming soon
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 4vw, var(--text-display-3))',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--text-brand)',
          lineHeight: 'var(--lh-title)',
          letterSpacing: 'var(--tracking-tight)',
          margin: '0 0 var(--space-5)',
        }}>
          Dominion Rawai
        </h1>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-body-lg)',
          color: 'var(--text-secondary)',
          lineHeight: 'var(--lh-editorial)',
          margin: '0 0 var(--space-4)',
        }}>
          Freehold villa development · Rawai, South Phuket
        </p>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-body)',
          color: 'var(--text-tertiary)',
          lineHeight: 'var(--lh-editorial)',
          margin: '0 0 var(--space-8)',
        }}>
          Rawai sits at the southern tip of Phuket — quieter than the west-coast resort belt, with strong freehold land
          availability and a well-established expat community. Dominion Rawai is currently under review. Full
          independent pricing analysis, Hawook Score, and project documentation will publish once our assessment
          is complete.
        </p>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--rule)', marginBottom: 'var(--space-8)' }} />

        {/* Lead capture */}
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-5)',
            fontWeight: 'var(--fw-medium)',
            color: 'var(--text-brand)',
            margin: '0 0 var(--space-3)',
            lineHeight: 'var(--lh-title)',
          }}>
            Get notified when this profile publishes
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            margin: '0 0 var(--space-6)',
          }}>
            Leave your name and email and we&apos;ll send you the full analysis when it&apos;s ready — no sales calls.
          </p>
          <DominionLeadForm />
        </div>

        {/* Back link */}
        <div style={{ marginTop: 'var(--space-10)' }}>
          <Link
            href="/projects"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--fw-medium)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            ← Browse all projects
          </Link>
        </div>
      </div>
    </div>
  )
}
