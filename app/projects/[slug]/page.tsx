import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { parseVerdict } from '@/lib/format'
import type { BuyerQA } from '@/lib/types'
import FollowButton from './FollowButton'
import GatedContentTracker from './GatedContentTracker'
import { SectionHeader } from '@/components/ds/SectionHeader'
import { ScoreBreakdown, SCORE_DIMENSIONS } from '@/components/ds/ScoreBreakdown'
import { ProjectHero } from '@/components/ds/ProjectHero'
import { SpecsStrip } from '@/components/ds/SpecsStrip'
import { GalleryGrid } from '@/components/ds/GalleryGrid'
import { LocationSection } from '@/components/ds/LocationSection'
import { GateBand } from '@/components/ds/GateBand'
import { VerdictCards } from '@/components/ds/VerdictCards'
import { MarketCompGrid } from '@/components/ds/MarketCompGrid'
import { YieldCalc } from '@/components/ds/YieldCalc'
import { BuyerQualForm } from '@/components/ds/BuyerQualForm'

const DOC_TYPE_LABELS: Record<string, string> = {
  sales_presentation: 'Sales presentation',
  brochure: 'Brochure',
  price_list: 'Price list',
  payment_plan: 'Payment plan',
  foreign_quota_letter: 'Foreign quota letter',
  floor_plan_set: 'Floor plan set',
  spa_template: 'SPA template',
  other: 'Other',
}

type Props = { params: Promise<{ slug: string }> }

function formatPriceTHB(amount: number | null): string {
  if (!amount) return 'Price on request'
  return 'THB ' + amount.toLocaleString('en-US')
}

