import { EmbeddedMap, parseLatLon } from '@/components/EmbeddedMap'

interface LocationSectionProps {
  locationDescription: string | null
  nearbyLandmarks: string | null
  googleMapsUrl: string | null
}

interface LandmarkRow {
  name: string
  distance: string | null
}

function parseLandmarks(raw: string): LandmarkRow[] {
  // Support both newline-separated (legacy "Name: distance") and
  // semicolon-separated ("Name 400m / 5 min walk; Name2 1.4km") formats
  const lines = raw.includes(';')
    ? raw.split(';').map((s) => s.trim()).filter(Boolean)
    : raw.split('\n').filter(Boolean)

  return lines.map((line) => {
    // Try colon format first: "Rawai Beach: 400m"
    const colonIdx = line.lastIndexOf(':')
    if (colonIdx > 0 && colonIdx < line.length - 1 && !line.slice(colonIdx + 1).includes('//')) {
      return { name: line.slice(0, colonIdx).trim(), distance: line.slice(colonIdx + 1).trim() }
    }
    // Try distance-suffix format: "Rawai Beach 400m / 5 min walk" or "Yanui Beach 1.4km"
    const distMatch = line.match(/^(.*?)\s+(\d[\d.,]*(m|km)\b.*)$/i)
    if (distMatch) {
      return { name: distMatch[1].trim(), distance: distMatch[2].trim() }
    }
    return { name: line.trim(), distance: null }
  })
}

export function LocationSection({
  locationDescription,
  nearbyLandmarks,
  googleMapsUrl,
}: LocationSectionProps) {
  const landmarks = nearbyLandmarks ? parseLandmarks(nearbyLandmarks) : []
  const coords = parseLatLon(googleMapsUrl)

  return (
    <section>
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.09em',
            textTransform: 'uppercase' as const,
            color: 'var(--ink-400)',
            marginBottom: '8px',
          }}
        >
          Location
        </div>
        {locationDescription && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--lh-editorial)',
              color: 'var(--text-primary)',
              maxWidth: 'var(--measure-prose)',
              margin: 0,
            }}
          >
            {locationDescription}
          </p>
        )}
      </div>

      {landmarks.length > 0 && (
        <div
          className="location-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '48px',
            alignItems: 'start',
          }}
        >
          {/* Map */}
          <div>
            {coords ? (
              <EmbeddedMap lat={coords.lat} lon={coords.lon} height={340} label="Project location map" />
            ) : (
              <div style={{ height: 340, borderRadius: 'var(--radius-sm)', background: 'var(--sand-200)', border: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink-400)' }}>Map coming soon</span>
                {googleMapsUrl && (
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--action-primary)', textDecoration: 'none' }}>
                    View on Google Maps ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Distances table */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.09em',
                textTransform: 'uppercase' as const,
                color: 'var(--ink-400)',
                marginBottom: '16px',
              }}
            >
              Nearby
            </div>
            <div style={{ display: 'grid', gap: '0' }}>
              {landmarks.map((lm, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '16px',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--sand-300)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      color: 'var(--ink-900)',
                    }}
                  >
                    {lm.name}
                  </span>
                  {lm.distance && (
                    <span
                      className="hw-num"
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        color: 'var(--ink-500)',
                        fontVariantNumeric: 'tabular-nums',
                        flexShrink: 0,
                      }}
                    >
                      {lm.distance}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
