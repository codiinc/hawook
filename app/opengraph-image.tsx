import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Hawook — Curated off-plan property in Phuket'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0d7c74',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
        }}
      >
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 96,
            fontWeight: 700,
            color: '#f5f0e8',
            letterSpacing: '-2px',
            marginBottom: 24,
          }}
        >
          Hawook
        </div>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 32,
            color: 'rgba(245,240,232,0.8)',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Curated off-plan property in Phuket
        </div>
      </div>
    ),
    size,
  )
}
