import { NextResponse } from 'next/server'
import { getNotionAuthUrl } from '@/lib/integrations/notion-oauth'

export async function GET() {
  const url = getNotionAuthUrl()
  return NextResponse.redirect(url)
}
