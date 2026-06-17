import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import MediaPanel from './MediaPanel'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Media — ${slug} | Admin` }
}

export default async function MediaPage({ params }: Props) {
  const { slug } = await params

  const { data } = await supabaseAdmin
    .from('projects')
    .select('id, project_name, slug, cover_image_url, cover_image_type, gallery_urls, gallery_types, floorplan_urls, video_urls, google_maps_url, virtual_tour_url')
    .eq('slug', slug)
    .single()

  if (!data) notFound()

  const raw = data as Record<string, unknown>

  const project = {
    id: raw.id as string,
    project_name: raw.project_name as string,
    slug: raw.slug as string,
    cover_image_url: (raw.cover_image_url as string) || null,
    cover_image_type: (raw.cover_image_type as string) || null,
    gallery_urls: (Array.isArray(raw.gallery_urls) ? raw.gallery_urls : []) as string[],
    gallery_types: (Array.isArray(raw.gallery_types) ? raw.gallery_types : []) as string[],
    floorplan_urls: (Array.isArray(raw.floorplan_urls) ? raw.floorplan_urls : []) as string[],
    video_urls: (Array.isArray(raw.video_urls) ? raw.video_urls : []) as string[],
    google_maps_url: (raw.google_maps_url as string) || null,
    virtual_tour_url: (raw.virtual_tour_url as string) || null,
  }

  return <MediaPanel project={project} />
}
