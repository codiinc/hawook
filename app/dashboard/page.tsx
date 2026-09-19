import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/lib/types'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/dashboard')

  const [{ data: follows }, { data: recommended }] = await Promise.all([
    supabase
      .from('project_follows')
      .select('project_id, projects(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('id, project_name, slug, area, price_min, construction_status, cover_image_url, hawook_intro, status')
      .eq('status', 'Active')
      .limit(3),
  ])

  const followedProjects = (follows ?? [])
    .map((f) => f.projects as unknown as Project)
    .filter(Boolean) as Project[]

  return (
    <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-9) var(--gutter)' }}>
      <div style={{ marginBottom: 'var(--space-9)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, var(--text-display-3))', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: '0 0 var(--space-3)' }}>
          Welcome back
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 0 }}>
          {user.email}
        </p>
      </div>

      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: '0 0 var(--space-7)' }}>
          Followed projects
        </h2>
        {followedProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
            {followedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--rule)', padding: 'var(--space-9)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', color: 'var(--text-secondary)', margin: '0 0 var(--space-5)' }}>
              You haven&apos;t followed any projects yet.
            </p>
            <Link href="/projects" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-brand)', textDecoration: 'none' }}>
              Browse projects →
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: '0 0 var(--space-7)' }}>
          You might also like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
          {(recommended ?? []).map((project) => (
            <ProjectCard key={project.id} project={project as Project} />
          ))}
        </div>
      </section>
    </div>
  )
}
