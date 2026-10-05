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

export function GalleryGrid({ galleryUrls, galleryTypes, projectName }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(() =>
    setLightboxIndex(i => (i !== null ? (i - 1 + galleryUrls.length) % galleryUrls.length : null)), [galleryUrls.length])
  const next = useCallback(() =>
    setLightboxIndex(i => (i !== null ? (i + 1) % galleryUrls.length : null)), [galleryUrls.length])

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

  const totalExtra = galleryUrls.length > 3 ? galleryUrls.length - 3 : 0
  const firstIsCGI = galleryTypes[0] === 'cgi' || galleryTypes[0] === 'render'

  const mainUrl = galleryUrls[0]
  const secondUrl = galleryUrls[1] ?? null
  const thirdUrl = galleryUrls[2] ?? null

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '380px',
          gap: '16px',
        }}
      >
        {/* Large image */}
        <button
          onClick={() => setLightboxIndex(0)}
          aria-label={`View ${projectName} image 1`}
          style={{
            flex: 2,
            position: 'relative',
            borderRadius: '2px',
            overflow: 'hidden',
            background: 'var(--sand-200)',
            border: 'none',
            padding: 0,
            cursor: 'zoom-in',
          }}
        >
          <Image
            src={mainUrl}
            alt={`${projectName} — image 1`}
            fill
            style={{ objectFit: 'cover', filter: 'saturate(0.88) contrast(0.96)' }}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
          {firstIsCGI && (
            <div style={{ position: 'absolute', bottom: 12, left: 12, fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'rgba(1,28,56,0.55)', padding: '3px 8px', borderRadius: '2px' }}>
              Developer render
            </div>
          )}
        </button>

        {/* Right stack */}
        {(secondUrl || thirdUrl) && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {secondUrl && (
              <button
                onClick={() => setLightboxIndex(1)}
                aria-label={`View ${projectName} image 2`}
                style={{ flex: 1, position: 'relative', borderRadius: '2px', overflow: 'hidden', background: 'var(--sand-200)', border: 'none', padding: 0, cursor: 'zoom-in' }}
              >
                <Image src={secondUrl} alt={`${projectName} — image 2`} fill style={{ objectFit: 'cover', filter: 'saturate(0.88) contrast(0.96)' }} placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} />
              </button>
            )}
            {thirdUrl && (
              <button
                onClick={() => setLightboxIndex(2)}
                aria-label={`View ${projectName} image 3${totalExtra > 0 ? ` (+${totalExtra} more)` : ''}`}
                style={{ flex: 1, position: 'relative', borderRadius: '2px', overflow: 'hidden', background: 'var(--sand-200)', border: 'none', padding: 0, cursor: 'zoom-in' }}
              >
                <Image src={thirdUrl} alt={`${projectName} — image 3`} fill style={{ objectFit: 'cover', filter: 'saturate(0.88) contrast(0.96)' }} placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} />
                {totalExtra > 0 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(1,28,56,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600 }}>+{totalExtra} photos</span>
                  </div>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={close}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Counter */}
          <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            {lightboxIndex + 1} / {galleryUrls.length}
          </div>

          {/* Close */}
          <button
            onClick={close}
            aria-label="Close lightbox"
            style={{ position: 'absolute', top: 16, right: 20, color: '#fff', background: 'none', border: 'none', fontSize: '28px', lineHeight: 1, cursor: 'pointer', opacity: 0.7 }}
          >
            ×
          </button>

          {/* Prev */}
          {galleryUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              aria-label="Previous image"
              style={{ position: 'absolute', left: 16, color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', width: 'min(90vw, 1100px)', height: 'min(80vh, 720px)' }}
          >
            <Image
              src={galleryUrls[lightboxIndex]}
              alt={`${projectName} — image ${lightboxIndex + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              sizes="min(90vw, 1100px)"
              priority
            />
          </div>

          {/* Next */}
          {galleryUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              aria-label="Next image"
              style={{ position: 'absolute', right: 16, color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}
