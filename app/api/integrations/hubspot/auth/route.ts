import { NextResponse } from 'next/server'
import { getHubSpotAuthUrl } from '@/lib/integrations/hubspot-oauth'

export async function GET() {
  const url = getHubSpotAuthUrl()
  return NextResponse.redirect(url)
}
