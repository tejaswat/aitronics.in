import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { logger } from './logger'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null

function getClient() {
  if (!supabase) {
    logger.warn('Data store env not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
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
  try {
    const { data, error } = await client.from('aitronics_storefront.categories').select('*').order('name', { ascending: true })
    if (error) {
      logger.warn('getCategories DB error', error)
      return []
    }
    return (data || []) as Category[]
  } catch (e: any) {
    logger.warn('getCategories failed', e)
    return []
  }
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
  try {
    let query = client.from('aitronics_storefront.products').select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1)
    if (category) query = query.eq('category_id', category)
    if (search) query = query.ilike('name', `%${search}%`)
    const { data, error } = await query
    if (error) {
      logger.warn('getProducts DB error', error)
      return []
    }
    return (data || []) as Product[]
  } catch (e: any) {
    logger.warn('getProducts failed', e)
    return []
  }
}

export async function getProduct(id: string) {
  const client = getClient()
  if (!client) return null
  try {
    const { data, error } = await client.from('aitronics_storefront.products').select('*').eq('id', id).single()
    if (error) {
      logger.warn('getProduct DB error', error)
      return null
    }
    return data as Product
  } catch (e: any) {
    logger.warn('getProduct failed', e)
    return null
  }
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string) {
  const client = getClient()
  if (!categoryId) return []
  if (!client) return []
  try {
    const { data, error } = await client
      .from('aitronics_storefront.products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .limit(4)
    if (error) {
      logger.warn('getRelatedProducts DB error', error)
      return []
    }
    return (data || []) as Product[]
  } catch (e: any) {
    logger.warn('getRelatedProducts failed', e)
    return []
  }
}
