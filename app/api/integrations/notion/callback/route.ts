import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/integrations/notion-oauth'
import { upsertCredential } from '@/lib/db/credentials'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=access_denied`
    )
  }

  try {
    const { access_token } = await exchangeCodeForToken(code)

    // Notion tokens never expire
    await upsertCredential('notion', {
      access_token,
      refresh_token: null,
      token_expiry: null,
      scopes: ['read_content', 'update_content', 'insert_content'],
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?connected=notion`
    )
  } catch (err) {
    console.error('[Notion callback]', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=token_exchange_failed`
    )
  }
}
