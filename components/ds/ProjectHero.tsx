import Image from 'next/image'

interface ProjectHeroProps {
  coverImageUrl: string | null
  coverImageType: string | null
  projectName: string
  developerName: string | null
  area: string | null
  handoverDate: string | null
  hawookScore: number | null
}

export function ProjectHero({
  coverImageUrl,
  coverImageType,
  projectName,
  developerName,
  area,
  handoverDate,
  hawookScore,
}: ProjectHeroProps) {
  const isCGI = coverImageType === 'cgi' || coverImageType === 'render'
  const isTopPick = hawookScore != null && hawookScore >= 9.0
  const isRecommended = hawookScore != null && hawookScore >= 8.0 && hawookScore < 9.0
  const showBadge = isTopPick || isRecommended

  const subLineParts = [developerName, area, handoverDate].filter(Boolean)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '520px',
        overflow: 'hidden',
        background: coverImageUrl
          ? '#012C57'
          : 'linear-gradient(135deg, #012c57 0%, #0a3a68 40%, #1b4c7a 100%)',
      }}
    >
      {coverImageUrl && (
        <Image
          src={coverImageUrl}
          alt={projectName}
          fill
          priority
          style={{
            objectFit: 'cover',
            objectPosition: 'center 40%',
            filter: 'saturate(0.88) contrast(0.96)',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(1,28,56,0.9) 0%, rgba(1,28,56,0.3) 60%, rgba(1,28,56,0.1) 100%)',
        }}
        aria-hidden="true"
      />

      {isCGI && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 24,
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Developer render
        </div>
      )}

      {showBadge && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 24,
            background: isTopPick ? 'var(--brass-600)' : 'var(--navy-900)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '2px',
            padding: '4px 10px',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.09em',
            textTransform: 'uppercase' as const,
            color: '#fff',
          }}
        >
          {isTopPick ? 'Top pick' : 'Recommended'}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '40px var(--gutter-lg)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
            color: '#fff',
            margin: '0 0 10px',
          }}
        >
          {projectName}
        </h1>
        {subLineParts.length > 0 && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
            }}
          >
            {subLineParts.join(' · ')}
          </p>
        )}
      </div>
    </div>
  )
}
