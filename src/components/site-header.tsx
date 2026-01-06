'use client'
import React, { useContext, useState } from 'react'
import Link from 'next/link'
import { AuthContext } from '../lib/supabase-provider'
import useCart from '../stores/cart'
import HeaderSearch from './header-search'
export default function SiteHeader() {
  const { user } = useContext(AuthContext)
  const items = useCart((s) => s.items)
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)
  // full-width header search
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header id="navbar" className="header">
      <div id="nav-belt">
        <div className="nav-left">
          <Link className="logo" href="/">
            AITRONICS
          </Link>
        </div>

        <div className="nav-fill">
          <div className="nav-search" style={{ width: '100%', maxWidth: 900 }}>
            <div className="nav-search-field">
              <HeaderSearch />
            </div>
          </div>
        </div> 

        <div className="nav-right">
          <div className="nav-div lang">
            <div className="icp-nav-link-inner"><div className="nav-line-2">EN</div></div>
          </div>

          <div className="nav-div account">
            {user ? (
              <Link href="/profile" className="nav-a">
                <div className="nav-line-1">Hello, {user.email?.split('@')[0]}</div>
                <div className="nav-line-2">Account &amp; Lists</div>
              </Link>
            ) : (
              <Link href="/auth/login" className="nav-a">
                <div className="nav-line-1">Hello, sign in</div>
                <div className="nav-line-2">Account &amp; Lists</div>
              </Link>
            )}
          </div>

          <Link href="/cart" className="nav-a nav-cart">
            <div className="nav-cart-inline" style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <span id="nav-cart-count" aria-hidden="true" className="nav-cart-count">{totalQty}</span>
              <span className="nav-cart-icon" />
              <span className="nav-cart-text">Cart</span>
            </div>
          </Link>
        </div>
      </div>

      <div id="nav-main" className="nav-main">
        <button className="burger-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((s) => !s)}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
              <button className="mobile-menu-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>&times;</button>
              <ul className="mobile-menu-list">
                <li><Link href="/fresh">Fresh</Link></li>
                <li><Link href="/products?category=mobiles">Mobiles</Link></li>
                <li><Link href="/products?category=bestsellers">Bestsellers</Link></li>
                <li><Link href="/deals">Today&apos;s Deals</Link></li>
                <li><Link href="/products?category=electronics">Electronics</Link></li>
                <li><Link href="/products?category=home">Home &amp; Kitchen</Link></li>
                <li><Link href="/products?category=books">Books</Link></li>
              </ul>
            </div>
            <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />
          </>
        )}

        <ul className="nav-ul" role="navigation" aria-label="Primary navigation">
          <li className="nav-li"><Link href="/fresh">Fresh</Link></li>
          <li className="nav-li"><Link href="/products?category=mobiles">Mobiles</Link></li>
          <li className="nav-li"><Link href="/products?category=bestsellers">Bestsellers</Link></li>
          <li className="nav-li"><Link href="/deals">Today&apos;s Deals</Link></li>
          <li className="nav-li"><Link href="/products?category=electronics">Electronics</Link></li>
          <li className="nav-li"><Link href="/products?category=home">Home &amp; Kitchen</Link></li>
          <li className="nav-li"><Link href="/products?category=books">Books</Link></li>
        </ul>
      </div>
    </header>
  )
}
