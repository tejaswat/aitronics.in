'use client'
import React, {useState} from 'react'
import useCart from '../../stores/cart'
import { supabase } from '../../lib/supabaseClient'
import axios from 'axios'
import { z } from 'zod'

const ShippingSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  postal: z.string().min(3)
})

type Shipping = z.infer<typeof ShippingSchema>

export default function Checkout(){
  const items = useCart(s=>s.items)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<Shipping>({ name: '', address: '', city: '', postal: '' })
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleCheckout(){
    setLoading(true); setError(null); setValidationError(null)
    // Client-side validation
    const parsed = ShippingSchema.safeParse(shipping)
    if (!parsed.success) {
      setValidationError('Please fill valid shipping details')
      setLoading(false)
      return
    }

    try{
      // Acquire user session token (if any) for server-side validation
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token ?? null

      // Validate items shape
      const payloadItems = items.map(i=>({ product_id: i.id, quantity: i.quantity, unit_price: i.price }))

      const res = await axios.post('/api/checkout', { items: payloadItems, shipping }, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      if(res.data?.orderId){
        // clear cart and redirect to success page
        useCart.getState().clear()
        window.location.href = `/order/${res.data.orderId}`
      } else {
        setError('Checkout failed')
      }
    }catch(e:any){ setError(e.response?.data?.error || e.message || 'Checkout error') }
    setLoading(false)
  }

  const total = items.reduce((s,i)=>s + i.price * i.quantity, 0)

  return (
    <div>
      <h2>Checkout</h2>
      <section aria-label="order-summary">
        <h3>Order Summary</h3>
        {items.length===0 ? <p>Your cart is empty</p> : (
          <ul>
            {items.map(i=> <li key={i.id}>{i.name} × {i.quantity} — ${(i.price/100).toFixed(2)}</li>)}
          </ul>
        )}
        <p><strong>Total: ${(total/100).toFixed(2)}</strong></p>
      </section>

      <section aria-label="shipping">
        <h3>Shipping</h3>
        <label>
          Name
          <input aria-label="shipping-name" value={shipping.name} onChange={(e)=>setShipping({...shipping, name: e.target.value})} />
        </label>
        <label>
          Address
          <input aria-label="shipping-address" value={shipping.address} onChange={(e)=>setShipping({...shipping, address: e.target.value})} />
        </label>
        <label>
          City
          <input aria-label="shipping-city" value={shipping.city} onChange={(e)=>setShipping({...shipping, city: e.target.value})} />
        </label>
        <label>
          Postal
          <input aria-label="shipping-postal" value={shipping.postal} onChange={(e)=>setShipping({...shipping, postal: e.target.value})} />
        </label>
        {validationError && <div role="alert" style={{color:'red'}}>{validationError}</div>}
      </section>

      {error && <div role="alert" style={{color:'red'}}>{error}</div>}
      <button aria-label="pay-button" disabled={loading || items.length===0} onClick={handleCheckout}>{loading ? 'Processing…' : 'Pay'}</button>
    </div>
  )
}
