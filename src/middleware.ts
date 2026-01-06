import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Enforce HTTPS in production, but allow health checks and localhost to use http
  const pathname = req.nextUrl.pathname

  // allow internal health check or localhost to bypass HTTPS enforcement
  if (pathname === '/api/health' || req.nextUrl.hostname === 'localhost' || req.headers.get('x-internal-health') === '1') {
    return NextResponse.next()
  }

  if (process.env.NODE_ENV === 'production' && req.nextUrl.protocol !== 'https:') {
    const url = req.nextUrl.clone()
    url.protocol = 'https:'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = { matcher: '/((?!_next/static|_next/image|favicon.ico).*)' }
