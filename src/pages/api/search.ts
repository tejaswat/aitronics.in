import type { NextApiRequest, NextApiResponse } from 'next'
import { getProducts } from '../../lib/actions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query.q as string) || ''
  if (!q || q.trim().length === 0) return res.status(200).json([])

  try {
    const results = await getProducts({ limit: 10, offset: 0, search: q })
    const mapped = (results || []).map((p) => ({ id: p.id, name: p.name, price: p.price }))
    return res.status(200).json(mapped)
  } catch (e) {
    return res.status(500).json({ error: 'search_failed' })
  }
}
