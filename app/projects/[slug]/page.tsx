import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatPriceFrom, parseVerdict } from '@/lib/format'
import type { BuyerQA } from '@/lib/types'
import FollowButton from './FollowButton'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('project_name, seo_title, seo_description, cover_image_url')
    .eq('slug', slug)
    .single()

  if (!data) return {}
  const row = data as Record<string, string | null>

  return {
    title: row.seo_title ?? row.project_name,
    description: row.seo_description ?? undefined,
    openGraph: {
      images: row.cover_image_url ? [row.cover_image_url] : [],
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: projectData } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  const { data: { user } } = await supabase.auth.getUser()

  if (!projectData) notFound()

  // Extract all fields as typed locals so JSX inference works correctly
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
  const hawookIntro = s('hawook_intro')
  const hawookTake = s('hawook_take')
  const designCommentary = s('design_commentary')
  const investmentCommentary = s('investment_commentary')
  const hawookVerdict = s('hawook_verdict')
  const locationDescription = s('location_description')
  const nearbyLandmarks = s('nearby_landmarks')
  const facilities = s('facilities')
  const developerTrackRecord = s('developer_track_record')
  const developerAwards = s('developer_awards')
  const foreignQuotaAvailable = b('foreign_quota_available')
  const camFee = num('cam_fee_thb_sqm')
  const sinkingFund = num('sinking_fund_thb_sqm')
  const priceMin = num('price_min')
  const unitTypes = s('unit_types')
  const unitSizes = s('unit_sizes')
  const handoverDate = s('handover_date')
  const ownershipType = s('ownership_type')
  const uniqueFeatures = raw['unique_features']
  const buyerQARaw = raw['buyer_qa']
  const marketComparisonRaw = raw['market_comparison']
  const unitPriceListRaw = raw['unit_price_list']
  const roiModelRaw = raw['roi_model']

  const verdict = parseVerdict(hawookVerdict)
  const allQA = Array.isArray(buyerQARaw) ? (buyerQARaw as BuyerQA[]) : []
  const publicQA = allQA.filter((q) => q.visibility === 'public')
  const privateQA = allQA.filter((q) => q.visibility === 'private')

  const quickFacts = [
    { label: 'Starting price', value: formatPriceFrom(priceMin) },
    { label: 'Unit types', value: unitTypes },
    { label: 'Unit sizes', value: unitSizes },
    { label: 'Handover', value: handoverDate },
    { label: 'Ownership', value: ownershipType },
  ].filter((f) => f.value)

  // Schema.org structured data
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: projectName,
    description: s('seo_description') ?? hawookIntro?.slice(0, 200),
    url: `https://app.hawook.com/projects/${slug}`,
    image: coverImageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: area,
      addressCountry: 'TH',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        {/* Header */}
        <div className="pt-10 pb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {area && (
              <span className="text-xs font-medium bg-teal-light text-teal px-3 py-1 rounded-full">
                {area}
              </span>
            )}
            {constructionStatus && (
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {constructionStatus}
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-gray-900 mb-2">
            {projectName}
          </h1>
          {developerName && (
            <p className="text-gray-500">by {developerName}</p>
          )}
        </div>

        {/* Cover image */}
        {coverImageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden mb-8 bg-gray-100">
            <Image
              src={coverImageUrl}
              alt={projectName}
              width={1200}
              height={675}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* Quick facts */}
        {quickFacts.length > 0 && (
          <div className="flex gap-6 overflow-x-auto pb-2 mb-10 border-y border-gray-100 py-4">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="shrink-0">
                <p className="text-xs text-gray-400 mb-0.5">{fact.label}</p>
                <p className="text-sm font-medium text-gray-900">{fact.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Hawook intro */}
        {hawookIntro && (
          <div className="mb-10">
            <div className="text-gray-700 leading-relaxed">
              {hawookIntro.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4 last:mb-0">{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Hawook Take */}
        {hawookTake && (
          <div className="mb-10 bg-cream rounded-lg p-6">
            <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-3">Hawook Take</p>
            <div className="text-gray-700 leading-relaxed">
              {hawookTake.split('\n\n').map((para, i) => (
                <p key={i} className="mb-3 last:mb-0">{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Design & Layout */}
        {designCommentary && (
          <div className="mb-10">
            <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Design &amp; Layout</h2>
            <div className="text-gray-700 leading-relaxed">
              {designCommentary.split('\n\n').map((para, i) => (
                <p key={i} className="mb-3 last:mb-0">{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {(locationDescription || nearbyLandmarks) && (
          <div className="mb-10">
            <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Location</h2>
            {locationDescription && (
              <p className="text-gray-700 leading-relaxed mb-4">{locationDescription}</p>
            )}
            {nearbyLandmarks && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Nearby</p>
                <ul className="space-y-1">
                  {nearbyLandmarks.split('\n').filter(Boolean).map((landmark, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-teal">—</span>
                      {landmark.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Facilities */}
        {facilities && (
          <div className="mb-10">
            <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Facilities</h2>
            <div className="flex flex-wrap gap-2">
              {facilities.split(/[,\n]/).filter(Boolean).map((item, i) => (
                <span key={i} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">
                  {item.trim()}
                </span>
              ))}
            </div>
            {Array.isArray(uniqueFeatures) && (uniqueFeatures as string[]).length > 0 && (
              <div className="mt-4 bg-teal-light rounded-lg p-4">
                <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">Standout features</p>
                <ul className="space-y-1">
                  {(uniqueFeatures as string[]).map((f, i) => (
                    <li key={i} className="text-sm text-teal-dark flex gap-2">
                      <span>✦</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Public Q&A */}
        {publicQA.length > 0 && (
          <div className="mb-10">
            <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Buyer Q&amp;A</h2>
            <div className="space-y-4">
              {publicQA.map((qa, i) => (
                <details key={i} className="border border-gray-100 rounded-lg">
                  <summary className="p-4 cursor-pointer text-sm font-medium text-gray-900 hover:text-teal transition-colors list-none flex justify-between items-center">
                    {qa.question}
                    <span className="text-gray-400 ml-2">+</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {qa.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Market comparison */}
        {Array.isArray(marketComparisonRaw) && (marketComparisonRaw as Record<string, unknown>[]).length > 0 && (
          <div className="mb-10">
            <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Market Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Project</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Area</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Entry price</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(marketComparisonRaw as Record<string, unknown>[]).map((row, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-medium text-gray-900">{String(row.project_name ?? row.name ?? '')}</td>
                      <td className="py-2 pr-4 text-gray-600">{String(row.area ?? '')}</td>
                      <td className="py-2 pr-4 text-gray-600">{String(row.entry_price ?? row.price ?? '')}</td>
                      <td className="py-2 text-gray-500">{String(row.notes ?? row.positioning_notes ?? '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hawook Verdict */}
        {verdict && (
          <div className="mb-10">
            <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Hawook Verdict</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {verdict.buyIf && (
                <div className="bg-teal-light rounded-lg p-4">
                  <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">Buy if</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{verdict.buyIf}</p>
                </div>
              )}
              {verdict.skipIf && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Skip if</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{verdict.skipIf}</p>
                </div>
              )}
              {verdict.watchFor && (
                <div className="border border-amber-100 bg-amber-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">Watch for</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{verdict.watchFor}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Developer */}
        {developerName && (
          <div className="mb-10 border-t border-gray-100 pt-8">
            <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">About {developerName}</h2>
            {developerTrackRecord && (
              <p className="text-gray-600 leading-relaxed mb-3">{developerTrackRecord}</p>
            )}
            {developerAwards && (
              <p className="text-sm text-gray-500 italic">{developerAwards}</p>
            )}
          </div>
        )}

        {/* Gated section */}
        {user ? (
          <GatedContent
            unitPriceList={unitPriceListRaw}
            roiModel={roiModelRaw}
            investmentCommentary={investmentCommentary}
            privateQA={privateQA}
            camFee={camFee}
            sinkingFund={sinkingFund}
            foreignQuotaAvailable={foreignQuotaAvailable}
          />
        ) : (
          <div className="mb-10 border border-gray-200 rounded-xl p-8 bg-cream">
            <h3 className="font-serif text-xl font-medium text-gray-900 mb-3">Sign up free to unlock</h3>
            <ul className="space-y-2 mb-6">
              {['Full price list by unit', 'ROI model with real numbers', 'Floorplans', 'Price per sqm analysis', 'Private buyer Q&A'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-teal">✓</span> {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-teal text-white font-medium px-6 py-3 rounded-md hover:bg-teal-dark transition-colors"
              >
                Sign up free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        )}

        {/* Contact section */}
        <div className="border-t border-gray-100 pt-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/66000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp us
            </a>
            <a
              href="https://tally.so/r/RGJy9J"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-md hover:border-gray-400 transition-colors"
            >
              Take our buyer quiz
            </a>
            {user && <FollowButton userId={user.id} projectId={id} />}
          </div>
        </div>
      </article>
    </>
  )
}

function GatedContent({ unitPriceList: upl, roiModel: rm, investmentCommentary, privateQA, camFee, sinkingFund, foreignQuotaAvailable }: {
  unitPriceList: unknown
  roiModel: unknown
  investmentCommentary: string | null
  privateQA: BuyerQA[]
  camFee: number | null
  sinkingFund: number | null
  foreignQuotaAvailable: boolean | null
}) {
  const unitPriceList = Array.isArray(upl) ? (upl as Record<string, unknown>[]) : null
  const roiModel = Array.isArray(rm) ? (rm as Record<string, unknown>[]) : null

  return (
    <div className="mb-10 space-y-10">
      {/* Unit price list */}
      {unitPriceList && unitPriceList.length > 0 && (
        <div>
          <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Full Price List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Unit type', 'Size', 'Floor', 'View', 'Price', '฿/sqm', 'Status'].map((h) => (
                    <th key={h} className="text-left py-2 pr-4 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unitPriceList.map((unit, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-900">{String(unit.unit_type ?? unit.type ?? '')}</td>
                    <td className="py-2 pr-4 text-gray-600">{String(unit.size ?? unit.sqm ?? '')}</td>
                    <td className="py-2 pr-4 text-gray-600">{String(unit.floor ?? '')}</td>
                    <td className="py-2 pr-4 text-gray-600">{String(unit.view ?? '')}</td>
                    <td className="py-2 pr-4 text-gray-900 font-medium">{String(unit.price ?? '')}</td>
                    <td className="py-2 pr-4 text-gray-600">{String(unit.price_per_sqm ?? unit.psm ?? '')}</td>
                    <td className="py-2 text-gray-500">{String(unit.availability ?? unit.status ?? '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROI model */}
      {roiModel && roiModel.length > 0 && (
        <div>
          <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">ROI Model</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roiModel.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-5">
                <p className="font-medium text-gray-900 mb-3">{String(item.unit_type ?? item.type ?? `Unit ${i + 1}`)}</p>
                <dl className="space-y-1.5 text-sm">
                  {[
                    ['Purchase price', item.purchase_price ?? item.price],
                    ['Gross yield', item.gross_yield],
                    ['Net yield', item.net_yield],
                    ['Annual net income', item.annual_net_income ?? item.net_income],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between gap-4">
                      <dt className="text-gray-500">{String(label)}</dt>
                      <dd className="font-medium text-gray-900">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
                {item.assumptions != null && (
                  <p className="mt-3 text-xs text-gray-400 italic">{String(item.assumptions)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investment commentary */}
      {investmentCommentary && (
        <div>
          <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Investment Commentary</h2>
          <div className="text-gray-700 leading-relaxed">
            {investmentCommentary.split('\n\n').map((para, i) => (
              <p key={i} className="mb-3 last:mb-0">{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* Private Q&A */}
      {privateQA.length > 0 && (
        <div>
          <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Private Buyer Q&amp;A</h2>
          <div className="space-y-4">
            {privateQA.map((qa, i) => (
              <details key={i} className="border border-gray-100 rounded-lg">
                <summary className="p-4 cursor-pointer text-sm font-medium text-gray-900 hover:text-teal transition-colors list-none flex justify-between items-center">
                  {qa.question}
                  <span className="text-gray-400 ml-2">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {qa.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* CAM & sinking fund */}
      {(camFee || sinkingFund) && (
        <div>
          <h2 className="font-serif text-xl font-medium text-gray-900 mb-4">Ownership Costs</h2>
          <div className="flex gap-6 flex-wrap">
            {camFee && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">CAM fee</p>
                <p className="font-medium text-gray-900">฿{camFee}/sqm/month</p>
              </div>
            )}
            {sinkingFund && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Sinking fund (one-time)</p>
                <p className="font-medium text-gray-900">฿{sinkingFund}/sqm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Foreign quota */}
      {foreignQuotaAvailable !== null && (
        <div>
          <h2 className="font-serif text-xl font-medium text-gray-900 mb-2">Foreign Quota</h2>
          <p className="text-sm text-gray-600">
            {foreignQuotaAvailable ? '✓ Foreign freehold quota available' : '✗ No foreign freehold quota — leasehold or Thai quota only'}
          </p>
        </div>
      )}
    </div>
  )
}
