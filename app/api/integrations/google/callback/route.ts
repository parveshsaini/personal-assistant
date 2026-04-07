import { NextRequest, NextResponse } from 'next/server'
import { createOAuthClient } from '@/lib/integrations/google-oauth'
import { upsertCredential } from '@/lib/db/credentials'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=access_denied`
    )
  }

  const client = createOAuthClient()
  const { tokens } = await client.getToken(code)

  await upsertCredential('google', {
    access_token: tokens.access_token ?? null,
    refresh_token: tokens.refresh_token ?? null,
    token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    scopes: tokens.scope ? tokens.scope.split(' ') : null,
  })

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?connected=google`
  )
}
