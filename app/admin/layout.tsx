import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export const metadata = { title: 'Admin — Hawook' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!isAdmin(user?.email)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              ← Back to site
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/admin" className="text-sm font-medium text-gray-900">
              Admin
            </Link>
          </div>
          <span className="text-xs text-gray-400">{user?.email}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </div>
  )
}
