import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.nextUrl.protocol !== 'https:') {
    const url = req.nextUrl.clone()
    url.protocol = 'https:'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: '/((?!_next/static|_next/image|favicon.ico).*)' }
