import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-xl font-semibold text-gray-900">
              Hawook
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Independent Phuket property reviews. No agents. No commissions. No spin.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Explore</p>
            <ul className="space-y-2">
              <li><Link href="/projects" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Projects</Link></li>
              <li><Link href="/areas/rawai-nai-harn" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Rawai &amp; Nai Harn</Link></li>
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Contact</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://wa.me/66805100129"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  WhatsApp Yogi
                </a>
              </li>
              <li>
                <a href="mailto:yogi@hawook.com" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  yogi@hawook.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Hawook Property Consultancy. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Independent property research — not a licensed estate agent.
          </p>
        </div>
      </div>
    </footer>
  )
}
