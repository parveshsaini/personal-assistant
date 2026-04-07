import { createServerClient, createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

// Server-side DB client for API routes and server components.
// Single-user app with no RLS — no cookie-based sessions needed, so we use no-op cookies.
// Lazily instantiated to avoid build-time env var errors.
let _db: ReturnType<typeof createServerClient> | null = null

export function getDb() {
  if (!_db) {
    if (!url || !key) {
      throw new Error('Supabase env vars not set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)')
    }
    _db = createServerClient(url, key, {
      cookies: { getAll: () => [], setAll: () => {} },
    })
  }
  return _db
}

// Client-side Supabase instance (browser only)
export function createBrowserDb() {
  return createBrowserClient(url, key)
}
