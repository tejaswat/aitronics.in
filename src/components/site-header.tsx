'use client'
import Link from 'next/link'
import { useContext } from 'react'
import { AuthContext } from '../lib/supabase-provider'
import useCart from '../stores/cart'

export default function SiteHeader() {
  const { user } = useContext(AuthContext)
  const items = useCart((s) => s.items)
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <header className="header">
      <Link className="logo" href="/">
        Fina Storefront
      </Link>
      <nav>
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart ({totalQty})</Link>
        {user ? <Link href="/profile">Profile</Link> : <Link href="/auth/login">Login</Link>}
      </nav>
    </header>
  )
}
