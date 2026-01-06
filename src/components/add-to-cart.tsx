'use client'
import React from 'react'
import useCart from '../stores/cart'
import type { Product } from '../lib/actions'

export default function AddToCartButton({product}:{product:Product}){
  const add = useCart(state=>state.add)
  const disabled = product.stock <= 0
  return (
    <button
      className="button primary"
      disabled={disabled}
      onClick={()=>add({id:product.id,name:product.name,price:product.price,quantity:1})}
      aria-label={`Add ${product.name} to cart`}
    >
      {disabled ? 'Sold out' : 'Add to cart'}
    </button>
  )
}
