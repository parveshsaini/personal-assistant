'use client'

import { useCallback } from 'react'
import type { ToolCallPayload } from '@/types/gemini'

export function useToolExecutor() {
  const execute = useCallback(async (call: ToolCallPayload): Promise<unknown> => {
    const res = await fetch('/api/tools/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: call.name, id: call.id, args: call.args }),
    })
    const json = await res.json()
    if (json.error) throw new Error(JSON.stringify(json.error))
    return json.result
  }, [])

  return execute
}
