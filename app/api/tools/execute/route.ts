import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { routeTool } from '@/lib/tools/router'

const schema = z.object({
  name: z.string().min(1),
  id: z.string().min(1),
  args: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, id, args = {} } = parsed.data

  // Always return a result — never let Gemini hang waiting for a toolResponse
  try {
    const result = await routeTool(name, args)
    return NextResponse.json({ id, result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ id, result: { error: message } })
  }
}
