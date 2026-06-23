import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Phuket Property Areas | Hawook',
  description: 'Where to look in Phuket — Hawook\'s curated coverage of Rawai & Nai Harn and Bang Tao.',
  alternates: { canonical: 'https://app.hawook.com/areas' },
  openGraph: {
    title: 'Phuket Property Areas | Hawook',
    description: 'Where to look in Phuket — Hawook\'s curated coverage of Rawai & Nai Harn and Bang Tao.',
    url: 'https://app.hawook.com/areas',
  },
}

const waHref = 'https://wa.me/66805100129?text=Hi%2C%20I\'m%20trying%20to%20figure%20out%20which%20Phuket%20area%20suits%20me%20best%20%E2%80%94%20could%20you%20help%3F'

export default async function AreasPage() {
  const supabase = await createClient()

  const [{ count: rawaiCount }, { count: bangTaoCount }] = await Promise.all([
    supabase
      .from('projects_public')
      .select('*', { count: 'exact', head: true })
      .in('area', ['Rawai', 'Nai Harn']),
    supabase
      .from('projects_public')
      .select('*', { count: 'exact', head: true })
      .eq('area', 'Bang Tao'),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Intro */}
      <div className="max-w-2xl mb-16">
        <h1 className="font-serif text-4xl font-medium text-gray-900 mb-4">Where to look in Phuket</h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          Phuket is a big island. Buyers who arrive expecting one &ldquo;Phuket&rdquo; market quickly discover there are really several — each with its own character, buyer profile, pricing logic, and lifestyle implications. The areas we cover are the ones where international freehold property activity is concentrated, where curation matters, and where we can do substantive research firsthand.
        </p>
        <p className="text-gray-700 leading-relaxed">
          We currently cover two areas in depth. Both have distinct profiles. Most buyers find that one is clearly the right fit for them and the other isn&rsquo;t — sometimes for budget reasons, sometimes for lifestyle, sometimes for rental strategy. The wrong area is one of the most common buyer mistakes in Phuket. If you&rsquo;re not sure which area suits you, we&rsquo;d rather have a 10-minute conversation than have you spend three weeks researching the wrong inventory.
        </p>
      </div>

      {/* Area cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

        {/* Rawai & Nai Harn card */}
        <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          {/* Hero image placeholder — brand asset needed: Nai Harn Beach or Promthep Cape photo */}
          <div className="h-56 bg-teal/10 flex items-center justify-center">
            <span className="text-teal/40 text-sm font-medium tracking-wide uppercase">
              Rawai &amp; Nai Harn — hero photo needed
            </span>
          </div>
          <div className="p-8 flex flex-col flex-1">
            <h2 className="font-serif text-3xl font-medium text-gray-900 mb-1">Rawai &amp; Nai Harn</h2>
            <p className="text-gray-500 italic mb-6">Southern Phuket. The quiet end.</p>
            <div className="text-gray-700 leading-relaxed space-y-4 text-sm flex-1">
              <p>
                Phuket&rsquo;s southernmost neighbourhoods — quieter, more residential, more authentic Thai character. International school access is good (UWC, BCIS within 15-25 minutes). Beaches at Nai Harn and Yanui are among the most beautiful and least crowded on the island.
              </p>
              <p>
                Strong long-stay rental market; weaker peak-season short-stay yields than Bang Tao. Entry-level condos from approximately 3M THB; villas commonly 7M-30M THB freehold-equivalent.
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-6 mb-6">
              <span className="font-medium">Best for:</span>{' '}
              long-term residents wanting calm, families with school-age children, buyers prioritising beach access without tourist density, investors prioritising long-stay rental over short-stay.
            </p>
            <div className="flex items-center justify-between">
              {rawaiCount !== null && rawaiCount > 0 && (
                <span className="text-xs text-gray-400">
                  {rawaiCount} project{rawaiCount === 1 ? '' : 's'} we cover
                </span>
              )}
              <Link
                href="/areas/rawai-nai-harn"
                className="ml-auto text-sm font-medium bg-teal text-white px-5 py-3 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                See Rawai &amp; Nai Harn
              </Link>
            </div>
          </div>
        </div>

        {/* Bang Tao card */}
        <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          {/* Hero image placeholder — brand asset needed: Laguna or Layan beach shot */}
          <div className="h-56 bg-teal/10 flex items-center justify-center">
            <span className="text-teal/40 text-sm font-medium tracking-wide uppercase">
              Bang Tao — hero photo needed
            </span>
          </div>
          <div className="p-8 flex flex-col flex-1">
            <h2 className="font-serif text-3xl font-medium text-gray-900 mb-1">Bang Tao</h2>
            <p className="text-gray-500 italic mb-6">Western Phuket. The high-end coast.</p>
            <div className="text-gray-700 leading-relaxed space-y-4 text-sm flex-1">
              <p>
                Phuket&rsquo;s premium resort and beachfront residence area. International-buyer epicentre. Five-star hotel brand concentration — Banyan Tree, Angsana, Outrigger, Andaz, Anantara, and the Laguna Phuket family. Strongest short-stay rental market on the island.
              </p>
              <p>
                International school access excellent (UWC, BCIS within 10-15 minutes). Entry-level condos from approximately 5-7M THB; branded villas commonly 30M-100M+ THB.
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-6 mb-6">
              <span className="font-medium">Best for:</span>{' '}
              investors prioritising rental yield, families with school-age children, buyers wanting walkable beach + resort lifestyle, buyers with budgets over 10M THB for condos or 30M THB for villas.
            </p>
            <div className="flex items-center justify-between">
              {bangTaoCount !== null && bangTaoCount > 0 && (
                <span className="text-xs text-gray-400">
                  {bangTaoCount} project{bangTaoCount === 1 ? '' : 's'} we cover
                </span>
              )}
              <Link
                href="/areas/bang-tao"
                className="ml-auto text-sm font-medium bg-teal text-white px-5 py-3 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                See Bang Tao
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Other areas note */}
      <div className="max-w-2xl mb-16">
        <h2 className="font-serif text-xl font-medium text-gray-900 mb-3">Other areas</h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          We&rsquo;re often asked about Patong, Phuket Town, Kata/Karon, Kamala, and the Mai Khao/Nai Yang area to the north. We have informal coverage of several of these areas but haven&rsquo;t yet completed the editorial work required to publish them as Hawook-curated catalog. We&rsquo;ll add areas as we can do them justice — not before. If you&rsquo;re interested in an area we don&rsquo;t yet cover formally, we can still help in a more informal capacity. Get in touch via WhatsApp.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="bg-cream rounded-xl border border-gray-200 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex-1">
          <p className="font-serif text-xl font-medium text-gray-900 mb-1">Not sure which area fits you?</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Tell us about your situation and we&rsquo;ll help you narrow it down — budget, lifestyle priorities, rental goals, school needs. Takes 10 minutes.
          </p>
        </div>
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-medium bg-teal text-white px-5 py-3 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          WhatsApp us
        </Link>
      </div>
    </div>
  )
}
