import './globals.css'
import type { ReactNode } from 'react'
import { SupabaseProvider } from '../lib/supabase-provider'
import SiteHeader from '../components/site-header.server'

export const metadata = {
  title: 'AITRONICS',
  description: 'AITRONICS — modern hardware storefront powered by Supabase',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AITRONICS',
    description: 'Secure commerce, modern experience.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <div className="shell">
            <SiteHeader />
            <main className="app-container">{children}</main>

            <footer className="footer footer-giant">
              <div className="footer-inner">
                <div className="footer-brand">
                  <h2>AITRONICS</h2>
                  <p className="muted">Modern hardware for makers, engineers & creators. Fast, secure, and backed by Supabase.</p>
                  <form className="footer-search" action="/products" method="get">
                    <input name="q" placeholder="Search all products…" aria-label="Search products" />
                    <button type="submit">Search</button>
                  </form>
                </div>

                <div className="footer-links footer-columns">
                  <div>
                    <h4>Electronics</h4>
                    <ul>
                      <li><a href="/products?q=microcontrollers">Microcontrollers</a></li>
                      <li><a href="/products?q=sensors">Sensors</a></li>
                      <li><a href="/products?q=connectors">Connectors & Cables</a></li>
                      <li><a href="/products?q=power">Power & Batteries</a></li>
                    </ul>
                  </div>

                  <div>
                    <h4>Embedded</h4>
                    <ul>
                      <li><a href="/products?q=embedded-kits">Embedded Kits</a></li>
                      <li><a href="/products?q=boards">Development Boards</a></li>
                      <li><a href="/products?q=firmware">Firmware Tools</a></li>
                      <li><a href="/products?q=rtos">RTOS & Middleware</a></li>
                    </ul>
                  </div>

                  <div>
                    <h4>Subsystems</h4>
                    <ul>
                      <li><a href="/products?q=wireless">Wireless Modules</a></li>
                      <li><a href="/products?q=display">Displays & UI</a></li>
                      <li><a href="/products?q=motor">Actuation & Motors</a></li>
                      <li><a href="/products?q=power-management">Power Management</a></li>
                    </ul>
                  </div>

                  <div>
                    <h4>Knowledge</h4>
                    <ul>
                      <li><a href="/docs/getting-started">Getting Started</a></li>
                      <li><a href="/docs/tutorials">Tutorials</a></li>
                      <li><a href="/docs/schematics">Reference Schematics</a></li>
                      <li><a href="/docs/faqs">FAQs</a></li>
                    </ul>
                  </div>

                  <div>
                    <h4>Support</h4>
                    <ul>
                      <li><a href="/support/contact">Contact Us</a></li>
                      <li><a href="/support/returns">Returns & Warranty</a></li>
                      <li><a href="/support/shipping">Shipping</a></li>
                      <li><a href="/support/legal">Legal</a></li>
                    </ul>
                  </div>

                  <div>
                    <h4>Community</h4>
                    <ul>
                      <li><a href="/community/forum">Forum</a></li>
                      <li><a href="/community/projects">Projects</a></li>
                      <li><a href="/community/events">Events</a></li>
                      <li><a href="/blog">Blog</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="footer-bottom">
                <p className="muted">© {new Date().getFullYear()} AITRONICS — Secure checkout • Rate limited • RLS enforced</p>
              </div>
            </footer>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
