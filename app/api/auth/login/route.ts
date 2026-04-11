import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, getExpectedToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { username = '', password = '' } = body

  if (!verifyCredentials(username, password)) {
    // Same error message for invalid user OR invalid password to prevent user enumeration
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = getExpectedToken()
  const response = NextResponse.json({ success: true })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return response
}
