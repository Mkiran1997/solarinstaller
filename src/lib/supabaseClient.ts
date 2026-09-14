import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev/build rather than silently talking to `undefined`.
  throw new Error(
    'Missing Supabase env vars. Copy .env.local.example to .env.local and fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project settings.',
  )
}

// Only the public anon key is ever used client-side. Row Level Security in
// Postgres (see supabase/schema.sql) is what actually keeps one user's data
// away from another — this key alone grants no special access.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
