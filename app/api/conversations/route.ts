import { NextResponse } from 'next/server'
import { listConversations, createConversation } from '@/lib/db/conversations'

export async function GET() {
  try {
    const conversations = await listConversations()
    return NextResponse.json(conversations)
  } catch (err) {
    console.error('[GET /api/conversations]', err)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const conversation = await createConversation(body.title)
    return NextResponse.json(conversation, { status: 201 })
  } catch (err) {
    console.error('[POST /api/conversations]', err)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
