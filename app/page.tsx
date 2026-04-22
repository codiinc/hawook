import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_name, slug, area, price_min, construction_status, cover_image_url, hawook_intro, status')
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      {/* Hero */}
      <section className="relative bg-cream overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#0F6E56 1px, transparent 1px), linear-gradient(to right, #0F6E56 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-gray-900 leading-tight mb-6">
              Phuket property, honestly reviewed.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10 max-w-xl">
              Browse off-plan developments with independent pricing, ROI analysis, and area guides — no sales spin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center bg-teal text-white font-medium px-6 py-3 rounded-md hover:bg-teal-dark transition-colors"
              >
                Browse projects
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-md hover:border-gray-400 hover:text-gray-900 transition-colors bg-white"
              >
                Get free access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-gray-900 mb-10">Latest projects</h2>

        {projects && projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project as Project} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-teal font-medium hover:text-teal-dark transition-colors"
              >
                View all projects →
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="font-serif text-xl text-gray-400">Projects coming soon.</p>
          </div>
        )}
      </section>
    </>
  )
}
