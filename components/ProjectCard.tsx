import Link from 'next/link'
import Image from 'next/image'
import { formatPriceFrom } from '@/lib/format'
import type { Project } from '@/lib/types'
import HawookBadge from '@/components/HawookBadge'

const BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+'

type Props = {
  project: Project
}

export default function ProjectCard({ project }: Props) {
  const href = project.slug ? `/projects/${project.slug}` : '#'
  const teaser = project.hawook_intro ? project.hawook_intro.slice(0, 100) + '…' : null

  return (
    <Link href={href} className="group" style={{
      display: 'block',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      border: '1px solid var(--rule)',
      textDecoration: 'none',
      boxShadow: 'var(--shadow-lift)',
      transition: 'box-shadow var(--dur-base) var(--ease-out)',
    }}>
      <div style={{ aspectRatio: 'var(--ratio-gallery)', background: 'var(--bg-tint)', position: 'relative', overflow: 'hidden' }}>
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={project.project_name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No image</span>
          </div>
        )}
        {project.construction_status && (
          <span style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--fw-medium)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
          }}>
            {project.construction_status}
          </span>
        )}
      </div>
      <div style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lead)',
            fontWeight: 'var(--fw-medium)',
            color: 'var(--text-brand)',
            lineHeight: 'var(--lh-title)',
            margin: 0,
          }}>
            {project.project_name}
          </h3>
          {project.area && (
            <span style={{
              flexShrink: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--fw-medium)',
              color: 'var(--text-brand)',
              background: 'var(--bg-subtle-brand)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              marginTop: 2,
            }}>
              {project.area}
            </span>
          )}
        </div>
        {project.hawook_badge && (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <HawookBadge badge={project.hawook_badge} />
          </div>
        )}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--fw-semibold)',
          color: 'var(--text-primary)',
          marginBottom: teaser ? 'var(--space-4)' : 0,
        }}>
          {formatPriceFrom(project.price_min)}
        </p>
        {teaser && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--lh-editorial)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            margin: 0,
          }}>
            {teaser}
          </p>
        )}
      </div>
    </Link>
  )
}
