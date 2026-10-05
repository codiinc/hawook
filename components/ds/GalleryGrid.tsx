'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface GalleryGridProps {
  galleryUrls: string[]
  galleryTypes: string[]
  projectName: string
}

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjY3NSI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0VCRTZERSIvPjwvc3ZnPg=='

const FLOOR_PLAN_TYPES = new Set(['floor_plan', 'floorplan', 'floor plan', 'site_plan', 'siteplan'])

function isFloorPlan(type: string | undefined): boolean {
  return FLOOR_PLAN_TYPES.has((type ?? '').toLowerCase().replace(/\s+/g, '_'))
}

type ImageItem = { url: string; type: string; originalIndex: number }

export function GalleryGrid({ galleryUrls, galleryTypes, projectName }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  // allImages in lightbox order: main images first, then floor plans
  const mainImages: ImageItem[] = []
  const floorPlanImages: ImageItem[] = []

  galleryUrls.forEach((url, i) => {
    const type = galleryTypes[i] ?? ''
    if (isFloorPlan(type)) {
      floorPlanImages.push({ url, type, originalIndex: i })
    } else {
      mainImages.push({ url, type, originalIndex: i })
    }
  })

  const allInLightboxOrder = [...mainImages, ...floorPlanImages]

  const close = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(() =>
    setLightboxIndex(i => (i !== null ? (i - 1 + allInLightboxOrder.length) % allInLightboxOrder.length : null)),
    [allInLightboxOrder.length])
  const next = useCallback(() =>
    setLightboxIndex(i => (i !== null ? (i + 1) % allInLightboxOrder.length : null)),
    [allInLightboxOrder.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, close, prev, next])

  if (galleryUrls.length === 0) return null

  const firstIsCGI = (['cgi', 'render', 'developer_render'] as string[]).includes(mainImages[0]?.type ?? '')

  return (
    <>
      {/* ── Main gallery ── */}
      <div>
        {/* Mobile: horizontal scroll carousel */}
        <div className="gallery-mobile-carousel" style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 4, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {mainImages.map((img, idx) => (
            <button
              key={img.originalIndex}
              onClick={() => setLightboxIndex(idx)}
              aria-label={`View ${projectName} image ${idx + 1}`}
              style={{ position: 'relative', flexShrink: 0, width: 280, height: 200, borderRadius: 2, overflow: 'hidden', background: 'var(--sand-200)', border: 'none', padding: 0, cursor: 'zoom-in', scrollSnapAlign: 'start' }}
            >
              <Image src={img.url} alt={`${projectName} — image ${idx + 1}`} fill style={{ objectFit: 'cover', filter: 'saturate(0.88) contrast(0.96)' }} placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} />
              {idx === 0 && firstIsCGI && (
                <div style={{ position: 'absolute', bottom: 8, left: 8, fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', background: 'rgba(1,28,56,0.55)', padding: '3px 8px', borderRadius: '2px' }}>
                  Developer render
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Desktop: 2-column grid */}
        <div className="gallery-desktop-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {mainImages.map((img, idx) => (
            <button
              key={img.originalIndex}
              onClick={() => setLightboxIndex(idx)}
              aria-label={`View ${projectName} image ${idx + 1}`}
              style={{ position: 'relative', paddingTop: '66%', borderRadius: 2, overflow: 'hidden', background: 'var(--sand-200)', border: 'none', padding: 0, cursor: 'zoom-in', aspectRatio: '3/2' }}
            >
              <Image src={img.url} alt={`${projectName} — image ${idx + 1}`} fill style={{ objectFit: 'cover', filter: 'saturate(0.88) contrast(0.96)' }} placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} />
              {idx === 0 && firstIsCGI && (
                <div style={{ position: 'absolute', bottom: 10, left: 10, fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', background: 'rgba(1,28,56,0.55)', padding: '3px 8px', borderRadius: '2px' }}>
                  Developer render
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Floor plans sub-gallery ── */}
      {floorPlanImages.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 12 }}>
            Floor plans
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {floorPlanImages.map((img, idx) => (
              <button
                key={img.originalIndex}
                onClick={() => setLightboxIndex(mainImages.length + idx)}
                aria-label={`View ${projectName} floor plan ${idx + 1}`}
                style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 2, overflow: 'hidden', background: 'var(--sand-100)', border: '1px solid var(--rule)', padding: 0, cursor: 'zoom-in' }}
              >
                <Image src={img.url} alt={`${projectName} — floor plan ${idx + 1}`} fill style={{ objectFit: 'contain' }} placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={close}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            {lightboxIndex + 1} / {allInLightboxOrder.length}
            {lightboxIndex >= mainImages.length && (
              <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>floor plan</span>
            )}
          </div>

          <button onClick={close} aria-label="Close lightbox" style={{ position: 'absolute', top: 16, right: 20, color: '#fff', background: 'none', border: 'none', fontSize: '28px', lineHeight: 1, cursor: 'pointer', opacity: 0.7 }}>
            ×
          </button>

          {allInLightboxOrder.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prev() }} aria-label="Previous image" style={{ position: 'absolute', left: 16, color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ‹
            </button>
          )}

          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: 'min(90vw, 1100px)', height: 'min(80vh, 720px)' }}>
            <Image
              src={allInLightboxOrder[lightboxIndex].url}
              alt={`${projectName} — image ${lightboxIndex + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              sizes="min(90vw, 1100px)"
              priority
            />
          </div>

          {allInLightboxOrder.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); next() }} aria-label="Next image" style={{ position: 'absolute', right: 16, color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ›
            </button>
          )}
        </div>
      )}

      {/* Media query: show mobile carousel ≤768px, desktop grid >768px */}
      <style>{`
        @media (max-width: 768px) {
          .gallery-desktop-grid { display: none !important; }
        }
        @media (min-width: 769px) {
          .gallery-mobile-carousel { display: none !important; }
        }
        .gallery-mobile-carousel::-webkit-scrollbar { display: none; }
        .gallery-mobile-carousel { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  )
}
