import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found | Hawook',
}

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-4">404</p>
      <h1 className="font-serif text-3xl sm:text-4xl font-medium text-gray-900 mb-4">
        Page not found
      </h1>
      <p className="text-gray-500 mb-10 leading-relaxed">
        This page doesn&apos;t exist or has been moved. Try one of these instead:
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        <Link
          href="/projects"
          className="inline-flex items-center justify-center bg-teal text-white font-medium px-6 py-3 rounded-md hover:bg-teal-dark transition-colors"
        >
          Browse projects
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-md hover:border-gray-400 transition-colors"
        >
          Go home
        </Link>
      </div>
      <div className="text-left max-w-xs mx-auto">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Useful links</p>
        <ul className="space-y-2">
          <li>
            <Link href="/projects" className="text-sm text-teal hover:text-teal-dark transition-colors">
              → All projects
            </Link>
          </li>
          <li>
            <Link href="/areas/rawai-nai-harn" className="text-sm text-teal hover:text-teal-dark transition-colors">
              → Rawai &amp; Nai Harn area guide
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-sm text-teal hover:text-teal-dark transition-colors">
              → About Hawook
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
