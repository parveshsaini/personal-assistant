export type Conversation = {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  modality: 'text' | 'voice' | null
  created_at: string
}

export type IntegrationCredential = {
  integration: 'google' | 'slack' | 'notion' | 'hubspot'
  access_token: string | null
  refresh_token: string | null
  token_expiry: string | null
  scopes: string[] | null
  updated_at: string
}
