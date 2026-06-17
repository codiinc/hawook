'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'public-content', label: 'Public Content' },
  { key: 'structured-data', label: 'Structured Data' },
  { key: 'score', label: 'Hawook Score' },
  { key: 'updates', label: 'Updates' },
  { key: 'media', label: 'Media' },
  { key: 'documents', label: 'Documents' },
  { key: 'followers', label: 'Followers' },
]

export default function TabNav({ slug }: { slug: string }) {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200 mb-6 -mx-0">
      <nav className="-mb-px flex overflow-x-auto">
        {TABS.map(tab => {
          const href = `/admin/projects/${slug}/${tab.key}`
          const active = pathname === href
          return (
            <Link
              key={tab.key}
              href={href}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                active
                  ? 'border-teal text-teal'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
