import { createClient } from '@/lib/supabase/server'
import ProjectsClient from './ProjectsClient'
import type { Project } from '@/lib/types'

export const metadata = {
  title: 'Projects',
  description: 'Browse off-plan property developments in Phuket with honest, independent reviews.',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_name, slug, area, price_min, price_max, construction_status, cover_image_url, hawook_intro, status, foreign_quota_available, rental_program_available, unit_types')
    .eq('status', 'Active')
    .order('created_at', { ascending: false })

  return <ProjectsClient projects={(projects ?? []) as Project[]} />
}
