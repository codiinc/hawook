import Link from 'next/link'
import Image from 'next/image'
import { formatPriceFrom } from '@/lib/format'
import type { Project } from '@/lib/types'

type Props = {
  project: Project
}

export default function ProjectCard({ project }: Props) {
  const href = project.slug ? `/projects/${project.slug}` : '#'
  const teaser = project.hawook_intro ? project.hawook_intro.slice(0, 100) + '…' : null

  return (
    <Link href={href} className="group block bg-cream rounded-lg overflow-hidden border border-gray-100 hover:border-teal/30 transition-colors">
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={project.project_name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-gray-300 text-sm">No image</span>
          </div>
        )}
        {project.construction_status && (
          <span className="absolute top-3 left-3 bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded">
            {project.construction_status}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-lg font-medium text-gray-900 leading-snug group-hover:text-teal transition-colors">
            {project.project_name}
          </h3>
          {project.area && (
            <span className="shrink-0 text-xs text-teal bg-teal-light px-2 py-0.5 rounded font-medium mt-0.5">
              {project.area}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900 mb-3">
          {formatPriceFrom(project.price_min)}
        </p>
        {teaser && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{teaser}</p>
        )}
      </div>
    </Link>
  )
}
