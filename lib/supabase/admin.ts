import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side only — never import in client components.
// Lazy proxy: defers createClient() until first property access so module-level
// imports don't throw during Next.js build-time static analysis.
let _client: SupabaseClient | null = null

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!_client) {
      _client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
    }
    return Reflect.get(_client, prop, receiver)
  },
})
