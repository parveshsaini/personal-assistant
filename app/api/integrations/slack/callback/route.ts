import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, storeSlackCredential } from '@/lib/integrations/slack-oauth'

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
    await storeSlackCredential(access_token, [
      'channels:read',
      'channels:history',
      'groups:read',
      'groups:history',
      'chat:write',
      'search:read',
      'users:read',
    ])

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?connected=slack`
    )
  } catch (err) {
    console.error('[Slack callback]', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=token_exchange_failed`
    )
  }
}
