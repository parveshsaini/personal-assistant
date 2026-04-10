import { NextResponse } from 'next/server'
import { getSlackAuthUrl } from '@/lib/integrations/slack-oauth'

export async function GET() {
  const url = getSlackAuthUrl()
  return NextResponse.redirect(url)
}
