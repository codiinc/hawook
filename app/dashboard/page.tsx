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

  const email = user.email ?? ''

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-3xl font-medium text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm">{email}</p>
      </div>

      {/* Followed projects */}
      <section className="mb-16">
        <h2 className="font-serif text-xl font-medium text-gray-900 mb-6">Followed projects</h2>
        {followedProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {followedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-cream rounded-lg p-10 text-center">
            <p className="text-gray-500 mb-4">You haven&apos;t followed any projects yet.</p>
            <Link href="/projects" className="inline-flex items-center gap-1 text-teal font-medium hover:text-teal-dark">
              Browse projects →
            </Link>
          </div>
        )}
      </section>

      {/* Recommended */}
      <section>
        <h2 className="font-serif text-xl font-medium text-gray-900 mb-6">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(recommended ?? []).map((project) => (
            <ProjectCard key={project.id} project={project as Project} />
          ))}
        </div>
      </section>
    </div>
  )
}
