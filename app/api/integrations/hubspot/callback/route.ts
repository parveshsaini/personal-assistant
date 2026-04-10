import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/integrations/hubspot-oauth'
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
    const { access_token, refresh_token, expires_in } = await exchangeCodeForToken(code)
    const expiry = new Date(Date.now() + expires_in * 1000).toISOString()

    await upsertCredential('hubspot', {
      access_token,
      refresh_token,
      token_expiry: expiry,
      scopes: [
        'crm.objects.contacts.read',
        'crm.objects.contacts.write',
        'crm.objects.deals.read',
        'crm.objects.deals.write',
        'crm.objects.companies.read',
        'tickets',
      ],
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?connected=hubspot`
    )
  } catch (err) {
    console.error('[HubSpot callback]', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=token_exchange_failed`
    )
  }
}
