interface EmbeddedMapProps {
  lat: number
  lon: number
  zoom?: number
  height?: number
  label?: string
}

function buildOSMSrc(lat: number, lon: number, zoom: number): string {
  const delta = 0.006 * Math.pow(2, 15 - zoom)
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
}

export function EmbeddedMap({ lat, lon, zoom = 15, height = 320, label = 'Location map' }: EmbeddedMapProps) {
  return (
    <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--sand-200)' }}>
      <iframe
        src={buildOSMSrc(lat, lon, zoom)}
        width="100%"
        height={height}
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        title={label}
        sandbox="allow-scripts allow-same-origin"
      />
      <div style={{ padding: '6px 12px', background: 'var(--bg-surface)', borderTop: '1px solid var(--rule)' }}>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-tertiary)', textDecoration: 'none' }}
        >
          View larger map ↗
        </a>
      </div>
    </div>
  )
}

/** Parse lat,lon from a Google Maps share URL if available */
export function parseLatLon(url: string | null): { lat: number; lon: number } | null {
  if (!url) return null
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) }
  const q = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (q) return { lat: parseFloat(q[1]), lon: parseFloat(q[2]) }
  return null
}
