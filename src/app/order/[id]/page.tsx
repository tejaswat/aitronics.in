'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

type Order = {
  id: string
  status: string
  total: number
  created_at: string
  order_items: { product_id: string; quantity: number; unit_price: number }[]
}

export default function OrderDetail() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = params?.id as string
    if (!id) return
    supabase
      .from('aitronics_storefront.orders')
      .select('id,status,total,created_at,order_items(order_id,product_id,quantity,unit_price)')
      .eq('id', id)
      .maybeSingle()
      .then((res: { data: any; error: any }) => {
        const { data, error } = res
        if (error) {
          setError(error.message)
        } else if (!data) {
          setError('Not found')
        } else {
          setOrder(data as Order)
        }
      })
  }, [params])

  if (error) return <div role="alert">{error}</div>
  if (!order) return <p>Loading order…</p>

  return (
    <div>
      <button className="button ghost" onClick={()=>router.push('/profile')}>Back to profile</button>
      <h2>Order #{order.id}</h2>
      <p className="muted">Status: {order.status}</p>
      <p><strong>Total:</strong> ${(order.total / 100).toFixed(2)}</p>
      <h4>Items</h4>
      <ul>
        {order.order_items?.map((i) => (
          <li key={`${i.product_id}-${i.quantity}`}>
            {i.product_id} — {i.quantity} × ${(i.unit_price / 100).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  )
}
