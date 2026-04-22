import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, last_updated')
    .eq('status', 'Active')
    .not('slug', 'is', null)

  const projectUrls = (projects ?? []).map((p) => ({
    url: `https://app.hawook.com/projects/${p.slug}`,
    lastModified: p.last_updated ? new Date(p.last_updated) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://app.hawook.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://app.hawook.com/projects',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...projectUrls,
  ]
}
