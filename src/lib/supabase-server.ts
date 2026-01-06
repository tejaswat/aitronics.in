import { createClient } from '@supabase/supabase-js'

if (typeof window !== 'undefined') {
  throw new Error('supabaseServer is server-only')
}

// Server-side client for secure operations (do not import into client components)
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) throw new Error('Missing Supabase service role key for server')

export const supabaseServer = createClient(url, serviceKey, {
  auth: { persistSession: false }
})
