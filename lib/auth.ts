import { createHmac, timingSafeEqual } from 'crypto'

export const COOKIE_NAME = '__auth_token'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Derives the expected session token from AUTH_SECRET.
 * Changing AUTH_SECRET invalidates all existing sessions.
 */
export function getExpectedToken(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET env var is not set')
  return createHmac('sha256', secret).update('authenticated').digest('hex')
}

/**
 * Timing-safe credential verification to prevent timing attacks.
 */
export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.AUTH_USERNAME ?? ''
  const expectedPass = process.env.AUTH_PASSWORD ?? ''

  if (!expectedUser || !expectedPass) return false

  try {
    const userBuf = Buffer.from(username)
    const passBuf = Buffer.from(password)
    const expectedUserBuf = Buffer.from(expectedUser)
    const expectedPassBuf = Buffer.from(expectedPass)

    // Both must match — must compare even if lengths differ to avoid early exit
    const userLenMatch = userBuf.length === expectedUserBuf.length
    const passLenMatch = passBuf.length === expectedPassBuf.length

    // Pad shorter buffers to same length to allow timingSafeEqual call
    const userA = userLenMatch ? userBuf : Buffer.alloc(expectedUserBuf.length)
    const passA = passLenMatch ? passBuf : Buffer.alloc(expectedPassBuf.length)

    const userOk = userLenMatch && timingSafeEqual(userA, expectedUserBuf)
    const passOk = passLenMatch && timingSafeEqual(passA, expectedPassBuf)

    return userOk && passOk
  } catch {
    return false
  }
}

/**
 * Timing-safe token comparison used in proxy.ts.
 */
export function verifyToken(token: string): boolean {
  try {
    const expected = getExpectedToken()
    const tokenBuf = Buffer.from(token)
    const expectedBuf = Buffer.from(expected)
    if (tokenBuf.length !== expectedBuf.length) return false
    return timingSafeEqual(tokenBuf, expectedBuf)
  } catch {
    return false
  }
}
