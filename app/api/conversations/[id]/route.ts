import { NextResponse } from 'next/server'
import { getMessages, updateConversationTitle, appendMessage } from '@/lib/db/conversations'

export async function GET(_req: Request, ctx: RouteContext<'/api/conversations/[id]'>) {
  try {
    const { id } = await ctx.params
    const messages = await getMessages(id)
    return NextResponse.json(messages)
  } catch (err) {
    console.error('[GET /api/conversations/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/conversations/[id]'>) {
  try {
    const { id } = await ctx.params
    const { title } = await request.json()
    if (typeof title !== 'string') {
      return NextResponse.json({ error: 'title must be a string' }, { status: 400 })
    }
    await updateConversationTitle(id, title)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/conversations/[id]]', err)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}

export async function POST(request: Request, ctx: RouteContext<'/api/conversations/[id]'>) {
  try {
    const { id } = await ctx.params
    const { role, content, modality } = await request.json()
    const message = await appendMessage(id, role, content, modality)
    return NextResponse.json(message, { status: 201 })
  } catch (err) {
    console.error('[POST /api/conversations/[id]]', err)
    return NextResponse.json({ error: 'Failed to append message' }, { status: 500 })
  }
}
