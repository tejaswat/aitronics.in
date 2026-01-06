/* eslint-disable no-console */
// Supabase Edge Function (Deno) - Checkout
// Validates cart, enforces rate limits, verifies prices/stock, and creates orders atomically.

import { serve } from 'std/server'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const RATE_LIMIT = 10 // max requests/minute

function logError(...args: unknown[]) {
  if (Deno && Deno.env && Deno.env.get('ENV') !== 'production') {
    console.error(...(args as any))
  }
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  logError('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

type CartItem = { product_id: string; quantity: number; unit_price: number }
type Shipping = { name: string; address: string; city: string; postal: string }

async function getUserFromToken(token: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY }
  })
  if (!res.ok) return null
  const user = await res.json()
  return user?.id ?? null
}

async function rateLimit(key: string) {
  const rlRes = await fetch(`${SUPABASE_URL}/rest/v1/request_rate_limits?key=eq.${encodeURIComponent(key)}`, {
    headers: { apikey: SERVICE_KEY }
  })
  const rows = await rlRes.json()
  const now = new Date()
  const windowStart = now.toISOString()

  if (rows.length > 0) {
    const row = rows[0]
    const ws = new Date(row.window_start)
    const diffSeconds = (now.getTime() - ws.getTime()) / 1000
    if (diffSeconds < 60) {
      if (row.requests >= RATE_LIMIT) {
        return false
      }
      await fetch(`${SUPABASE_URL}/rest/v1/request_rate_limits?id=eq.${row.id}`, {
        method: 'PATCH',
        headers: { apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: row.requests + 1 })
      })
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/request_rate_limits?id=eq.${row.id}`, {
        method: 'PATCH',
        headers: { apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: 1, window_start: windowStart })
      })
    }
  } else {
    await fetch(`${SUPABASE_URL}/rest/v1/request_rate_limits`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, window_start: windowStart, requests: 1 })
    })
  }
  return true
}

function validateItems(items: any): CartItem[] {
  if (!Array.isArray(items) || items.length === 0) throw new Error('empty_cart')
  const mapped: CartItem[] = []
  for (const item of items) {
    const { product_id, quantity, unit_price } = item
    if (typeof product_id !== 'string' || !product_id) throw new Error('invalid_product_id')
    if (typeof quantity !== 'number' || quantity <= 0) throw new Error('invalid_quantity')
    if (typeof unit_price !== 'number' || unit_price <= 0) throw new Error('invalid_unit_price')
    mapped.push({ product_id, quantity, unit_price })
  }
  return mapped
}

function validateShipping(shipping: any): Shipping {
  const fields = ['name', 'address', 'city', 'postal'] as const
  if (!shipping || typeof shipping !== 'object') throw new Error('invalid_shipping')
  for (const f of fields) {
    if (typeof shipping[f] !== 'string' || shipping[f].trim().length < (f === 'postal' ? 3 : 2)) throw new Error('invalid_shipping')
  }
  return shipping as Shipping
}

async function verifyProducts(items: CartItem[]) {
  const ids = items.map((i) => i.product_id).join(',')
  const productsRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=in.(${ids})`, {
    headers: { apikey: SERVICE_KEY }
  })
  if (!productsRes.ok) throw new Error('product_fetch_failed')
  const products = await productsRes.json()
  for (const item of items) {
    const product = products.find((p: any) => p.id === item.product_id)
    if (!product) throw new Error(`product_not_found:${item.product_id}`)
    if (product.price !== item.unit_price) throw new Error(`price_mismatch:${item.product_id}`)
    if (product.stock < item.quantity) throw new Error(`out_of_stock:${item.product_id}`)
  }
}

async function processPayment(_items: CartItem[], _shipping: Shipping) {
  // Placeholder for Stripe/other provider integration; return success for now.
  return { status: 'authorized', reference: 'test-ref' }
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!(await rateLimit(`ip:${ip}`))) {
      return new Response(JSON.stringify({ error: 'rate_limit_exceeded' }), { status: 429 })
    }

    const auth = req.headers.get('authorization')
    let userId: string | null = null
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.split(' ')[1]
      userId = await getUserFromToken(token)
      if (userId && !(await rateLimit(`user:${userId}`))) {
        return new Response(JSON.stringify({ error: 'rate_limit_exceeded' }), { status: 429 })
      }
    }

    const body = await req.json()
    const items = validateItems(body.items)
    const shipping = validateShipping(body.shipping)

    await verifyProducts(items)

    // Run payment before writing order (stubbed to always succeed)
    const paymentResult = await processPayment(items, shipping)
    if (paymentResult.status !== 'authorized') {
      return new Response(JSON.stringify({ error: 'payment_failed' }), { status: 402 })
    }

    const payload = { p_user: userId, p_items: JSON.stringify(items), p_shipping: shipping }
    const orderRes = await fetch(`${SUPABASE_URL}/rpc/create_order_with_items`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!orderRes.ok) {
      const err = await orderRes.text()
      return new Response(JSON.stringify({ error: 'order_creation_failed', detail: err }), { status: 400 })
    }

    const orderId = (await orderRes.text()).replace(/"/g, '').trim()
    return new Response(JSON.stringify({ orderId, payment_reference: paymentResult.reference }), { status: 200 })
  } catch (err) {
    logError(err)
    const message = err instanceof Error ? err.message : 'server_error'
    const clientErrorPrefixes = ['product_not_found', 'price_mismatch', 'out_of_stock', 'invalid_', 'empty_cart']
    const status = clientErrorPrefixes.some((p) => message.startsWith(p)) ? 400 : 500
    return new Response(JSON.stringify({ error: message }), { status })
  }
})
