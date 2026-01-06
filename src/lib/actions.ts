import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null

function getClient() {
  if (!supabase) {
    console.error('Supabase env not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category_id: string | null
  currency: string
  stock: number
  metadata?: Record<string, any>
}

export type Category = { id: string; name: string; slug: string }

export async function getCategories() {
  const client = getClient()
  if (!client) return []
  const { data, error } = await client.from('categories').select('*').order('name', { ascending: true })
  if (error) throw error
  return data as Category[]
}

export async function getProducts({
  limit = 12,
  offset = 0,
  category,
  search
}: {
  limit?: number
  offset?: number
  category?: string | null
  search?: string | null
}) {
  const client = getClient()
  if (!client) return []
  let query = client.from('products').select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1)
  if (category) query = query.eq('category_id', category)
  if (search) query = query.ilike('name', `%${search}%`)
  const { data, error } = await query
  if (error) throw error
  return (data || []) as Product[]
}

export async function getProduct(id: string) {
  const client = getClient()
  if (!client) throw new Error('Supabase env not configured')
  const { data, error } = await client.from('products').select('*').eq('id', id).single()
  if (error) throw error
  return data as Product
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string) {
  const client = getClient()
  if (!categoryId) return []
  if (!client) return []
  const { data } = await client
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(4)
  return (data || []) as Product[]
}
