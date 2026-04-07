export type ToolExecuteRequest = {
  name: string
  id: string
  args: Record<string, unknown>
}

export type ToolExecuteResponse = {
  id: string
  name: string
  result: unknown
  error?: string
}