function findBeachDistance(landmarks: string | null): string | null {
  if (!landmarks) return null
  const line = landmarks.split('\n').find((l) => l.toLowerCase().includes('beach'))
  if (!line) return null
  const colonIdx = line.lastIndexOf(':')
  if (colonIdx > 0) return line.slice(colonIdx + 1).trim()
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects_public')
    .select('project_name, seo_title, seo_description, cover_image_url')
    .eq('slug', slug)
    .single()

  if (!data) return {}
  const row = data as Record<string, string | null>

  const pageTitle = row.project_name ?? undefined
  const ogTitle = row.project_name ? `${row.project_name} | Hawook` : undefined
  const description = row.seo_description ?? undefined

  return {
    title: pageTitle,
    description,
    alternates: { canonical: `https://app.hawook.com/projects/${slug}` },
    openGraph: {
      title: ogTitle,
      description,
      url: `https://app.hawook.com/projects/${slug}`,
      siteName: 'Hawook',
      images: row.cover_image_url
        ? [{ url: row.cover_image_url.replace('/upload/', '/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/'), width: 1200, height: 630 }]
        : [],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: row.cover_image_url
        ? [row.cover_image_url.replace('/upload/', '/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/')]
        : [],
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: projectData } = await supabase
    .from('projects_public')
    .select(`
      id, project_name, developer_name, location, area,
      price_min, price_max, unit_sizes, unit_types,
      handover_date, payment_plan, rental_yield_claim,
      foreign_quota_available, ownership_type, target_buyer_type,
      nearby_landmarks, status, slug,
      total_units, floors, buildings, construction_status,
      rental_program_available, foreign_quota_units_remaining,
      facilities, developer_track_record, developer_awards,
      cover_image_url, cover_image_type, gallery_urls, gallery_types,
      video_urls, google_maps_url, virtual_tour_url,
      description_public, buyer_qa, market_comparison,
      unique_features,
      furniture_included, furniture_notes, management_company,
      seo_title, seo_description, seo_focus_keyword, seo_keywords,
      hawook_intro, hawook_take, design_commentary,
      hawook_verdict, hawook_badge, hawook_score,
      page_status, published_at, last_updated, created_at, location_description
    `)
    .eq('slug', slug)
    .single()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!projectData) notFound()

  const raw = projectData as Record<string, unknown>
  const s = (k: string): string | null => {
    const v = raw[k]
    return typeof v === 'string' ? v : null
  }
  const b = (k: string): boolean | null => {
    const v = raw[k]
    return typeof v === 'boolean' ? v : null
  }
  const num = (k: string): number | null => {
    const v = raw[k]
    return typeof v === 'number' ? v : null
  }

  const id = s('id') ?? ''
  const projectName = s('project_name') ?? ''
  const area = s('area')
  const developerName = s('developer_name')
  const constructionStatus = s('construction_status')
  const coverImageUrl = s('cover_image_url')
  const coverImageType = s('cover_image_type')
  const galleryUrlsRaw = raw['gallery_urls']
  const galleryTypesRaw = raw['gallery_types']
  const hawookIntro = s('hawook_intro')
  const hawookTakeText = s('hawook_take')
  const hawookScore = num('hawook_score')
  const hawookVerdict = s('hawook_verdict')
  const locationDescription = s('location_description')
  const nearbyLandmarks = s('nearby_landmarks')
  const googleMapsUrl = s('google_maps_url')
  const priceMin = num('price_min')
  const unitTypes = s('unit_types')
  const handoverDate = s('handover_date')
  const ownershipType = s('ownership_type')
  const totalUnits = num('total_units')
  const buyerQARaw = raw['buyer_qa']
  const marketComparisonRaw = raw['market_comparison']
  const foreignQuotaAvailable = b('foreign_quota_available')

  const verdict = parseVerdict(hawookVerdict)
  const allQA = Array.isArray(buyerQARaw) ? (buyerQARaw as BuyerQA[]) : []
  const publicQA = allQA.filter((q) => q.visibility === 'public')

  const galleryUrls = Array.isArray(galleryUrlsRaw) ? (galleryUrlsRaw as string[]) : []
  const galleryTypes = Array.isArray(galleryTypesRaw) ? (galleryTypesRaw as string[]) : []

  const { data: projectDocuments } = await supabase
    .from('project_documents')
    .select('id, document_type, cloudinary_url, filename, is_gated')
    .eq('project_id', id)
    .order('document_type', { ascending: true })
  const docList = (projectDocuments ?? []) as Record<string, unknown>[]

  let roiModelRaw: unknown = null
  let unitPriceListRaw: unknown = null
  let investmentCommentary: string | null = null
  let camFee: number | null = null
  let sinkingFund: number | null = null
  let privateQA: BuyerQA[] = []
  if (user) {
    const { data: gated } = await supabase
      .from('projects')
      .select('roi_model, unit_price_list, investment_commentary, cam_fee_thb_sqm, sinking_fund_thb_sqm, buyer_qa')
      .eq('slug', slug)
      .single()
    if (gated) {
      const g = gated as Record<string, unknown>
      roiModelRaw = g.roi_model ?? null
      unitPriceListRaw = g.unit_price_list ?? null
      investmentCommentary = typeof g.investment_commentary === 'string' ? g.investment_commentary : null
      camFee = typeof g.cam_fee_thb_sqm === 'number' ? g.cam_fee_thb_sqm : null
      sinkingFund = typeof g.sinking_fund_thb_sqm === 'number' ? g.sinking_fund_thb_sqm : null
      const fullQA = Array.isArray(g.buyer_qa) ? (g.buyer_qa as BuyerQA[]) : []
      privateQA = fullQA.filter((q) => q.visibility === 'private')
    }
  }

  // Specs strip
  const beachDistance = findBeachDistance(nearbyLandmarks)
  const specsItems = [
    ownershipType && { label: 'Type', value: ownershipType },
    constructionStatus && { label: 'Status', value: constructionStatus },
    handoverDate && { label: 'Handover', value: handoverDate },
    totalUnits != null && { label: 'Units', value: String(totalUnits) },
    priceMin != null && { label: 'Price from', value: formatPriceTHB(priceMin) },
    beachDistance
      ? { label: 'Beach distance', value: beachDistance }
      : area
        ? { label: 'Area', value: area }
        : null,
  ].filter((x): x is { label: string; value: string } => Boolean(x))

  // Market comparison grid data
  const marketComps = Array.isArray(marketComparisonRaw)
    ? (marketComparisonRaw as Record<string, unknown>[]).map((row) => ({
        name: String(row.project_name ?? row.name ?? ''),
        developer: row.developer ? String(row.developer) : undefined,
        area: row.area ? String(row.area) : undefined,
        score: typeof row.score === 'number' ? row.score : undefined,
        priceFrom: row.entry_price ? String(row.entry_price) : row.price ? String(row.price) : undefined,
        sizeRange: row.size_range ? String(row.size_range) : undefined,
        units: typeof row.units === 'number' ? row.units : undefined,
        tenure: row.tenure ? String(row.tenure) : undefined,
        pricePerSqm: row.price_per_sqm ? String(row.price_per_sqm) : undefined,
        notes: row.notes ? String(row.notes) : row.positioning_notes ? String(row.positioning_notes) : undefined,
      }))
    : []

  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: projectName,
    description: s('seo_description') ?? hawookIntro?.slice(0, 200),
    url: `https://app.hawook.com/projects/${slug}`,
    image: coverImageUrl,
    address: { '@type': 'PostalAddress', addressLocality: area, addressCountry: 'TH' },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://app.hawook.com' },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://app.hawook.com/projects' },
      {
        '@type': 'ListItem',
        position: 3,
        name: projectName,
        item: `https://app.hawook.com/projects/${slug}`,
      },
    ],
  }

  const faqSchema =
    publicQA.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: publicQA.map((qa) => ({
            '@type': 'Question',
            name: qa.question,
            acceptedAnswer: { '@type': 'Answer', text: qa.answer },
          })),
        }
      : null

  const waMsg = encodeURIComponent(`Hi, I'd like to know more about ${projectName}.`)

  const container = {
    maxWidth: 'var(--container)',
    margin: '0 auto',
    padding: '0 var(--gutter-lg)',
  } as const

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* 1. Hero — full-bleed */}
      <ProjectHero
        coverImageUrl={coverImageUrl}
        coverImageType={coverImageType}
        projectName={projectName}
        developerName={developerName}
        area={area}
        handoverDate={handoverDate}
        hawookScore={hawookScore}
      />

      {/* 2. Specs strip — full-bleed */}
      <SpecsStrip items={specsItems} />

      {/* Container wrapper for interior sections */}
      <div style={container}>

        {/* 3. Score section */}
        {hawookScore != null && (
          <section style={{ padding: 'var(--space-10) 0', borderBottom: '1px solid var(--rule)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Big score */}
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '72px',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--navy-900)',
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: '8px',
                  }}
                  className="hw-num"
                >
                  {hawookScore.toFixed(1)}
                </div>
                {hawookScore >= 9.0 && (
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'var(--brass-600)',
                      color: '#fff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '2px',
                    }}
                  >
                    Top pick
                  </span>
                )}
                {hawookScore >= 8.0 && hawookScore < 9.0 && (
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'var(--navy-900)',
                      color: '#fff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '2px',
                    }}
                  >
                    Recommended
                  </span>
                )}
              </div>

              {/* Dimension breakdown */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <ScoreBreakdown dimensions={SCORE_DIMENSIONS} locked={!user} columns={2} />
                {!user && (
                  <p
                    style={{
                      marginTop: 'var(--space-6)',
                      paddingLeft: 'var(--space-5)',
                      borderLeft: '3px solid var(--rule-brand)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Link
                      href="/login"
                      style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-brand)', textDecoration: 'none' }}
                    >
                      Sign in
                    </Link>{' '}
                    to see the full scoring breakdown. It&apos;s free, and nothing here is behind a payment.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 4. Editorial section */}
        {(hawookIntro || hawookTakeText || verdict) && (
          <section style={{ padding: 'var(--space-10) 0', borderBottom: '1px solid var(--rule)' }}>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                color: 'var(--ink-400)',
                marginBottom: '16px',
              }}
            >
              Hawook&apos;s take
            </div>

            {(hawookIntro || hawookTakeText) && (
              <div style={{ maxWidth: 'var(--measure-prose)', marginBottom: '40px' }}>
                {hawookIntro &&
                  hawookIntro.split('\n\n').map((para, i) => (
                    <p
                      key={i}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--text-lead)',
                        lineHeight: 'var(--lh-editorial)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-6)',
                      }}
                    >
                      {para}
                    </p>
                  ))}
                {hawookTakeText &&
                  hawookTakeText.split('\n\n').map((para, i) => (
                    <p
                      key={i}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--text-body-lg)',
                        lineHeight: 'var(--lh-editorial)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-5)',
                      }}
                    >
                      {para}
                    </p>
                  ))}
              </div>
            )}

            {verdict && (verdict.buyIf || verdict.skipIf || verdict.watchFor) && (
              <VerdictCards
                buyIf={verdict.buyIf || null}
                skipIf={verdict.skipIf || null}
                watchFor={verdict.watchFor || null}
              />
            )}
          </section>
        )}

        {/* 5. Gallery + Location */}
        {(galleryUrls.length > 0 || locationDescription || nearbyLandmarks) && (
          <section style={{ padding: 'var(--space-10) 0', borderBottom: '1px solid var(--rule)' }}>
            {galleryUrls.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <GalleryGrid
                  galleryUrls={galleryUrls}
                  galleryTypes={galleryTypes}
                  projectName={projectName}
                />
              </div>
            )}
            {(locationDescription || nearbyLandmarks) && (
              <LocationSection
                locationDescription={locationDescription}
                nearbyLandmarks={nearbyLandmarks}
                googleMapsUrl={googleMapsUrl}
              />
            )}
          </section>
        )}

        {/* 6. Q&A */}
        {publicQA.length > 0 && (
          <section style={{ padding: 'var(--space-10) 0', borderBottom: '1px solid var(--rule)' }}>
            <SectionHeader title="Common questions" />
            <div style={{ display: 'grid', gap: 0, maxWidth: 'var(--measure-prose)' }}>
              {publicQA.map((qa, i) => (
                <details key={i} style={{ borderBottom: '1px solid var(--rule)' }}>
                  <summary
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      padding: 'var(--space-5) 0',
                      cursor: 'pointer',
                      listStyle: 'none',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--fw-semibold)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {qa.question}
                    <span
                      aria-hidden="true"
                      style={{ color: 'var(--text-tertiary)', flexShrink: 0, fontWeight: 'var(--fw-regular)' }}
                    >
                      +
                    </span>
                  </summary>
                  <div
                    style={{
                      paddingBottom: 'var(--space-5)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--lh-editorial)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {qa.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* 7. Gate band — full-bleed, logged-out only */}
      {!user && <GateBand />}

      {/* Container for member-only sections */}
      <div style={container}>

        {/* 8. Market comparison — members only */}
        {user && marketComps.length > 0 && (
          <section style={{ padding: 'var(--space-10) 0', borderBottom: '1px solid var(--rule)' }}>
            <MarketCompGrid comps={marketComps} />
          </section>
        )}

        {/* 9. Yield calculator — members only */}
        {user && (
          <section style={{ padding: 'var(--space-10) 0', borderBottom: '1px solid var(--rule)' }}>
            <YieldCalc unitTypes={unitTypes} priceMin={priceMin} />
          </section>
        )}

        {/* Member gated content (price list, ROI model, etc.) */}
        {user && (
          <>
            <GatedContentTracker projectSlug={slug} />
            <GatedContent
              unitPriceList={unitPriceListRaw}
              roiModel={roiModelRaw}
              investmentCommentary={investmentCommentary}
              privateQA={privateQA}
              camFee={camFee}
              sinkingFund={sinkingFund}
              foreignQuotaAvailable={foreignQuotaAvailable}
            />
          </>
        )}

        {/* Documents */}
        {docList.length > 0 && (
          <section style={{ padding: 'var(--space-8) 0', borderBottom: '1px solid var(--rule)' }}>
            <SectionHeader title="Downloads" />
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-1)' }}>
              {docList.map((doc) => {
                const label = DOC_TYPE_LABELS[doc.document_type as string] ?? String(doc.document_type)
                const isGated = doc.is_gated as boolean
                return (
                  <li
                    key={doc.id as string}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-5)',
                      padding: 'var(--space-5) 0',
                      borderBottom: '1px solid var(--rule)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--fw-semibold)',
                          color: 'var(--text-primary)',
                          margin: 0,
                        }}
                      >
                        {(doc.filename as string) ?? label}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-tertiary)',
                          margin: 0,
                          marginTop: 'var(--space-1)',
                        }}
                      >
                        {label}
                      </p>
                    </div>
                    {isGated && !user ? (
                      <Link
                        href="/login"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-brand)',
                          textDecoration: 'underline',
                          flexShrink: 0,
                        }}
                      >
                        Sign in to download
                      </Link>
                    ) : (
                      <a
                        href={doc.cloudinary_url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-brand)',
                          textDecoration: 'underline',
                          flexShrink: 0,
                        }}
                      >
                        Download
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* 10. Gate 2 / Buyer form — members only */}
        {user && (
          <section style={{ padding: 'var(--space-10) 0', borderBottom: '1px solid var(--rule)' }}>
            <BuyerQualForm
              projectSlug={slug}
              projectName={projectName}
              initialEmail={user?.email}
            />
          </section>
        )}

        {/* WhatsApp CTA + Follow */}
        <div style={{ padding: 'var(--space-8) 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <a
              href={`https://wa.me/66805100129?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                background: 'var(--action-primary)',
                color: 'var(--text-on-inverse)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--fw-semibold)',
                padding: 'var(--space-4) var(--space-6)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp us
            </a>
            {user && <FollowButton userId={user.id} projectId={id} />}
          </div>
        </div>

      </div>
    </>
  )
}

function GatedContent({
  unitPriceList: upl,
  roiModel: rm,
  investmentCommentary,
  privateQA,
  camFee,
  sinkingFund,
  foreignQuotaAvailable,
}: {
  unitPriceList: unknown
  roiModel: unknown
  investmentCommentary: string | null
  privateQA: BuyerQA[]
  camFee: number | null
  sinkingFund: number | null
  foreignQuotaAvailable: boolean | null
}) {
  const unitPriceList = Array.isArray(upl) ? (upl as Record<string, unknown>[]) : null
  const roiModelRaw = Array.isArray(rm) ? (rm as Record<string, unknown>[]) : null
  const roiModel =
    roiModelRaw?.filter((item) =>
      [item.purchase_price, item.price, item.gross_yield, item.net_yield, item.annual_net_income, item.net_income].some(
        (v) => v != null && v !== '',
      ),
    ) ?? null

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
      {/* Unit price list */}
      {unitPriceList && unitPriceList.length > 0 && (
        <section>
          <SectionHeader title="Full price list" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontFamily: 'var(--font-sans)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--rule-strong)' }}>
                  {['Unit type', 'Size', 'Floor', 'View', 'Price', '฿/sqm', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: 'var(--space-3) var(--space-5) var(--space-3) 0',
                        fontSize: 'var(--text-label)',
                        fontWeight: 'var(--fw-semibold)',
                        letterSpacing: 'var(--tracking-label)',
                        textTransform: 'uppercase',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unitPriceList.map((unit, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--rule)' }}>
                    <td style={{ padding: 'var(--space-4) var(--space-5) var(--space-4) 0', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>
                      {String(unit.unit_type ?? unit.type ?? '')}
                    </td>
                    <td className="hw-num" style={{ padding: 'var(--space-4) var(--space-5) var(--space-4) 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {String(unit.size ?? unit.sqm ?? '')}
                    </td>
                    <td className="hw-num" style={{ padding: 'var(--space-4) var(--space-5) var(--space-4) 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {String(unit.floor ?? '')}
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-5) var(--space-4) 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {String(unit.view ?? '')}
                    </td>
                    <td className="hw-num" style={{ padding: 'var(--space-4) var(--space-5) var(--space-4) 0', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>
                      {String(unit.price ?? '')}
                    </td>
                    <td className="hw-num" style={{ padding: 'var(--space-4) var(--space-5) var(--space-4) 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {String(unit.price_per_sqm ?? unit.psm ?? '')}
                    </td>
                    <td style={{ padding: 'var(--space-4) 0', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                      {String(unit.availability ?? unit.status ?? '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ROI model */}
      {roiModel && roiModel.length > 0 && (
        <section>
          <SectionHeader
            title="ROI model"
            note="Based on developer-stated occupancy rates. Hawook has not independently verified these projections."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
            {roiModel.map((item, i) => (
              <div key={i} style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-6)' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)', margin: '0 0 var(--space-5)' }}>
                  {String(item.unit_type ?? item.type ?? `Unit ${i + 1}`)}
                </p>
                <dl style={{ display: 'grid', gap: 'var(--space-3)' }}>
                  {[
                    ['Purchase price', item.purchase_price ?? item.price],
                    ['Gross yield', item.gross_yield],
                    ['Net yield', item.net_yield],
                    ['Annual net income', item.annual_net_income ?? item.net_income],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                        <dt style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          {String(label)}
                        </dt>
                        <dd className="hw-num" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)', margin: 0 }}>
                          {String(value)}
                        </dd>
                      </div>
                    ))}
                </dl>
                {item.assumptions != null && (
                  <p style={{ marginTop: 'var(--space-4)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    {String(item.assumptions)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Investment commentary */}
      {investmentCommentary && (
        <section>
          <SectionHeader title="Investment commentary" />
          <div style={{ maxWidth: 'var(--measure-prose)' }}>
            {investmentCommentary.split('\n\n').map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-body-lg)',
                  lineHeight: 'var(--lh-editorial)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Private Q&A */}
      {privateQA.length > 0 && (
        <section>
          <SectionHeader title="Private buyer Q&A" />
          <div style={{ display: 'grid', gap: 'var(--space-1)', maxWidth: 'var(--measure-prose)' }}>
            {privateQA.map((qa, i) => (
              <details key={i} style={{ borderBottom: '1px solid var(--rule)' }}>
                <summary
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-5) 0',
                    cursor: 'pointer',
                    listStyle: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--fw-semibold)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {qa.question}
                  <span
                    aria-hidden="true"
                    style={{ color: 'var(--text-tertiary)', flexShrink: 0, fontWeight: 'var(--fw-regular)' }}
                  >
                    +
                  </span>
                </summary>
                <div
                  style={{
                    paddingBottom: 'var(--space-5)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--lh-editorial)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {qa.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* CAM & sinking fund */}
      {(camFee || sinkingFund) && (
        <section>
          <SectionHeader title="Ownership costs" />
          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            {camFee && (
              <div>
                <div className="hw-label" style={{ marginBottom: 'var(--space-2)' }}>
                  CAM fee
                </div>
                <p className="hw-num" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)', margin: 0 }}>
                  THB {camFee}/sqm/month
                </p>
              </div>
            )}
            {sinkingFund && (
              <div>
                <div className="hw-label" style={{ marginBottom: 'var(--space-2)' }}>
                  Sinking fund (one-time)
                </div>
                <p className="hw-num" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)', margin: 0 }}>
                  THB {sinkingFund}/sqm
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Foreign quota */}
      {foreignQuotaAvailable !== null && (
        <section>
          <SectionHeader title="Foreign quota" />
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', color: 'var(--text-secondary)', margin: 0 }}>
            {foreignQuotaAvailable
              ? 'Foreign freehold quota available on this project.'
              : 'No foreign freehold quota available — leasehold or Thai quota only.'}
          </p>
        </section>
      )}
    </div>
  )
}
