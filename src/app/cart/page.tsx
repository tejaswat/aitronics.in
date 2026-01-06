'use client'
import React from 'react'
import useCart from '../../stores/cart'
import Link from 'next/link'

export default function CartPage(){
  const items = useCart(s=>s.items)
  const setQty = useCart(s=>s.setQuantity)
  const remove = useCart(s=>s.remove)
  const total = items.reduce((s,i)=>s + i.price * i.quantity, 0)
  return (
    <div>
      <h2>Cart</h2>
      {items.length === 0 ? <p>Your cart is empty. <Link href="/products">Shop products</Link></p> : (
        <div>
          {items.map(i=> (
            <div key={i.id} style={{borderBottom:'1px solid #1e2230',padding:8,display:'flex',alignItems:'center',gap:12}}>
              <strong>{i.name}</strong>
              <input
                aria-label={`quantity-${i.name}`}
                type="number"
                min={1}
                value={i.quantity}
                onChange={(e)=>setQty(i.id, Number(e.target.value))}
                style={{width:60}}
              />
              <span className="muted">${(i.price/100).toFixed(2)} each</span>
              <button className="button ghost" onClick={()=>remove(i.id)}>Remove</button>
            </div>
          ))}
          <h3>Total: ${(total/100).toFixed(2)}</h3>
          <Link href="/checkout">Proceed to checkout</Link>
        </div>
      )}
    </div>
  )
}
