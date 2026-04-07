import { NextResponse } from 'next/server'
import { createEphemeralToken } from '@/lib/gemini/token'

export async function POST() {
  try {
    const token = await createEphemeralToken()
    return NextResponse.json({ token })
  } catch (err) {
    console.error('[/api/gemini/token]', err)
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }
}
