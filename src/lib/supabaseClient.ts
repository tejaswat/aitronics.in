import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _supabase: any
if (!url || !anonKey) {
  // Do not throw during build-time; provide a helpful runtime error when used.
  // This avoids failing Next.js prerendering when envs are not set in the build environment.
  console.warn('Supabase env not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  // Minimal stub that surfaces helpful errors at runtime when someone attempts to use the client.
  _supabase = {
    from: () => ({
      upsert: async () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: new Error('Supabase not configured') }), single: async () => ({ data: null, error: new Error('Supabase not configured') }) }),
        maybeSingle: async () => ({ data: null, error: new Error('Supabase not configured') }),
        single: async () => ({ data: null, error: new Error('Supabase not configured') })
      })
    }),
    auth: {
      signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
      signUp: async () => ({ error: new Error('Supabase not configured') })
    }
  }
} else {
  _supabase = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  })
}

export const supabase = _supabase
