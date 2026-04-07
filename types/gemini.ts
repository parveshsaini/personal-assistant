// Types for messages received from the Gemini Live API WebSocket

export type SessionState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error'

export type TranscriptEntry = {
  role: 'user' | 'model'
  text: string
  timestamp: number
}

export type ToolCallPayload = {
  name: string
  id: string
  args: Record<string, unknown>
}
