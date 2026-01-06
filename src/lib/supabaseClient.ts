import { createClient } from '@supabase/supabase-js'

import { logger } from './logger'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _supabase: any
if (!url || !anonKey) {
  // Do not throw during build-time; provide a helpful runtime error when used.
  logger.warn('Data store env not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) {
    // In production, be strict and throw helpful runtime errors when the client is used.
    const err = () => {
      throw new Error('Data store env not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
    }
    _supabase = {
      from: () => ({
        upsert: async () => err(),
        insert: async () => err(),
        select: () => ({
          eq: () => ({ maybeSingle: async () => err(), single: async () => err() }),
          maybeSingle: async () => err(),
          single: async () => err()
        })
      }),
      auth: {
        signInWithPassword: async () => err(),
        signUp: async () => err(),
        getSession: async () => err(),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    }
  } else {
    // During local development and builds, return non-throwing stubs so prerendering doesn't crash.
    _supabase = {
      from: () => ({
        upsert: async () => ({ data: null, error: new Error('Data store not configured') }),
        insert: async () => ({ data: null, error: new Error('Data store not configured') }),
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: new Error('Data store not configured') }), single: async () => ({ data: null, error: new Error('Data store not configured') }) }),
          maybeSingle: async () => ({ data: null, error: new Error('Data store not configured') }),
          single: async () => ({ data: null, error: new Error('Data store not configured') })
        })
      }),
      auth: {
        signInWithPassword: async () => ({ error: new Error('Data store not configured') }),
        signUp: async () => ({ error: new Error('Data store not configured') }),
        getSession: async () => ({ data: null, error: new Error('Data store not configured') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    }
  }
} else {
  _supabase = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  })
}

export const supabase = _supabase
