import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { logger } from '../../lib/logger'

// API proxy to the Supabase Edge Function. Does not expose service role keys.
const PayloadSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().positive(),
      unit_price: z.number().positive()
    })
  ),
  shipping: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    postal: z.string().min(3)
  })
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const parse = PayloadSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'invalid_payload' })

  const auth = req.headers.authorization

  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        ...(auth ? { Authorization: auth } : {})
      },
      body: JSON.stringify(parse.data)
    })
    const data = await r.json()
    return res.status(r.status).json(data)
  } catch (e: any) {
    logger.error('Checkout API error', e)
    return res.status(500).json({ error: 'server_error' })
  }
}
