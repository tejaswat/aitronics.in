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
          <div className="nav-search" style={{ width: '100%', maxWidth: 1100 }}>
            <div className="nav-search-field">
              <HeaderSearch />
            </div>
          </div>
        </div> 

        <div className="nav-right">
          <div className="nav-div lang">
            <div className="icp-nav-link-inner" style={{display:'flex',alignItems:'center',gap:8}}>
              <svg className="half-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 4v2a1 1 0 002 0V6a1 1 0 00-2 0zm-4 6h2a1 1 0 000-2H7a1 1 0 000 2zm10 0h-2a1 1 0 010-2h2a1 1 0 010 2z" fill="currentColor"/></svg>
              <div className="nav-line-2">EN</div>
            </div>
          </div>

          <div className="nav-div account">
            {user ? (
              <Link href="/profile" className="nav-a">
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <svg className="half-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" opacity=".9"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="currentColor" opacity=".9"/></svg>
                  <div>
                    <div className="nav-line-1">Hello, {user.email?.split('@')[0]}</div>
                    <div className="nav-line-2">Account &amp; Lists</div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="nav-auth" role="group" aria-label="Authentication">
                <Link href="/auth/login" className="nav-a">
                  <div className="nav-inline">
                    <svg className="half-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="currentColor"/></svg>
                    <div className="nav-line-1">Login</div>
                  </div>
                </Link>

                <Link href="/auth/login?mode=signup" className="nav-a nav-signup">
                  <div className="nav-inline">
                    <svg className="half-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" fill="currentColor"/><path d="M4 20c0-3.314 2.686-6 6-6h.5" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M20 16v4" stroke="currentColor" strokeWidth="1.4"/><path d="M22 18h-4" stroke="currentColor" strokeWidth="1.4"/></svg>
                    <div className="nav-line-1">Signup</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link href="/cart" className="nav-a nav-cart" aria-label="Cart, view items">
            <div className="nav-cart-inline" style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <span id="nav-cart-count" aria-hidden="true" className="nav-cart-count">{totalQty}</span>
              <svg className="half-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="20" r="1" fill="currentColor"/><circle cx="18" cy="20" r="1" fill="currentColor"/></svg>
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
