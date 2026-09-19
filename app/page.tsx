import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/lib/types'

export const metadata: Metadata = {
  title: { absolute: 'Hawook — Curated off-plan property in Phuket' },
  description: 'Browse off-plan developments in Phuket with independent pricing, ROI analysis, and area guides — no sales spin.',
  alternates: { canonical: 'https://app.hawook.com' },
  openGraph: {
    title: 'Hawook — Curated off-plan property in Phuket',
    description: 'Browse off-plan developments in Phuket with independent pricing, ROI analysis, and area guides — no sales spin.',
    url: 'https://app.hawook.com',
    siteName: 'Hawook',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hawook — Curated off-plan property in Phuket',
    description: 'Browse off-plan developments in Phuket with independent pricing, ROI analysis, and area guides — no sales spin.',
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: projects }, { data: { user } }] = await Promise.all([
    supabase
      .from('projects_public')
      .select('id, project_name, slug, area, price_min, construction_status, cover_image_url, hawook_intro, hawook_badge, status')
      .eq('status', 'Active')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.auth.getUser(),
  ])

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--bg-inverse-deep)', overflow: 'hidden', position: 'relative' }}>
        {/* Subtle grid texture */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.06,
            backgroundImage: `linear-gradient(var(--navy-300) 1px, transparent 1px), linear-gradient(to right, var(--navy-300) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div style={{
          position: 'relative',
          maxWidth: 'var(--container)',
          margin: '0 auto',
          padding: 'var(--space-10) var(--gutter)',
        }}>
          <div style={{ maxWidth: '640px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, var(--text-display-2))',
              fontWeight: 'var(--fw-medium)',
              color: 'var(--text-on-inverse)',
              lineHeight: 'var(--lh-display)',
              letterSpacing: 'var(--tracking-display)',
              margin: '0 0 var(--space-6)',
            }}>
              Phuket property, honestly reviewed.
            </h1>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-body-lg)',
              color: 'var(--text-on-inverse-muted)',
              lineHeight: 'var(--lh-editorial)',
              margin: '0 0 var(--space-8)',
              maxWidth: 'var(--measure-narrow)',
            }}>
              Browse off-plan developments with independent pricing, ROI analysis, and area guides — no sales spin.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <Link href="/projects" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--text-on-inverse)',
                background: 'var(--rule-brand)',
                border: '1px solid var(--navy-700)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
              }}>
                Browse projects
              </Link>
              <Link href={user ? '/dashboard' : '/signup'} style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--fw-medium)',
                color: 'var(--text-on-inverse)',
                background: 'transparent',
                border: '1px solid var(--rule-inverse)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
              }}>
                {user ? 'Go to dashboard' : 'Get free access'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section style={{
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: 'var(--space-10) var(--gutter)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-8)', gap: 'var(--space-5)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-4)',
            fontWeight: 'var(--fw-medium)',
            color: 'var(--text-brand)',
            margin: 0,
            lineHeight: 'var(--lh-title)',
          }}>
            Latest projects
          </h2>
          <Link href="/projects" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--fw-medium)',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            View all →
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project as Project} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lead)', color: 'var(--text-tertiary)' }}>
              Projects coming soon.
            </p>
          </div>
        )}
      </section>
    </>
  )
}
