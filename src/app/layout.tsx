import './globals.css'
import type { ReactNode } from 'react'
import { SupabaseProvider } from '../lib/supabase-provider'
import SiteHeader from '../components/site-header'

export const metadata = {
  title: 'Fina Storefront',
  description: 'Secure e-commerce storefront powered by Supabase on gateway.thefina.com',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Fina Storefront',
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
            <footer className="footer">
              <p className="muted">Secure checkout • Rate limited • RLS enforced</p>
            </footer>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
