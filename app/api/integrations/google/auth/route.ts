import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/integrations/google-oauth'

export async function GET() {
  const url = getAuthUrl()
  return NextResponse.redirect(url)
}
