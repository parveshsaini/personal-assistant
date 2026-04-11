import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE_NAME = '__auth_token'

// Public paths that don't require authentication
const PUBLIC_PREFIXES = ['/login', '/api/auth/login', '/api/auth/logout']

function getExpectedToken(): string | null {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null
  return createHmac('sha256', secret).update('authenticated').digest('hex')
}

function isValidToken(token: string): boolean {
  const expected = getExpectedToken()
  if (!expected) return false
  try {
    const tokenBuf = Buffer.from(token)
    const expectedBuf = Buffer.from(expected)
    if (tokenBuf.length !== expectedBuf.length) return false
    return timingSafeEqual(tokenBuf, expectedBuf)
  } catch {
    return false
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static assets and public paths
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token || !isValidToken(token)) {
    const loginUrl = new URL('/login', request.url)
    // Preserve the original URL so we can redirect back after login
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
