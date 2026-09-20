import Image from 'next/image'

interface GalleryGridProps {
  galleryUrls: string[]
  galleryTypes: string[]
  projectName: string
}

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjY3NSI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0VCRTZERSIvPjwvc3ZnPg=='

export function GalleryGrid({ galleryUrls, galleryTypes, projectName }: GalleryGridProps) {
  if (galleryUrls.length === 0) return null

  const totalExtra = galleryUrls.length > 3 ? galleryUrls.length - 3 : 0
  const firstIsCGI = galleryTypes[0] === 'cgi' || galleryTypes[0] === 'render'

  const mainUrl = galleryUrls[0]
  const secondUrl = galleryUrls[1] ?? null
  const thirdUrl = galleryUrls[2] ?? null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '380px',
        gap: '16px',
      }}
    >
      {/* Large image */}
      <div
        style={{
          flex: 2,
          position: 'relative',
          borderRadius: '2px',
          overflow: 'hidden',
          background: 'var(--sand-200)',
        }}
      >
        <Image
          src={mainUrl}
          alt={`${projectName} — image 1`}
          fill
          style={{
            objectFit: 'cover',
            filter: 'saturate(0.88) contrast(0.96)',
          }}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
        {firstIsCGI && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(1,28,56,0.55)',
              padding: '3px 8px',
              borderRadius: '2px',
            }}
          >
            Developer render
          </div>
        )}
      </div>

      {/* Right stack */}
      {(secondUrl || thirdUrl) && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {secondUrl && (
            <div
              style={{
                flex: 1,
                position: 'relative',
                borderRadius: '2px',
                overflow: 'hidden',
                background: 'var(--sand-200)',
              }}
            >
              <Image
                src={secondUrl}
                alt={`${projectName} — image 2`}
                fill
                style={{
                  objectFit: 'cover',
                  filter: 'saturate(0.88) contrast(0.96)',
                }}
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            </div>
          )}
          {thirdUrl && (
            <div
              style={{
                flex: 1,
                position: 'relative',
                borderRadius: '2px',
                overflow: 'hidden',
                background: 'var(--sand-200)',
              }}
            >
              <Image
                src={thirdUrl}
                alt={`${projectName} — image 3`}
                fill
                style={{
                  objectFit: 'cover',
                  filter: 'saturate(0.88) contrast(0.96)',
                }}
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
              {totalExtra > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    background: 'rgba(1,28,56,0.72)',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '2px',
                  }}
                >
                  +{totalExtra} photos
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
